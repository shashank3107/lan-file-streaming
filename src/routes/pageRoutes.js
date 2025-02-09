const express = require('express');
const router = express.Router();
const renderPage = require('../templates/htmlTemplates');
const { findMediaFiles } = require('../utils/fileSystem');
const SUPPORTED_FORMATS = require('../config/formats');

router.get('/', (req, res) => {
    const content = `
        <h1>Media Server</h1>
        <a href="/videos" class="menu-item">Videos</a>
        <a href="/audios" class="menu-item">Audio</a>
        <a href="/chat" class="menu-item">Chat Room</a>
        <a href="/share" class="menu-item">File Sharing</a>
    `;
    res.send(renderPage(content));
});

router.get('/videos', (req, res) => {
    const videoFiles = findMediaFiles('video', SUPPORTED_FORMATS.video);
    const content = `
        <a href="/" class="back-link">← Back to Home</a>
        <h2>Available Videos</h2>
        ${videoFiles.length === 0 ? '<p>No videos found</p>' : 
            videoFiles.map(file => `
                <a href="/watch-video/${encodeURIComponent(file)}" class="file-link">
                    ${file}
                </a>
            `).join('')
        }
    `;
    res.send(renderPage(content));
});

router.get('/audios', (req, res) => {
    const audioFiles = findMediaFiles('audio', SUPPORTED_FORMATS.audio);
    const content = `
        <a href="/" class="back-link">← Back to Home</a>
        <h2>Available Audio Files</h2>
        ${audioFiles.length === 0 ? '<p>No audio files found</p>' : 
            audioFiles.map(file => `
                <a href="/listen-audio/${encodeURIComponent(file)}" class="file-link">
                    ${file}
                </a>
            `).join('')
        }
    `;
    res.send(renderPage(content));
});

router.get('/watch-video/:filename', (req, res) => {
    const content = `
        <a href="/videos" class="back-link">← Back to Videos</a>
        <h2>${req.params.filename}</h2>
        <video width="800" controls>
            <source src="/video/${req.params.filename}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    `;
    res.send(renderPage(content));
});

router.get('/listen-audio/:filename', (req, res) => {
    const content = `
        <a href="/audios" class="back-link">← Back to Audio Files</a>
        <h2>${req.params.filename}</h2>
        <audio controls>
            <source src="/audio/${req.params.filename}" type="audio/mpeg">
            Your browser does not support the audio tag.
        </audio>
    `;
    res.send(renderPage(content));
});

router.get('/chat', (req, res) => {
    const content = `
        <a href="/" class="back-link">← Back to Home</a>
        <h2>Chat Room</h2>
        <div id="chat-container">
            <div id="messages"></div>
            <form id="chat-form">
                <input type="text" id="username" placeholder="Your name (optional)" />
                <input type="text" id="message-input" placeholder="Type a message..." required>
                <button type="submit">Send</button>
            </form>
        </div>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            const form = document.getElementById('chat-form');
            const input = document.getElementById('message-input');
            const usernameInput = document.getElementById('username');
            const messages = document.getElementById('messages');
            
            // Store username in localStorage if provided before
            if (localStorage.getItem('username')) {
                usernameInput.value = localStorage.getItem('username');
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (input.value) {
                    // Save username if provided
                    if (usernameInput.value) {
                        localStorage.setItem('username', usernameInput.value);
                    }
                    
                    socket.emit('chat message', {
                        text: input.value,
                        username: usernameInput.value
                    });
                    input.value = '';
                }
            });

            socket.on('chat message', (data) => {
                const item = document.createElement('div');
                item.className = 'message';
                
                const header = document.createElement('div');
                header.className = 'message-header';
                
                const userDisplay = data.username || data.ip;
                header.innerHTML = \`
                    <span class="user-ip">\${userDisplay}</span>
                    <span class="message-time">\${data.time}</span>
                \`;
                
                const text = document.createElement('div');
                text.className = 'message-text';
                text.textContent = data.text;
                
                item.appendChild(header);
                item.appendChild(text);
                messages.appendChild(item);
                messages.scrollTop = messages.scrollHeight;
            });

            // Auto-scroll to bottom when new messages arrive
            const autoScroll = () => {
                messages.scrollTop = messages.scrollHeight;
            };

            // Notify when users connect/disconnect
            socket.on('user status', (message) => {
                const item = document.createElement('div');
                item.className = 'status-message';
                item.textContent = message;
                messages.appendChild(item);
                autoScroll();
            });
        </script>
    `;
    res.send(renderPage(content));
});

module.exports = router; 