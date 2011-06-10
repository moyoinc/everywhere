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

socket.on('connection', function(client) {
    client.on('message', function(message) {
        socket.broadcast(message, client.sessionId);
    });

    client.on('disconnect', function() {
    });
});

a.listen(8888);
