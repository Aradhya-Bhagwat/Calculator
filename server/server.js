const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
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

        const [result] = await db.execute(
            'INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)',
            [name, surname, email, hashedPassword]
        );
        
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Email already exists." });
        }
        res.status(500).json({ error: error.message });
    }
});

// --- AUTH ROUTE: Login ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: "User not found." });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Incorrect password." });

        // Generate a JWT token containing user's ID
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, message: "Logged in successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HISTORY ROUTE: Save Calculation ---
app.post('/api/history', authenticateToken, async (req, res) => {
    try {
        const { expression, result } = req.body;
        await db.execute(
            'INSERT INTO history (user_id, expression, result) VALUES (?, ?, ?)',
            [req.user.id, expression, result]
        );
        res.status(201).json({ message: "Saved to history." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HISTORY ROUTE: Fetch History ---
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT expression, result FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HISTORY ROUTE: Clear History ---
app.delete('/api/history', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM history WHERE user_id = ?', [req.user.id]);
        res.json({ message: "History cleared successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USER ROUTE: Fetch Profile ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT name, surname, email FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ error: "User not found." });
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
