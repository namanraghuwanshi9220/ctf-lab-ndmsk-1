const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const SECRET = process.env.JWT_SECRET || 'ApexSecureKey2024';
const FLAG = process.env.FLAG || 'CTF{1D0R_1n_53c0nd4ry_f34tur3s_w1th_H34d3r_M4g1c}';

// IN-MEMORY SQLITE: Resets automatically on restart. No caching issues!
const db = new sqlite3.Database(':memory:');

// Initialize Database & Seed Data
db.serialize(() => {
    db.run("CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, name TEXT, course TEXT)");
    
    // The Admin (Legacy ID '1')
    const adminHash = bcrypt.hashSync('supersecretadmin999', 10);
    db.run("INSERT INTO users (id, username, password, role, name, course) VALUES ('1', 'admin', ?, 'admin', 'Amit Sharma', 'Administration')", [adminHash]);
    
    // A normal student (UUID)
    const studentHash = bcrypt.hashSync('student123', 10);
    const stuId = uuidv4();
    db.run("INSERT INTO users (id, username, password, role, name, course) VALUES (?, 'priya_s', ?, 'student', 'Priya Singh', 'Computer Science')", [stuId, studentHash]);
});

// Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "Access Denied. Please log in." });
    jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid session." });
        req.user = decoded;
        next();
    });
};

// --- ROUTES ---

// 1. RECON: Announcements (Leaks the Admin ID)
app.get('/api/announcements', (req, res) => {
    res.json([
        { date: "2024-10-12", title: "Mid-Term Exams Scheduled", author: "Priya Singh", author_id: "a1b2c3d4-..." },
        { date: "2024-10-01", title: "Welcome to Apex Institute Portal", author: "Amit Sharma (System Admin)", author_id: "1" } // RECON LEAK
    ]);
});

// 2. AUTH: Register (Assigns UUIDs)
app.post('/api/register', (req, res) => {
    const { username, password, name, course } = req.body;
    const id = uuidv4(); // Attackers get UUID, hiding the sequential nature
    const hash = bcrypt.hashSync(password, 10);
    
    db.run("INSERT INTO users (id, username, password, role, name, course) VALUES (?, ?, ?, 'student', ?, ?)", 
        [id, username, hash, name, course], function(err) {
        if (err) return res.status(400).json({ error: "Username already exists." });
        res.json({ message: "Registration successful!", id: id });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET);
            return res.json({ token, id: user.id });
        }
        res.status(401).json({ error: "Invalid credentials." });
    });
});

// 3. SECURE ENDPOINT: Main Profile (The Taunt)
app.get('/api/profile', verifyToken, (req, res) => {
    const targetId = req.query.id;
    
    // THE TAUNT: If they try IDOR on the main endpoint
    if (targetId !== req.user.id) {
        return res.status(403).json({ 
            error: "Access Denied.", 
            taunt: "Did you really think changing the ID in the URL would give you another user's profile? The main door is locked securely. Try harder." 
        });
    }

    db.get("SELECT id, username, name, course, role FROM users WHERE id = ?", [targetId], (err, user) => {
        if (!user) return res.status(404).json({ error: "User not found." });
        res.json(user);
    });
});

// 4. VULNERABLE ENDPOINT: The Secondary Feature (IDOR)
app.get('/api/generate-id-card', verifyToken, (req, res) => {
    const targetId = req.query.user;
    
    // VULNERABILITY: No check if req.user.id === targetId. 
    // Developer forgot authorization on the "Export/Download" feature.
    
    db.get("SELECT name, course, role FROM users WHERE id = ?", [targetId], (err, user) => {
        if (!user) return res.status(404).json({ error: "User not found." });

        // THE TWIST: The Header
        res.setHeader('X-Diagnostic-Status', "Debug flag disabled. Require header 'X-Show-Secrets: true'");

        let idCard = {
            institute: "Apex Institute of Technology",
            student_name: user.name,
            department: user.course,
            status: "Active"
        };

        // If attacker found the header, sent it, AND is targeting the admin
        if (req.headers['x-show-secrets'] === 'true' && user.role === 'admin') {
            idCard.system_flag = FLAG;
        }

        res.json(idCard);
    });
});

// Custom 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(4000, () => console.log('Apex Portal running on port 4000'));
