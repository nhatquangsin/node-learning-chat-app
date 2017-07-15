const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {Users} = require('./utils/users');
const {Rooms} = require('./utils/rooms.js');
const {isRealString} = require('./utils/validation.js');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
var rooms = new Rooms();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || (!isRealString(params.room) && !isRealString(params.newRoom))) {
            callback('Name and room name are required');
        } else  if (isRealString(params.room) && isRealString(params.newRoom)) {
            callback('Can not join and create room');
        }

        if (isRealString(params.room) && rooms.getRoom(params.room)) {
            socket.join(params.room);
            users.removeUser(socket.id); 
            users.addUser(socket.id, params.name, params.room);

            io.to(params.room).emit('updateUserList', users.getUserList(params.room));
            socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        
            socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} joined`));

            callback();
        } else if (isRealString(params.newRoom)) {
            var room = params.newRoom;
            rooms.addRoom(room);
            socket.join(room);
            users.removeUser(socket.id); 
            users.addUser(socket.id, params.name, room);

            io.to(room).emit('updateUserList', users.getUserList(room));
            socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        
            socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${params.name} joined`));

            callback();
        } else if (isRealString(params.room) && !rooms.getRoom(params.room)) {
            callback('Room is not exist');
        }
    });

    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }

        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);

        io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
        }
    });
});

server.listen(port, () => {
    console.log(`Started up at port ${port}`);
});