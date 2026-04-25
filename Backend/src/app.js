const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const frontendDistPath = path.resolve(__dirname, '../../Frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath));
}

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use((_req, res) => {
    if (hasFrontendBuild) {
        res.sendFile(frontendIndexPath);
        return;
    }

    res.status(503).send('Frontend build not found. Run Frontend build and redeploy.');
});

module.exports = app;