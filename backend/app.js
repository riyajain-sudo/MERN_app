const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const HttpError = require('./models/http-error')
const app = express()

app.use(bodyParser.json())
  
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
    throw error
})

app.use((error, req, res, next) => {
    if(res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500).json({message: error.message || 'An unknown error occurred!'})
})

mongoose
    .connect('mongodb+srv://Riya:4S1mXw8Wib17NK1M@cluster0.u6q0sdv.mongodb.net/mern?appName=Cluster0')
    .then(() => {
        app.listen(5000)
    })
    .catch(err => {
        console.log(err);
    })

