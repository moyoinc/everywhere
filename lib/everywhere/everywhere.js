var express = require('express'),
    a = express.createServer(),
    path = require('path'),
    eyes = require('eyes'),
    sys = require('sys'),
    colors = require('colors'),
    _ = require('underscore'),
    M = require('modestmaps'),
    io = require('socket.io');

a
.use(express.static(path.normalize(__dirname + '../../../public')))
.use(express.bodyParser())
.get('/', function(q, r) {
    r.render('index.ejs');
});
a.post('/baker', function(q, r) {
    try {
        JSON.parse(q.rawBody);
    } catch(e) {}
});

// socket.io
var socket = io.listen(a, {
    // Make socket.io quieter. Comment this line out when you're doing
    // testing and want to know when things connect and disconnect.
    log: null
});

// Globals: the current center and the current emperor
// sessions of map meta-information
var global_center = { center: { lat: 0, lon: 0 }, zoom: 2, type: 'center' },
    map_clients = {},
    emperor = undefined,
    grid = {},
    gridIndex = {},
    tiling = false;

function makeGrid(message, thisSession, clients) {
    var rows = Math.ceil(Math.sqrt(_(clients).keys().length)),
        grid = [],
        columns = [],
        offsetCounter = null,
        i = 0;
    if (rows === 0) rows = 1;
    // Okay, so given the list of clients, we'll do an arrangement based on
    // their id order in the object.
    var offset = [0, 0];
    var fX = null;
    var fY = null;
    for (var sessionId in clients) {
        var x = (i % rows) || 0;
        var y = Math.floor(i / rows) || 0;
        if (!grid[x]) grid[x] = [];
        if (x === 0) offset[0] = 0;
        grid[x][y] = {
            sessionId: sessionId,
            dimensions: map_clients[sessionId],
            offset: [offset[0], offset[1]]
        };
        gridIndex[sessionId] = [x, y];
        // If we haven't gotten meta yet.
        if (map_clients[sessionId]) {
            // Move this to the right one step.
            if (fX !== x) {
                offset[0] += map_clients[sessionId].x;
                fX = x;
            }
            // Don't increment x on the first row
            if (fY !== y && i > 0) {
                offset[1] += map_clients[sessionId].y;
                fY = y;
            }
        }
        i++;
    }
    eyes.inspect(grid);
    return grid;
}

// From a grid, compute the actual offset of a tile in pixels,
// in a format that we can give back to Modest Maps.
function getTile(sessionId, sender, message) {
    var senderIndex = gridIndex[sender];
    var myIndex = gridIndex[sessionId];
    var senderOffset = grid[senderIndex[0]][senderIndex[1]].offset;
    var myOffset = grid[myIndex[0]][myIndex[1]].offset;
    return {
        type: 'coordinate',
        coordinate: {
            column: message.coordinate.column - ((senderOffset[0] - myOffset[0]) / 256),
            row: message.coordinate.row - ((senderOffset[1] - myOffset[1]) / 256),
            zoom: message.coordinate.zoom
        }
    };
}

socket.on('connection', function(client) {
    // Start the first person at either the 'global center'
    // or 0, 0, and notify all new clients of who is the emperor, if
    // there is one.
    sys.puts(('+ new user: ' + parseInt(client.sessionId).toString(16)).magenta);
    client.send(global_center);
    if (emperor !== undefined) client.send({ type: 'emperor', emperor: emperor });

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
                                    getTile(sessionId, client.sessionId, message));
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
