const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const dbType = process.env.DB_TYPE || 'mysql';
let db = null;

if (dbType === 'mongodb') {
    // Connect to MongoDB using Mongoose
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB successfully.'))
        .catch(err => {
            console.error('MongoDB connection error:', err.message);
            process.exit(1);
        });
} else {
    // Default to MySQL
    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('Connected to MySQL connection pool.');
}

module.exports = db;