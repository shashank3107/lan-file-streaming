const express = require('express');
const router = express.Router();
const path = require('path');
const { findMediaFiles } = require('../utils/fileSystem');
const SUPPORTED_FORMATS = require('../config/formats');

// Serve static files
router.use('/css', express.static(path.join(__dirname, '../public/css')));
router.use('/js', express.static(path.join(__dirname, '../public/js')));

// Home page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Chat page
router.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/chat.html'));
});

// Devices page
router.get('/devices', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/devices.html'));
});

// Videos page
router.get('/videos', (req, res) => {
    const videoFiles = findMediaFiles('video', SUPPORTED_FORMATS.video);
    res.sendFile(path.join(__dirname, '../views/videos.html'));
});

// Audio page
router.get('/audios', (req, res) => {
    const audioFiles = findMediaFiles('audio', SUPPORTED_FORMATS.audio);
    res.sendFile(path.join(__dirname, '../views/audio.html'));
});

// Watch video page
router.get('/watch-video/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/watch-video.html'));
});

// Listen audio page
router.get('/listen-audio/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/listen-audio.html'));
});

// API endpoints for getting media files list
router.get('/api/videos', (req, res) => {
    const videoFiles = findMediaFiles('video', SUPPORTED_FORMATS.video);
    res.json(videoFiles);
});

router.get('/api/audios', (req, res) => {
    const audioFiles = findMediaFiles('audio', SUPPORTED_FORMATS.audio);
    res.json(audioFiles);
});

module.exports = router; 