//controllers: have all middlewaare functions and their logic
//post req have a request body while get req don't

// const uuid = require('uuid/package.json')
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/placeSchema')

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

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid   // {pid : 'p1'}
     
    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Could not find this place, try again', 500)
        return next(error)
    }
    
    // const place = DUMMY_PLACES.find(p => {
    //     return p.id == placeId
    // })

    if(!place){
        // const error = new Error('place was not found!')
        // error.code = 404
        // throw(error)                          //does not use 'return' , cancels function execution

        const error = new HttpError('Could not find this place for the provided Id, try again', 404)
        return next(error)
    }
    res.json({ place: place.toObject( {getters: true}) })
}


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid
    
    let places
    try {
        places = await Place.find({ creator: userId})
    } catch (err) {
        const error = new HttpError('Could not find this place by user Id, try again', 500)
        return next(error)
    }

    // const places = DUMMY_PLACES.filter(p => {
    //     return p.creator == userId
    // })

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
        return next(new HttpError('Invalid inputs', 422))
    }

    const { title, description, address, creator} = req.body          //object destructuring
    //const title = req.body.title

    let coordinates
    try {
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://images.pexels.com/photos/257499/pexels-photo-257499.jpeg?cs=srgb&dl=pexels-pixabay-257499.jpg&fm=jpg',
        creator
    })

    try {
        await createdPlace.save()     //save() is also a promise
    } catch (err) {
        const error = new HttpError('Could not create a place, try again', 500)
        return next(error)
    }
    
    // DUMMY_PLACES.push(createdPlace)   //unshift(createdPlace) -> if the place is to be added as the first element

    res.status(201).json({place: createdPlace}) //if sth was successfully created on the server
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)         //checks for validation errors
    if( !errors.isEmpty() ) {
        throw new HttpError('Invalid inputs', 422)
    }

    const { title, description } = req.body
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Could not update the place, try again', 500)
        return next(error)
    }

    // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId)}
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)

    place.title = title
    place.description = description

    // DUMMY_PLACES[placeIndex] = updatedPlace

    try {
        await place.save()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update the place, try again', 500)
        return next(error)
    }

    res.status(200).json({place: place.toObject({getters: true})})
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid 
    
    // if (!DUMMY_PLACES.find(p => p.id === placeId)){
    //     throw new HttpError('Could not find a place for that id', 404)
    // }
    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id === placeId)      //(p => p.id !== placeId)

    let place
    try {
        place = await Place.findById(placeId)
    } catch (err) {
        const error = new HttpError('Could not delete the place, try again', 500)
        return next(error)
    }

    try {
        await place.remove()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete the place, try again', 500)
        return next(error)
    }
    res.status(200).json({message: 'Deleted Place.'})
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace