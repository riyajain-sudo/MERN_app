// const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error');
const User = require('../models/userSchema')

// const DUMMY_USERS = [
//     { 
//         id: 'u1',
//         userName: 'Aru Chaudhary',
//         email: 'aru@example.com',
//         password: 'Aru25'
//     }
// ]

const getUsers = async (req, res, next) =>{
    // res.json( {users: DUMMY_USERS} )
    let users
    try {
        users = await User.find({}, '-password')      //minus sign to exclude this field
    } catch (err) {
        const error = new HttpError('Fetching users failed, try again', 500)
        return next(error)
    }
    res.json({users: users.map(user => user.toObject( { getters: true }) )})
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)         //checks for validation errors
    if( !errors.isEmpty() ) {
        // console.log(errors);
        return next (new HttpError('Invalid inputs, please check your data', 422))
    }

    const { userName, email, password } = req.body

    let existingUser
    try {
        existingUser = await User.findOne( {email: email})
    } catch (err) {
        const error = new HttpError('Signing up failed, try again', 500)
        return next(error)
    }
    
    if(existingUser){
        const error = new HttpError('User already exists, try login', 422)
        return next(error)
    }

    // const hasUser = DUMMY_USERS.find(u => u.email === email)
    // if(hasUser){
    //     throw new HttpError('User already exists', 422)
    // }
    
    const createUser = new User({
        userName,
        email,
        password,
        image: 'https://static.vecteezy.com/system/resources/thumbnails/052/189/266/small/user-man-account-person-people-half-body-head-stickman-stick-figure-profile-silhouette-network-contact-black-white-sign-icon-shape-outline-vector.jpg',
        places: []
    })

    try {
        await createUser.save()     //save() is also a promise
    } catch (err) {
        const error = new HttpError('Sign up failed, try again', 500)
        return next(error)
    }

    // DUMMY_USERS.push(createdUser)

    res.status(201).json({user: createUser.toObject( { getters: true }) })   //removes the underscore from in front of the ID property
}

const login = async (req, res, next) =>{
    const { email, password } = req.body

    let existingUser
    try {
        existingUser = await User.findOne( {email: email})
    } catch (err) {
        const error = new HttpError('Logging in failed, try again', 500)
        return next(error)
    }   
    
    if(!existingUser || existingUser.password !== password){
        const error = new HttpError('Invalid credentials, could not log you in', 401)
        return next(error)
    }

    // const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    // if(!identifiedUser || identifiedUser.password !== password) {
    //     return next(new HttpError('Could not identify User, credentials seem to be wrong', 401))
    // }


    res.json({
        message: 'Logged in successfully!', 
        user: existingUser.toObject({getters: true})
    })
}


exports.getUsers = getUsers
exports.signup = signup
exports.login = login