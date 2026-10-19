const MIN_JWT_SECRET_LENGTH = 32

const getConfig = (env = process.env) => {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter(name => {
    return typeof env[name] !== 'string' || env[name].trim() === ''
  })
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`)
  }
  if (env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`)
  }

  const port = Number(env.PORT || 5000)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port')
  }

  return {
    mongodbUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
    port
  }
}

module.exports = { getConfig }
