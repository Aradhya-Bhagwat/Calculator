const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const User = require('./models/User');
const History = require('./models/History');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Allows server to read JSON bodies sent by frontend

const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE: Verify JWT Token ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. Sign in first." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token session logged out." });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTE: Sign Up ---
app.post('/api/signup', async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;
        
        // Hash the password for safety
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        if (process.env.DB_TYPE === 'mongodb') {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: "Email already exists." });
            }

            const newUser = new User({ name, surname, email, password: hashedPassword });
            await newUser.save();
        } else {
            await db.execute(
                'INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)',
                [name, surname, email, hashedPassword]
            );
        }
        
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.code === 11000) {
            return res.status(400).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: error.message });
    }
});

// --- AUTH ROUTE: Login ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        let user;
        if (process.env.DB_TYPE === 'mongodb') {
            user = await User.findOne({ email });
        } else {
            const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            user = users[0];
        }

        if (!user) return res.status(400).json({ error: "User not found." });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Incorrect password." });

        // Generate a JWT token containing user's ID
        const token = jwt.sign({ id: user.id || user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, message: "Logged in successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HISTORY ROUTE: Save Calculation ---
app.post('/api/history', authenticateToken, async (req, res) => {
    try {
        const { expression, result } = req.body;
        if (process.env.DB_TYPE === 'mongodb') {
            const newHistory = new History({
                user_id: req.user.id,
                expression,
                result
            });
            await newHistory.save();
        } else {
            await db.execute(
                'INSERT INTO history (user_id, expression, result) VALUES (?, ?, ?)',
                [req.user.id, expression, result]
            );
        }
        res.status(201).json({ message: "Saved to history." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HISTORY ROUTE: Fetch History ---
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const rows = await History.find({ user_id: req.user.id })
                .select('expression result -_id')
                .sort({ created_at: -1 })
                .limit(50);
            res.json(rows);
        } else {
            const [rows] = await db.execute(
                'SELECT expression, result FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
                [req.user.id]
            );
            res.json(rows);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HISTORY ROUTE: Clear History ---
app.delete('/api/history', authenticateToken, async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            await History.deleteMany({ user_id: req.user.id });
        } else {
            await db.execute('DELETE FROM history WHERE user_id = ?', [req.user.id]);
        }
        res.json({ message: "History cleared successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USER ROUTE: Fetch Profile ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        if (process.env.DB_TYPE === 'mongodb') {
            const user = await User.findById(req.user.id).select('name surname email -_id');
            if (!user) return res.status(404).json({ error: "User not found." });
            res.json(user);
        } else {
            const [users] = await db.execute('SELECT name, surname, email FROM users WHERE id = ?', [req.user.id]);
            if (users.length === 0) return res.status(404).json({ error: "User not found." });
            res.json(users[0]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
