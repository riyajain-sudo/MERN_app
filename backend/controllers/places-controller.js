//controllers: have all middlewaare functions and their logic
//post req have a request body while get req don't

// const uuid = require('uuid/package.json')
const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error')

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

const getPlaceById = (req, res, next) => {
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
}


const getPlaceByUserId = (req, res, next) => {
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
}

const createPlace = (req, res, next) => {
    const { title, description, coordinates, address, creator} = req.body          //object destructuring
    //const title = req.body.title
    const createdPlace = {
        id: uuidv4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace)   //unshift(createdPlace) -> if the place is to be added as the first element

    res.status(201).json({place: createdPlace}) //if sth was successfully created on the server
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace