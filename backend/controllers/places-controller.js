//controllers: have all middlewaare functions and their logic
//post req have a request body while get req don't

// const uuid = require('uuid/package.json')
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')

let DUMMY_PLACES = [
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


const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(p => {
        return p.creator == userId
    })

    if(!places || places.length === 0){
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
    res.json({places})
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)         //checks for validation errors
    if( !errors.isEmpty() ) {
        // console.log(errors);
        next(new HttpError('Invalid inputs', 422))
    }

    const { title, description, address, creator} = req.body          //object destructuring
    //const title = req.body.title

    let coordinates
    try {
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }
    
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

const updatePlace = (req, res, next) => {
    const errors = validationResult(req)         //checks for validation errors
    if( !errors.isEmpty() ) {
        throw new HttpError('Invalid inputs', 422)
    }

    const { title, description } = req.body
    const placeId = req.params.pid

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId)}
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    updatedPlace.title = title
    updatedPlace.description = description

    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({place: updatedPlace})
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid 
    if (!DUMMY_PLACES.find(p => p.id === placeId)){
        throw new HttpError('Could not find a place for that id', 404)
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id === placeId)      //(p => p.id !== placeId)
    res.status(200).json({message: 'Deleted Place.'})
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace