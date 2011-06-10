var express = require('express'),
    a = express.createServer(),
    path = require('path'),
    io = require('socket.io');

a
.use(express.static(path.normalize(__dirname + '../../../public')))
.get('/', function(q, r) {
    r.render('index.ejs');
})

// socket.io
var socket = io.listen(a);
var global_center = { center: { lat: 0, lon: 0 }, zoom: 2 };

socket.on('connection', function(client) {
    // Start the first person at either the 'global center'
    // or 0, 0
    client.send(global_center);

    client.on('message', function(message) {
        global_center = message;
        socket.broadcast(message, client.sessionId);
    });

    client.on('disconnect', function() {
    });
});

a.listen(8888);
