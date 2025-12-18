const mongoose = require('mongoose');

// Define the Schema
const userschem = new mongoose.Schema({
    person: {
        id: Number,
        name: String,
        password: Number, 
    }
});




// Create the Model
// Note: Do NOT put 'userschem' in quotes. Pass the actual variable.
const User = mongoose.model('User', userschem);

// Export the Model
module.exports = User;