const mongoose = require('mongoose');

// Define the Schema
const userschem = new mongoose.Schema({
    person: {
        id: Number,
        name: String,
        password: Number, 
        username: String,
    }
});

pre.userschem




// Create the Model
// Note: Do NOT put 'userschem' in quotes. Pass the actual variable.
const User = mongoose.model('User', userschem);

// Export the Model
module.exports = User;