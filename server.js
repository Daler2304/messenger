const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/admin.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

let users = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('offer', (offer) => {
        users[socket.id] = offer;
        io.emit('user-connected', { userId: socket.id, offer });
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', { userId: socket.id, answer });
    });

    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', { userId: socket.id, candidate });
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user-disconnected', socket.id);
        console.log('A user disconnected:', socket.id);
    });
});
