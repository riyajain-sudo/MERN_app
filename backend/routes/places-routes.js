//router: to look for the mapping and routes we are using 


const express = require('express')

const placesController = require('../controllers/places-controller')

const router = express.Router()

router.get('/:pid', placesController.getPlaceById)    //point towards the function, not execute it

router.get('/user/:uid', placesController.getPlaceByUserId)

router.post('/', placesController.createPlace)

module.exports = router