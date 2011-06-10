var express = require('express'),
    a = express.createServer(),
    path = require('path'),
    eyes = require('eyes'),
    _ = require('underscore'),
    M = require('modestmaps'),
    io = require('socket.io');

a
// TODO: there must be a better way.
.use(express.static(path.normalize(__dirname + '../../../public')))
.get('/', function(q, r) {
    r.render('index.ejs');
})

// socket.io
var socket = io.listen(a);

// Globals: the current center and the current emperor
var global_center = { center: { lat: 0, lon: 0 }, zoom: 2, type: 'center' };
// sessions of map meta-information
var map_clients = {},
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
    // or 0, 0
    client.send(global_center);
    if (emperor !== undefined) client.send({ type: 'emperor', emperor: emperor });

    client.on('message', function(message) {
        switch(message.type) {
            case 'meta':
                map_clients[client.sessionId] = message.dimensions;
                break;
            case 'center':
                if (emperor === undefined || emperor === client.sessionId) {
                    global_center = message;
                    if (tiling) {
                        grid = makeGrid(message, client.sessionId, socket.clients);
                        for (var sessionId in socket.clients) {
                            if (sessionId !== client.sessionId) {
                                socket.clients[sessionId].send(getTile(sessionId, client.sessionId, message));
                            }
                        }
                    } else {
                        socket.broadcast(message, client.sessionId);
                    }
                }
                break;
            case 'tile':
                tiling = true;
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
