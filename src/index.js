/**
 * LAN File Streaming Server
 * A Node.js server that allows streaming media files, chatting, and video calling over LAN
 */

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const io = require('socket.io');
const port = 3001;

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const fileShareRoutes = require('./routes/fileShareRoutes');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/', pageRoutes);
app.use('/', mediaRoutes);
app.use('/', fileShareRoutes);

// Create certificates directory if it doesn't exist
const certsDir = path.join(__dirname, '../certs');
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir);
}

// Certificate configuration
const certOptions = {
    key: fs.readFileSync(path.join(certsDir, 'key.pem')),
    cert: fs.readFileSync(path.join(certsDir, 'cert.pem'))
};

// Create HTTPS server
const server = https.createServer(certOptions, app);
const ioServer = io(server);

/**
 * Socket.IO event handlers for real-time communication
 */
ioServer.on('connection', (socket) => {
    // Get user's IP address
    const userIP = socket.handshake.headers['x-forwarded-for'] || 
                   socket.handshake.address.replace('::ffff:', '') ||
                   socket.request.connection.remoteAddress.replace('::ffff:', '');
    
    console.log('A user connected from:', userIP);
    
    // Notify others of new connection
    socket.broadcast.emit('user status', 'A new user has joined the chat');
    
    // Handle chat messages
    socket.on('chat message', (msgData) => {
        ioServer.emit('chat message', {
            text: msgData.text,
            username: msgData.username,
            ip: userIP,
            time: new Date().toLocaleTimeString()
        });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', userIP);
        socket.broadcast.emit('user status', 'A user has left the chat');
    });

    // Handle device discovery
    socket.on('ping device', (deviceInfo) => {
        console.log('Ping from:', userIP, 'with device info:', deviceInfo);
        ioServer.emit('device found', {
            ip: userIP,
            hostname: deviceInfo.hostname || 'Unknown Device',
            deviceName: deviceInfo.deviceName || 'Unnamed Device',
            time: new Date().toLocaleTimeString()
        });
    });

    // Handle video call signaling
    socket.on('call device', (data) => {
        console.log('Call initiated from', userIP, 'to', data.toIp);
        ioServer.emit('incoming call', {
            from: {
                ip: userIP,
                deviceName: data.fromName,
            },
            to: data.toIp,
            signal: data.signal
        });
    });

    socket.on('answer call', (data) => {
        console.log('Call answered by', userIP, 'to', data.toIp);
        ioServer.emit('call answered', {
            from: userIP,
            signal: data.signal,
            to: data.toIp
        });
    });

    socket.on('end call', (data) => {
        console.log('Call ended by', userIP, 'to', data.toIp);
        ioServer.emit('call ended', {
            from: userIP,
            to: data.toIp
        });
    });
});

// Start server and log available addresses
server.listen(port, '0.0.0.0', () => {
    const interfaces = require('os').networkInterfaces();
    const addresses = Object.values(interfaces)
        .flat()
        .filter(details => details.family === 'IPv4' && !details.internal)
        .map(details => details.address);
    
    console.log('Server running at:');
    addresses.forEach(addr => console.log(`https://${addr}:${port}`));
}); 