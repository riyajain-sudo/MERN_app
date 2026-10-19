const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const HttpError = require('./models/http-error')
const { getConfig } = require('./config')
const app = express()

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))
  
//middleware for CORS error
app.use((req, res, next) => {                 
    res.setHeader('Access-Control-Allow-Origin', '*')    //allow all domains
    res.setHeader(
        'Access-Control-Allow-Headers',                  //allow these headers
        'Origin, X-Requested-With, Content-Type, Accept, Authorization')    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')   //controls the http methods used on the front end
    next()
})

app.use('/api/places', placesRoutes)      // => /api/places... 
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404)
    return next(error)
})

app.use((error, req, res, next) => {
    if(req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Could not clean up the uploaded file.')
        })
    }
    if(res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500).json({message: error.message || 'An unknown error occurred!'})
})

const startServer = async () => {
    let config
    try {
        config = getConfig()
    } catch (error) {
        console.error(error.message)
        process.exitCode = 1
        return
    }

    try {
        await mongoose.connect(config.mongodbUri)
        app.listen(config.port)
    } catch (error) {
        console.error('Database connection failed; server was not started.')
        process.exitCode = 1
    }
}

if (require.main === module) {
    startServer()
}

module.exports = { app, startServer }
