//model: a medium through which data is sent to and retrieved from the database
//schema: it is the blueprint for data. It gives structure to data

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const placeSchema = new Schema({
    title: { 
        type: String, 
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

module.exports = mongoose.model('Place', placeSchema)

//module.exports = mongoose.model('name of model (in singular form and first letter capital)', name of schema that you want to refer to)
