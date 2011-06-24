var express = require('express'),
    a = express.createServer(),
    path = require('path'),
    eyes = require('eyes'),
    file = require('file'),
    sys = require('sys'),
    fs = require('fs'),
    colors = require('colors'),
    _ = require('underscore'),
    io = require('socket.io');

a
.use(express.static(path.normalize(__dirname + '../../../public')))
.use(express.bodyParser())
.get('/', function(q, r) {
    r.render('index.ejs');
});
a.post('/baker', function(q, r) {
    try {
        var tile = JSON.parse(q.rawBody);
        var image = tile.image;
        var key = tile.key.split(',');
        var dir = ['tiles', key[0], key[1]].join('/');
        var data = (new Buffer(image.split(',')[1], 'base64')).toString('binary');
        file.mkdirs(dir, 0777, function() {
            console.log(arguments);
            fs.writeFileSync(dir + '/' + key[2] + '.png', data, 'binary');
        });
    } catch(e) {
        eyes.inspect(e);
    }
});

// socket.io
var socket = io.listen(a, {
    // Make socket.io quieter. Comment this line out when you're doing
    // testing and want to know when things connect and disconnect.
    log: null
});

// Globals: the current center and the current emperor
// sessions of map meta-information
var global_center = {
    center: {
        lat: 0,
        lon: 0
    },
    zoom: 2,
    type: 'center'
};

var map_clients = {},
    emperor = undefined,
    grid = {},
    gridIndex = {},
    tiling = false;

socket.on('connection', function(client) {
    // Start the first person at either the 'global center'
    // or 0, 0, and notify all new clients of who is the emperor, if
    // there is one.
    sys.puts(('+ new user: ' + parseInt(client.sessionId).toString(16)).magenta);
    client.send(global_center);

    if (emperor !== undefined) {
        client.send({
            type: 'emperor',
            emperor: emperor
        });
    }

    client.on('message', function(message) {
        switch(message.type) {
            case 'meta':
                // New clients send their dimensions at startup so that they
                // can be tiled. Ideally they'll resend them when they resize.
                map_clients[client.sessionId] = message.dimensions;
                break;
            case 'center':
                // If you are in emperor mode and are the emperor,
                // or if it's not engaged, you can move the map
                if (emperor === undefined || emperor === client.sessionId) {
                    global_center = message;
                    // If we're making tiled maps (tiles of tiled maps),
                    // the computation is a lot tricker, so here we go.
                    if (tiling) {
                        grid = makeGrid(message, client.sessionId, socket.clients);
                        for (var sessionId in socket.clients) {
                            if (sessionId !== client.sessionId) {
                                socket.clients[sessionId].send(
                                    getTile(
                                        sessionId,
                                        client.sessionId,
                                        message));
                            }
                        }
                    } else {
                        socket.broadcast(message, client.sessionId);
                    }
                }
                break;
            case 'tile':
                // Just set tiling to true. Obviously we need a way to
                // turn this off, preferably through simple 'control'
                // commands that set all of the other status stuff.
                sys.puts('> tiling mode on'.red);
                tiling = true;
                break;
            case 'emperor':
                // Only one person can be the emperor.
                if (emperor === undefined) {
                    emperor = client.sessionId;
                    sys.puts(('> the emperor is now ' + parseInt(emperor).toString(16)).green);
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
        // This call is safe even if there isn't the sessionId
        // around in map_clients.
        delete map_clients[client.sessionId];
    });
});

a.listen(8888);
console.log('everywhere | listening on port 8888');
