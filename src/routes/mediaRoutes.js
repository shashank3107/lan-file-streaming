const express = require('express');
const router = express.Router();
const path = require('path');
const streamMedia = require('../utils/streamHandler');

router.get('/video/:filename', (req, res) => {
    const videoPath = path.join(__dirname, '../../video', req.params.filename);
    streamMedia(videoPath, 'video/mp4', req, res);
});

router.get('/audio/:filename', (req, res) => {
    const audioPath = path.join(__dirname, '../../audio', req.params.filename);
    streamMedia(audioPath, 'audio/mpeg', req, res);
});

module.exports = router; 