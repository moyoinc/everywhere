window.addEventListener('load', function() {
    // Initialize map
    var mm = com.modestmaps;

    var m = new mm.Map('map',
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
    socket.on('connect', function(){ });
    socket.on('message', function(message){
        m.setCenter(message.center);
        m.setZoom(message.zoom);
    });
    socket.on('disconnect', function(){ });

    m.addCallback('panned', function(m) {
        socket.send({
            center: m.getCenter(),
            zoom: m.getZoom()
        });
    });
}, false);
