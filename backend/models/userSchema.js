const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')   //third-party package

const Schema = mongoose.Schema

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    image: {
        type: String,
        required: true
    },
    places: [{                            //array for multiple entries
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Place'
    }]
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)