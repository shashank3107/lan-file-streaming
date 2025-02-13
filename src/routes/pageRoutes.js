const express = require('express');
const router = express.Router();
const renderPage = require('../templates/htmlTemplates');
const { findMediaFiles } = require('../utils/fileSystem');
const SUPPORTED_FORMATS = require('../config/formats');
const { scanNetwork } = require('../utils/networkUtils');

router.get('/', (req, res) => {
    const content = `
        <h1>Media Server</h1>
        <a href="/videos" class="menu-item">Videos</a>
        <a href="/audios" class="menu-item">Audio</a>
        <a href="/chat" class="menu-item">Chat Room</a>
        <a href="/share" class="menu-item">File Sharing</a>
        <a href="/devices" class="menu-item">Available Devices</a>
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

router.get('/devices', async (req, res) => {
    const content = `
        <a href="/" class="back-link">← Back to Home</a>
        <h2>Available Devices</h2>
        <div id="devices-container">
            <div class="device-settings">
                <input type="text" id="device-name" placeholder="Enter your device name" class="device-name-input">
                <button id="save-name" class="save-name-button">Save Name</button>
            </div>
            <button id="ping-button" class="refresh-button">Ping My Device</button>
            
            <!-- Add call container -->
            <div id="call-container" class="hidden">
                <div class="video-grid">
                    <div class="video-container">
                        <video id="localVideo" autoplay muted playsinline></video>
                        <span class="video-label">You</span>
                    </div>
                    <div class="video-container">
                        <video id="remoteVideo" autoplay playsinline></video>
                        <span class="video-label">Remote User</span>
                    </div>
                </div>
                <div class="call-controls">
                    <button id="end-call" class="end-call-button">End Call</button>
                </div>
            </div>

            <div id="devices-list">
                <p>Waiting for devices...</p>
            </div>
        </div>

        <script src="https://unpkg.com/simple-peer@9.11.1/simplepeer.min.js"></script>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            // Make startCall function global
            window.startCall = null;

            document.addEventListener('DOMContentLoaded', () => {
                const socket = io();
                const devicesList = document.getElementById('devices-list');
                const pingButton = document.getElementById('ping-button');
                const deviceNameInput = document.getElementById('device-name');
                const saveNameButton = document.getElementById('save-name');
                const callContainer = document.getElementById('call-container');
                const localVideo = document.getElementById('localVideo');
                const remoteVideo = document.getElementById('remoteVideo');
                const endCallButton = document.getElementById('end-call');
                const devices = new Map();
                
                let localStream = null;
                let peer = null;
                let currentCall = null;

                // Load saved device name from localStorage
                const savedName = localStorage.getItem('deviceName');
                if (savedName) {
                    deviceNameInput.value = savedName;
                }

                // Save device name
                saveNameButton.addEventListener('click', () => {
                    const deviceName = deviceNameInput.value.trim();
                    if (deviceName) {
                        localStorage.setItem('deviceName', deviceName);
                        // Immediately ping with new name
                        emitPing();
                    }
                });

                // Also save when pressing Enter
                deviceNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveNameButton.click();
                    }
                });

                function emitPing() {
                    const currentName = localStorage.getItem('deviceName');
                    socket.emit('ping device', {
                        hostname: window.location.hostname,
                        deviceName: currentName || 'Unnamed Device'
                    });
                }

                // Send ping when button is clicked
                pingButton.addEventListener('click', () => {
                    emitPing();
                });

                // Handle incoming device pings
                socket.on('device found', (device) => {
                    const deviceId = device.ip;
                    devices.set(deviceId, {
                        ...device,
                        lastSeen: new Date()
                    });
                    updateDevicesList();
                });

                // Assign startCall to window object
                window.startCall = async function(targetIp) {
                    try {
                        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        localVideo.srcObject = localStream;
                        
                        peer = new SimplePeer({
                            initiator: true,
                            stream: localStream,
                            trickle: false
                        });

                        peer.on('signal', data => {
                            socket.emit('call device', {
                                toIp: targetIp,
                                fromName: localStorage.getItem('deviceName') || 'Unknown Device',
                                signal: data
                            });
                        });

                        peer.on('stream', stream => {
                            remoteVideo.srcObject = stream;
                        });

                        currentCall = { peer, targetIp };
                        callContainer.classList.remove('hidden');
                    } catch (err) {
                        console.error('Failed to start call:', err);
                        alert('Could not access camera/microphone');
                    }
                };

                socket.on('incoming call', async (data) => {
                    if (data.to === socket.handshake.address.replace('::ffff:', '')) {
                        if (confirm(\`Incoming call from \${data.from.deviceName}. Accept?\`)) {
                            try {
                                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                                localVideo.srcObject = localStream;

                                peer = new SimplePeer({
                                    initiator: false,
                                    stream: localStream,
                                    trickle: false
                                });

                                peer.on('signal', data => {
                                    socket.emit('answer call', {
                                        signal: data,
                                        toIp: data.from.ip
                                    });
                                });

                                peer.on('stream', stream => {
                                    remoteVideo.srcObject = stream;
                                });

                                peer.signal(data.signal);
                                currentCall = { peer, targetIp: data.from.ip };
                                callContainer.classList.remove('hidden');
                            } catch (err) {
                                console.error('Failed to answer call:', err);
                                alert('Could not access camera/microphone');
                            }
                        }
                    }
                });

                socket.on('call answered', (data) => {
                    if (currentCall && data.to === socket.handshake.address.replace('::ffff:', '')) {
                        currentCall.peer.signal(data.signal);
                    }
                });

                socket.on('call ended', (data) => {
                    if (currentCall && data.to === socket.handshake.address.replace('::ffff:', '')) {
                        endCurrentCall();
                    }
                });

                function endCurrentCall() {
                    if (currentCall) {
                        currentCall.peer.destroy();
                        if (localStream) {
                            localStream.getTracks().forEach(track => track.stop());
                        }
                        localVideo.srcObject = null;
                        remoteVideo.srcObject = null;
                        callContainer.classList.add('hidden');
                        currentCall = null;
                        peer = null;
                    }
                }

                endCallButton.addEventListener('click', () => {
                    if (currentCall) {
                        socket.emit('end call', { toIp: currentCall.targetIp });
                        endCurrentCall();
                    }
                });

                // Update the device list HTML to include call button
                function updateDevicesList() {
                    const now = new Date();
                    const activeDevices = Array.from(devices.entries())
                        .filter(([_, device]) => {
                            const timeDiff = now - new Date(device.lastSeen);
                            return timeDiff < 60000; // Show devices seen in the last minute
                        })
                        .map(([id, device]) => device);

                    if (activeDevices.length === 0) {
                        devicesList.innerHTML = '<p>No devices found. Click "Ping My Device" to announce your presence.</p>';
                        return;
                    }

                    devicesList.innerHTML = activeDevices
                        .map(device => \`
                            <div class="device-item">
                                <div class="device-info">
                                    <span class="device-name">\${device.deviceName || 'Unnamed Device'}</span>
                                    <span class="device-hostname">\${device.hostname}</span>
                                    <span class="device-ip">\${device.ip}</span>
                                    <span class="device-time">Last seen: \${device.time}</span>
                                </div>
                                <div class="device-actions">
                                    <button onclick="window.startCall('\${device.ip}')" class="call-button">Call</button>
                                    <a href="http://\${device.ip}:3001" class="device-link">Connect</a>
                                </div>
                            </div>
                        \`).join('');
                }

                // Auto-ping on page load with saved name
                setTimeout(() => {
                    emitPing();
                }, 1000);

                // Refresh list every 5 seconds to update "last seen" times
                setInterval(updateDevicesList, 5000);
            });
        </script>
    `;
    res.send(renderPage(content));
});

module.exports = router; 