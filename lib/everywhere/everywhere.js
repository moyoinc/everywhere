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
var global_center = { center: { lat: 0, lon: 0 }, zoom: 2, type: 'center' };
var emperor = undefined;

socket.on('connection', function(client) {
    // Start the first person at either the 'global center'
    // or 0, 0
    client.send(global_center);
    if (emperor !== undefined) client.send({ type: 'emperor', emperor: emperor });

    client.on('message', function(message) {
        switch(message.type) {
            case 'center':
                if (emperor === undefined || emperor === client.sessionId) {
                    global_center = message;
                    socket.broadcast(message, client.sessionId);
                }
                break;
            case 'emperor':
                if (emperor === undefined) {
                    emperor = client.sessionId;
                    console.log('the emperor is now ' + emperor);
                    // TODO: fix race condition here.
                    socket.broadcast({
                        type: 'emperor',
                        emperor: emperor
                    }, emperor);
                }
                break;
        }
    });

    client.on('disconnect', function() {
    });
});

a.listen(8888);
