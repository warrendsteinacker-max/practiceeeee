const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    person: {
        name: { type: String, required: true },
        password: { type: String, required: true }, // Must be String for Hash
        username: { type: String, required: true, unique: true },
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    refreshToken: { type: String },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number } 
});

// Auto-hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('person.password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.person.password = await bcrypt.hash(this.person.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);