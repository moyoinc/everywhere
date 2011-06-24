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
