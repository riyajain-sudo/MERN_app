// const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error');
const User = require('../models/userSchema')
const { getConfig } = require('../config')

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
        users = await User.find({}, 'userName image places')
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

    if (!req.file) {
        return next(new HttpError('A profile image is required', 400))
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
    
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 12)     //12 -> salting rounds
    }catch(err) {
        const error = new HttpError(
            'Could not create user, try again', 
            500
        )
        return next(error)
    }
    
    const createUser = new User({
        userName,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    })

    try {
        await createUser.save()     //save() is also a promise
    } catch (err) {
        const error = new HttpError('Sign up failed, try again', 500)
        return next(error)
    }

    let token
    try {
        token = jwt.sign(
            {userId: createUser.id, email: createUser.email},
            getConfig().jwtSecret,
            { expiresIn: '1hr'}
        )
    } catch (err) {
        const error = new HttpError('Sign up failed, try again', 500)
        return next(error)
    }
    
    res.status(201).json({ userId: createUser.id, email: createUser.email, token: token })   //removes the underscore from in front of the ID property
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
    
    if(!existingUser){
        const error = new HttpError('Invalid credentials, could not log you in', 403)
        return next(error)
    }

    let isValidPassword = false
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch(err) {
        return next(new HttpError('Could not log you in, please try again', 500))
    }

    if(!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not log you in', 403)
        return next(error)
    }


    // const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    // if(!identifiedUser || identifiedUser.password !== password) {
    //     return next(new HttpError('Could not identify User, credentials seem to be wrong', 403))
    // }

    let token
    try {
        token = jwt.sign(
            {userId: existingUser.id, email: existingUser.email},
            getConfig().jwtSecret,
            { expiresIn: '1hr'}
        )
    } catch (err) {
        const error = new HttpError('Logging in failed, try again', 500)
        return next(error)
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    })
}


exports.getUsers = getUsers
exports.signup = signup
exports.login = login
