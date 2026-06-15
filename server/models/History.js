const mongoose = require('mongoose');

// Define the History schema
const HistorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Establishes a relationship/reference to the User model
        required: true
    },
    expression: {
        type: String,
        required: true
    },
    result: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now // Automatically sets the current date/time when created
    }
});

// Export the model so it can be imported and used in other parts of our application
module.exports = mongoose.model('History', HistorySchema);
