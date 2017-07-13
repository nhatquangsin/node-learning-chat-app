var socket = io();

socket.on('connect', function ()  {
    console.log('Connected to the server');

    socket.emit('createMessage', {
        to: 'jen@eample.com',
        text: 'Hey. This is Quang'
    });
});

socket.on('disconnect', function ()  {
    console.log('Disconected from server');
});

socket.on('newMessage', function (message) {
    console.log('New message', message);
});