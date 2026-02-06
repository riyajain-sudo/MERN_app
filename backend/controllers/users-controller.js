const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error');

const DUMMY_USERS = [
    {
        id: 'u1',
        userName: 'Aru Chaudhary',
        email: 'aru@example.com',
        password: 'Aru25'
    }
]

const getUsers = (req, res, next) =>{
    res.json( {users: DUMMY_USERS} )
}

const signup = (req, res, next) => {
    const errors = validationResult(req)         //checks for validation errors
    if( !errors.isEmpty() ) {
        // console.log(errors);
        throw new HttpError('Invalid inputs', 422)
    }

    const { userName, email, password } = req.body

    const hasUser = DUMMY_USERS.find(u => u.email === email)
    if(hasUser){
        throw new HttpError('User already exists', 422)
    }
    
    const createdUser = {
        id: uuidv4(),
        userName,     //userName: userName
        email,
        password
    }
    DUMMY_USERS.push(createdUser)

    res.status(201).json({user: createdUser })
}

const login = (req, res, next) =>{
    const { email, password } = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    if(!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify User, credentials seem to be wrong', 401)
    }

    res.json({message: 'Logged in successfully!'})
}


exports.getUsers = getUsers
exports.signup = signup
exports.login = login