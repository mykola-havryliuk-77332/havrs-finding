const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// 1. НАЛАШТУВАННЯ CORS (Максимально відкриті)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. ПІДКЛЮЧЕННЯ FIREBASE
try {
    if (process.env.FIREBASE_KEY_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        console.log("✅ Firebase initialized successfully");
    } else {
        console.log("⚠️ FIREBASE_KEY_JSON not found in environment");
    }
} catch (error) {
    console.error("❌ Firebase error:", error.message);
}

const db = admin.firestore();

// 3. МАРШРУТИ
app.get('/', (req, res) => {
    res.send("Server is Online!");
});

app.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        await db.collection('users').doc(email).set({
            email, 
            username: username || "Player", 
            password,
            createdAt: new Date().toISOString()
        });
        res.status(200).json({ message: "Success" });
    } catch (e) {
        console.error("Registration error:", e.message);
        res.status(500).json({ detail: e.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userDoc = await db.collection('users').doc(email).get();
        if (!userDoc.exists || userDoc.data().password !== password) {
            return res.status(401).json({ detail: "Invalid credentials" });
        }
        res.status(200).json({ message: "Logged in", user: userDoc.data() });
    } catch (e) {
        res.status(500).json({ detail: e.message });
    }
});

// 4. ЗАПУСК (БЕЗ '0.0.0.0')
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});