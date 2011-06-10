// The map as a global, for hacking.
var m;

window.addEventListener('load', function() {
    // Initialize map
    var mm = com.modestmaps;
    m = new mm.Map('map',
        new wax.mm.provider({
        // From the main MapBox server
        baseUrl: 'http://a.tiles.mapbox.com/mapbox/',
        // Called world-light
        layerName: 'world-light'}),
        null,
        [
            new mm.TouchHandler(),
            new mm.MouseHandler
        ]
    );

    // Initialize sockets
    var socket = new io.Socket();
    socket.connect();
    socket.on('connect', function(){
        socket.send({
            type: 'meta',
            dimensions: m.dimensions
        });
    });
    socket.on('message', function(message){
        switch(message.type) {
            case 'center':
                m.setCenter(message.center);
                m.setZoom(message.zoom);
                break;
            case 'coordinate':
                m.coordinate = new mm.Coordinate(
                    message.coordinate.row,
                    message.coordinate.column,
                    message.coordinate.zoom);
                m.draw();
                break;
            case 'emperor':
                $('#emperor').remove();
                break;
        }

    });
    socket.on('disconnect', function(){ });

    // Page controls
    $('#emperor').click(function(e) {
        e.stopPropagation();
        socket.send({
            type: 'emperor'
        });
        $(this).text('I am emperor');
        return false;
    });

    $('#tile').click(function(e) {
        e.stopPropagation();
        socket.send({
            type: 'tile'
        });
        $(this).text('tiling on');
        return false;
    });

    // Map interaction
    m.addCallback('panned', function(m) {
        socket.send({
            type: 'center',
            center: m.getCenter(),
            coordinate: m.coordinate,
            zoom: m.getZoom()
        });
    });
}, false);
