const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '../..')
const frontendRoot = path.join(repoRoot, 'frontend', 'src')

const TEST_SECRET = 'offline-test-secret-0123456789abcdef'
process.env.JWT_SECRET = TEST_SECRET
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/offline-test'

const { getConfig } = require('../config')

test('server configuration fails closed for missing credentials and rejects weak JWT secrets', () => {
  assert.throws(() => getConfig({}), /MONGODB_URI, JWT_SECRET/)
  assert.throws(() => getConfig({ MONGODB_URI: 'mongodb://127.0.0.1/test', JWT_SECRET: 'short' }), /at least 32 characters/)
  assert.deepEqual(getConfig({
    MONGODB_URI: 'mongodb://127.0.0.1/test',
    JWT_SECRET: TEST_SECRET,
    PORT: '5050'
  }), {
    mongodbUri: 'mongodb://127.0.0.1/test',
    jwtSecret: TEST_SECRET,
    port: 5050
  })
})

const mockModule = (request, exports) => {
  const filename = require.resolve(request)
  require.cache[filename] = { id: filename, filename, loaded: true, exports }
}

class MockPlace {
  static async findById() { return null }
}
class MockUser {
  static async findById() { return null }
}
mockModule('../models/placeSchema', MockPlace)
mockModule('../models/userSchema', MockUser)
mockModule('express-validator', {
  validationResult: req => ({ isEmpty: () => req.validationInvalid !== true })
})
const placesController = require('../controllers/places-controller')
const usersController = require('../controllers/users-controller')

const controllerCall = async (controller, req) => {
  let receivedError
  const next = error => { receivedError = error }
  await controller(req, {}, next)
  return receivedError
}

test('invalid place PATCH forwards a 422 error rather than returning an unused object', async () => {
  const error = await controllerCall(placesController.updatePlace, {
    validationInvalid: true,
    params: { pid: 'synthetic-id' },
    body: {},
    userData: { userId: 'synthetic-user' }
  })
  assert.equal(error.code, 422)
})

test('PATCH for a missing place forwards a controlled 404', async () => {
  const error = await controllerCall(placesController.updatePlace, {
    params: { pid: 'synthetic-missing-id' },
    body: { title: 'Title', description: 'Description long enough' },
    userData: { userId: 'synthetic-user' }
  })
  assert.equal(error.code, 404)
})

test('place creation without an uploaded image returns a controlled 400', async () => {
  const error = await controllerCall(placesController.createPlace, {
    body: { title: 'Title', description: 'Description long enough', address: 'Somewhere' },
    userData: { userId: 'synthetic-user' }
  })
  assert.equal(error.code, 400)
})

test('signup without an uploaded image returns a controlled 400', async () => {
  const error = await controllerCall(usersController.signup, {
    body: { userName: 'Synthetic', email: 'synthetic@example.invalid', password: 'not-a-real-password' }
  })
  assert.equal(error.code, 400)
})

const checkAuth = require('../middleware/check-auth')
const jwt = require('jsonwebtoken')
test('JWT middleware accepts only the configured signing secret', () => {
  const validToken = jwt.sign({ userId: 'synthetic-user' }, TEST_SECRET)
  const validRequest = { method: 'GET', headers: { authorization: `Bearer ${validToken}` } }
  let nextError
  checkAuth(validRequest, {}, error => { nextError = error })
  assert.equal(nextError, undefined)
  assert.equal(validRequest.userData.userId, 'synthetic-user')

  const wrongKeyToken = jwt.sign({ userId: 'synthetic-user' }, 'wrong-test-key')
  let rejectedError
  checkAuth({ method: 'GET', headers: { authorization: `Bearer ${wrongKeyToken}` } }, {}, error => { rejectedError = error })
  assert.equal(rejectedError.code, 401)
  let missingHeaderError
  checkAuth({ method: 'GET', headers: {} }, {}, error => { missingHeaderError = error })
  assert.equal(missingHeaderError.code, 401)
})

test('API and asset URLs use the configured base and local default behavior', () => {
  const helperPath = path.join(frontendRoot, 'shared/util/api-url.js')
  const previous = process.env.REACT_APP_API_URL
  process.env.REACT_APP_API_URL = 'https://api.example.invalid/base/'
  delete require.cache[require.resolve(helperPath)]
  const configured = require(helperPath)
  assert.equal(configured.apiUrl('/api/users'), 'https://api.example.invalid/base/api/users')
  assert.equal(configured.apiUrl('uploads/image.png'), 'https://api.example.invalid/base/uploads/image.png')

  delete process.env.REACT_APP_API_URL
  delete require.cache[require.resolve(helperPath)]
  const local = require(helperPath)
  assert.equal(local.apiUrl('/api/users'), 'http://localhost:5000/api/users')
  if (previous === undefined) delete process.env.REACT_APP_API_URL
  else process.env.REACT_APP_API_URL = previous
})

test('HTTP hook cleans request bookkeeping in finally and maps API users by userName', () => {
  const hook = fs.readFileSync(path.join(frontendRoot, 'shared/hooks/http-hook.js'), 'utf8')
  assert.match(hook, /finally\s*\{/)
  assert.match(hook, /activeHttpRequests\.current\s*=\s*activeHttpRequests\.current\.filter/)
  assert.match(hook, /setIsLoading\(activeHttpRequests\.current\.length > 0\)/)
  assert.match(hook, /abortCtrl\.abort\(\)/)

  const list = fs.readFileSync(path.join(frontendRoot, 'user/components/UsersList.js'), 'utf8')
  assert.match(list, /name=\{user\.userName\}/)
})
