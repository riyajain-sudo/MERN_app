//router: to look for the mapping and routes we are using 


const express = require('express')
const { check } = require('express-validator')

const usersController = require('../controllers/users-controller')
const fileUpload = require('../middleware/file-upload')

const router = express.Router()

router.get('/', usersController.getUsers)    //point towards the function, not execute it

router.post(
    '/signup', 
    fileUpload.single('image'),
    [
        check('userName')
            .not()
            .isEmpty()
            .isLength({max: 20}),
        check('email')
            .normalizeEmail()   //Test@test.com => test@test.com
            .isEmail(),
        check('password')
            .isLength({min: 6})
    ], usersController.signup)

router.post(
    '/login', 
    [   
        check('email')
            .normalizeEmail()   //Test@test.com => test@test.com
            .isEmail(),
        check('password')
            .isLength({min: 6})
    ], usersController.login)

module.exports = router