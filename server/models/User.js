const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    // MongoDB automatically adds _id. We don't need to specify it.
    // We disable timestamps if we want to manage them ourselves or don't need them.
    timestamps: false
});

// Export the model so it can be imported and used in other parts of our application
module.exports = mongoose.model('User', UserSchema);
