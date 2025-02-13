const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3001;

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const fileShareRoutes = require('./routes/fileShareRoutes');

// Use routes
app.use('/', pageRoutes);
app.use('/', mediaRoutes);
app.use('/', fileShareRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    const userIP = socket.handshake.address.replace('::ffff:', '');
    console.log('A user connected from:', userIP);
    
    // Notify others of new connection
    socket.broadcast.emit('user status', 'A new user has joined the chat');
    
    socket.on('chat message', (msgData) => {
        io.emit('chat message', {
            text: msgData.text,
            username: msgData.username,
            ip: userIP,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', userIP);
        socket.broadcast.emit('user status', 'A user has left the chat');
    });

    // Handle device discovery with device name
    socket.on('ping device', (deviceInfo) => {
        io.emit('device found', {
            ip: socket.handshake.address.replace('::ffff:', ''),
            hostname: deviceInfo.hostname || 'Unknown Device',
            deviceName: deviceInfo.deviceName || 'Unnamed Device',
            time: new Date().toLocaleTimeString()
        });
    });

    // Handle call signaling
    socket.on('call device', (data) => {
        io.emit('incoming call', {
            from: {
                ip: socket.handshake.address.replace('::ffff:', ''),
                deviceName: data.fromName,
            },
            to: data.toIp,
            signal: data.signal
        });
    });

    socket.on('answer call', (data) => {
        io.emit('call answered', {
            from: socket.handshake.address.replace('::ffff:', ''),
            signal: data.signal,
            to: data.toIp
        });
    });

    socket.on('end call', (data) => {
        io.emit('call ended', {
            from: socket.handshake.address.replace('::ffff:', ''),
            to: data.toIp
        });
    });
});

// Start server (changed from app.listen to http.listen)
http.listen(port, '0.0.0.0', () => {
    const interfaces = require('os').networkInterfaces();
    const addresses = Object.values(interfaces)
        .flat()
        .filter(details => details.family === 'IPv4' && !details.internal)
        .map(details => details.address);
    
    console.log('Server running at:');
    addresses.forEach(addr => console.log(`http://${addr}:${port}`));
}); 