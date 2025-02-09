const express = require('express');
const router = express.Router();
const path = require('path');
const { upload, getSharedFiles } = require('../utils/fileHandler');
const renderPage = require('../templates/htmlTemplates');

router.get('/share', (req, res) => {
    const files = getSharedFiles();
    const content = `
        <a href="/" class="back-link">← Back to Home</a>
        <h2>File Sharing</h2>
        <div id="file-sharing-container">
            <div class="upload-section">
                <h3>Upload File</h3>
                <form action="/upload" method="post" enctype="multipart/form-data">
                    <input type="file" name="file" required>
                    <button type="submit">Upload</button>
                </form>
            </div>
            
            <div class="shared-files">
                <h3>Shared Files</h3>
                ${files.length === 0 ? '<p>No files shared yet</p>' : 
                    files.map(file => `
                        <div class="file-item">
                            <span>${file}</span>
                            <a href="/download/${encodeURIComponent(file)}" class="download-link">Download</a>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
    res.send(renderPage(content));
});

router.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/share');
});

router.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, '../../uploads', req.params.filename);
    res.download(file);
});

module.exports = router; 