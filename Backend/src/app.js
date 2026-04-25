const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();

const frontendDistPath = path.resolve(__dirname, '../../Frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);

        try {
            const hostname = new URL(origin).hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return cb(null, true);
            if (hostname.endsWith('.onrender.com')) return cb(null, true);
        } catch (error) {
            // Ignore invalid origins and reject below.
        }

        cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'JARVIS API is running' });
});

if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath));
}

app.use((err, _req, res, next) => {
    if (!err) return next();

    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: err.message });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum 2MB per file.' });
    }

    if (err.message && err.message.includes('Unsupported file type')) {
        return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Request failed', detail: err.message });
});

app.get(/^(?!\/api).*/, (_req, res) => {
    if (hasFrontendBuild) {
        res.sendFile(frontendIndexPath);
        return;
    }

    res.status(503).send('Frontend build not found. Run Frontend build and redeploy.');
});

module.exports = app;