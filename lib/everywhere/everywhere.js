var express = require('express'),
    a = express.createServer(),
    path = require('path'),
    eyes = require('eyes'),
    file = require('file'),
    sys = require('sys'),
    fs = require('fs'),
    colors = require('colors'),
    _ = require('underscore')._,
    sio = require('socket.io');

var basePath = path.normalize(__dirname + '../../../');
var config = JSON.parse(fs.readFileSync(basePath + '/config.json'));

a
.use(config.base, express.static(basePath + '/public'))
.use(express.bodyParser())
.get(config.base + '/', function(q, r) {
    r.redirect(config.base + '/' + Math.random().toString(16).substr(2));
});

a.get(config.base + '/:room', function(q, r) {
    r.render('index.ejs', { base: config.base, domain: config.domain });
});

// socket.io
var io = sio.listen(9999, {
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
    rooms = {},
    emperor = undefined,
    grid = {},
    gridIndex = {},
    tiling = false;

io.sockets.on('connection', function(client) {
    // Start the first person at either the 'global center'
    // or 0, 0, and notify all new clients of who is the emperor, if
    // there is one.
    sys.puts('+ new user: ' + client.id.magenta);
    client.json.send(global_center);

    client.on('message', function(message) {
        switch(message.type) {
            case 'meta':
                // New clients send their dimensions at startup so that they
                // can be tiled. Ideally they'll resend them when they resize.
                map_clients[client.id] = message.dimensions;
                if (!rooms[message.room]) rooms[message.room] = [];
                rooms[message.room].push(client.id);
                rooms[message.room].forEach(function(id) {
                    io.sockets.socket(id).json.send({
                        type: 'meta',
                        population: rooms[message.room].length
                    });
                });
                break;
            case 'center':
                // If you are in emperor mode and are the emperor,
                // or if it's not engaged, you can move the map
                if (emperor === undefined || emperor === client.id) {
                    global_center = message;
                    for (var c = 0; c < rooms[message.room].length; c++) {
                        if (rooms[message.room][c] !== client.id) {
                            if (io.sockets.socket(rooms[message.room][c])) {
                                io.sockets.socket(rooms[message.room][c]).json.send(message);
                            }
                        }
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
        }
    });

    client.on('disconnect', function() {
        // This call is safe even if there isn't the sessionId
        // around in map_clients.
        delete map_clients[client.id];
        for (var room in rooms) {
            rooms[room] = _.without(rooms[room], client.id);
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
    });
});

a.listen(8888);
console.log('everywhere | listening on port 8888');
