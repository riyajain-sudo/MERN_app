//headers are not case-sensitive

const jwt = require('jsonwebtoken')
const HttpError = require("../models/http-error")
const { getConfig } = require('../config')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const authorization = req.headers.authorization || ''
        const [scheme, token] = authorization.split(' ')
        if (scheme !== 'Bearer' || !token) {
            throw new Error('Authentication failed!')
        }
        const decodedToken = jwt.verify(token, getConfig().jwtSecret)
        req.userData = {userId: decodedToken.userId}
        next()

    } catch (err) {
        const error = new HttpError('Authentication failed!', 401)
        return next(error)
    }
}
