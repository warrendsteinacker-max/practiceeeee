const mongoose = require('mongoose')

const userschem = new mongoose.Schema({
    person: {
        id: Number,
        name: String,
    }

})

const User = mongoose.model('User', 'userschem')

module.exports User