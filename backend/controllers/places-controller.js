//controllers: have all middlewaare functions and their logic
//post req have a request body while get req don't

// const uuid = require('uuid/package.json')
// const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')

const mongoose = require('mongoose')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/placeSchema')
const User = require('../models/userSchema');
// const { use } = require('react');

// let DUMMY_PLACES = [
//     {
//         id: 'p1',
//         title: 'Empire State Building',
//         description: 'famous place',
//         location: {
//             lat: 40.7484474,
//             lng: -73.9871516
//         },
//         address: '20 W, New York',
//         creator: 'u1'
//     }
// ]

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
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)         //checks for validation errors
    if( !errors.isEmpty() ) {
        // console.log(errors);
        return next(new HttpError('Invalid inputs', 422))
    }

    const { title, description, address} = req.body          //object destructuring
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
        image: req.file.path,
        creator: req.userData.userId
    })

    let user
    try {
        user = await User.findById(req.userData.userId)
        
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500)
        return next(error)
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404)
        return next(error)
    }

    console.log(user);

    try{
        //Sessions and Transactions: 
        const sess = await mongoose.startSession()
        sess.startTransaction()    //allows multiple actions independently
        await createdPlace.save({ session: sess})
        user.places.push(createdPlace)
        await user.save({ session: sess })
        await sess.commitTransaction()
        
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500)
        return next(error)
    }
 
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
        return new HttpError('Invalid inputs', 422)
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

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('you are not allowed to edit this place.', 401)
        return next(error)
    }

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
        place = await Place.findById(placeId).populate('creator')  //populate() -> 
    } catch (err) {
        const error = new HttpError('Could not delete the place, try again', 500)
        return next(error)
    }

    if(!place){
        const error = new HttpError('could not find the place', 404)
        return next(error)
    }

    if (!place.creator.id !== req.userData.userId) {
        const error = new HttpError('you are not allowed to delete this place.', 401)
        return next(error)
    }

    const imagePath = place.image

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await place.remove({ session: sess })
        place.creator.places.pull()
        await place.creator.save( {session: sess})
        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete the place, try again', 500)
        return next(error)
    }

    fs.unlink(imagePath, err => {
        console.log(err);  
    })

    res.status(200).json({message: 'Deleted Place.'})
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace