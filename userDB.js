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

userschem.pre('save', async function(next) {
    // 'this' refers to the user document
    // We only hash if the password is new or being changed
    if (!this.isModified('person.password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.person.password = await bcrypt.hash(this.person.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});




// Create the Model
// Note: Do NOT put 'userschem' in quotes. Pass the actual variable.
const User = mongoose.model('User', userschem);

// Export the Model
module.exports = User;