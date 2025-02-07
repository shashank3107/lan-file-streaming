const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3001;

// Import routes
const pageRoutes = require('./routes/pageRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// Use routes
app.use('/', pageRoutes);
app.use('/', mediaRoutes);

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