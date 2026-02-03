const express = require('express')

const HttpError = require('../models/http-error')

const router = express.Router()

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'famous place',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W, New York',
        creator: 'u1'
    }
]

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid   // {pid : 'p1'}
    const place = DUMMY_PLACES.find(p => {
        return p.id == placeId
    })

    if(!place){
        // const error = new Error('place was not found!')
        // error.code = 404
        // throw(error)                          //does not use 'return' , cancels function execution

        throw new HttpError('place was not found!', 404)
    }
    res.json({place})
})

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid
    const place = DUMMY_PLACES.find(p => {
        return p.creator == userId
    })

    if(!place){
        /*
        const error = new Error('place was not found for this user!')
        error.code = 404
        return next(error)                    //use 'return', does not cancel fucntion execution
        // return res.status(404).json({message: 'place was not found for this user!'})
        */

        return next (
            new HttpError('place was not found for this user!', 404)
        )


    }
    res.json({place})
})

module.exports = router