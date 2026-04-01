const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const verifyToken = require('./middleware/auth');
const path = require('path'); 

const app = express();
app.use(express.json()); // Parses incoming JSON (Allows NoSQL Injection objects)
app.use(express.static('public')); 

const SECRET = process.env.JWT_SECRET || 'supersecretctfkey';
const FLAG = process.env.FLAG || 'CTF{m4ss_4ss1gnm3nt_m33ts_t1m1ng_0r4cl3}';

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ctf')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// --- 1. RECON (How they find the bot) ---
app.get('/api/public/invoices', (req, res) => {
    res.json({
        invoice_id: "INV-9999",
        amount: "$500,000",
        generated_by: "finance_bot",
        note: "Master invoice (FLAG) requires admin rights and can only be viewed by the generator."
    });
});

// --- 2. REGISTRATION (For self-escalation test) ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Defaults to role: 'user'
        const user = await User.create({ username, password: hashedPassword });
        res.json({ message: "User registered", id: user._id });
    } catch (err) {
        res.status(400).json({ error: "Registration failed" });
    }
});

// --- 3. THE TIMING ORACLE (Login Endpoint) ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, id, password } = req.body;

        // VULNERABILITY: Raw collection query avoids Mongoose CastError, enabling $regex injection on _id
        const query = { username: username };
        if (id) query._id = id;

        const user = await User.collection.findOne(query);

        // TIMING ORACLE: bcrypt.compare takes ~200-300ms. 
        // If 'user' is null (regex failed), this is skipped (fast response).
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET);
            return res.json({ token });
        }
        res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- 4. THE IDOR + MASS ASSIGNMENT (Update Profile) ---
app.patch('/api/users/:id', verifyToken, async (req, res) => {
    try {
        // VULNERABILITY: No check if req.user.id == req.params.id
        // VULNERABILITY: req.body is fully trusted
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Profile updated successfully", role: updatedUser.role });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// --- 5. THE GOAL (Get Flag) ---
app.get('/api/admin/flag', verifyToken, async (req, res) => {
    if (req.user.role === 'admin' && req.user.username === 'finance_bot') {
        return res.json({ flag: FLAG });
    }
    res.status(403).json({ error: "Access Denied. Only 'finance_bot' with admin role can view this." });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
