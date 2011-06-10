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
        switch(message.type) {
            case 'center':
                m.setCenter(message.center);
                m.setZoom(message.zoom);
                break;
            case 'emperor':
                $('#emperor').remove();
                break;
        }

    });
    socket.on('disconnect', function(){ });

    $('#emperor').click(function(e) {
        e.stopPropagation();
        socket.send({
            type: 'emperor'
        });
        $(this).text('I am emperor');
        return false;
    });

    m.addCallback('panned', function(m) {
        socket.send({
            type: 'center',
            center: m.getCenter(),
            zoom: m.getZoom()
        });
    });
}, false);
