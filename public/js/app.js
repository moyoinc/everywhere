// The map as a global, for hacking.
var m;

var getRoom = function() {
    return window.location.href.match(/(\w+)$/)[1];
};

window.addEventListener('load', function() {
    $('#sessionid')
        .text(window.location.href)
        .attr('href', window.location.href);

    // Initialize map
    var mm = com.modestmaps;
    m = new mm.Map('map',
        new wax.mm.provider({
        baseUrl: 'http://a.tiles.mapbox.com/mapbox/',
        layerName: 'world-light'}),
        null, [
            new mm.TouchHandler(),
            new mm.MouseHandler
        ]
    );

    // Initialize sockets
    var socket = io.connect(socketHost);
    socket.on('connect', function(){
        socket.json.send({
            type: 'meta',
            dimensions: m.dimensions,
            room: getRoom()
        });
    });
    socket.on('message', function(message){
        switch(message.type) {
            case 'center':
                m.setCenter(message.center);
                m.setZoom(message.zoom);
                break;
            case 'meta':
                $('#room-population').text(
                    (message.population > 1) ?
                    message.population + ' people are in this room' :
                    'It\'s just you in this room - give some friends the link.');
                break;
        }

    });
    socket.on('disconnect', function(){ });

    $('#get-help').click(function(e) {
        $('#help').show();
    });
    $('#close-help').click(function(e) {
        $('#help').hide();
    });
    $('a#rename').click(function(e) {
        $('a#sessionid').hide();
        $('a#rename').hide();
        $('div#rename-form').show();
    });
    $('a#rename-save').click(function(e) {
        var newName = $('input#rename-input').val();
        if (!newName.match(/^\w+$/)) {
            alert('names need to be only letters, numbers, and _s');
        } else {
            var oldUrl = window.location.href.split('/');
            oldUrl[oldUrl.length - 1] = newName;
            window.location.href = oldUrl.join('/');
        }
    });

    // Page controls
    // $('#emperor').click(function(e) {
    //     e.stopPropagation();
    //     socket.send({
    //         type: 'emperor'
    //     });
    //     $(this).text('I am emperor');
    //     return false;
    // });

    // $('#tile').click(function(e) {
    //     e.stopPropagation();
    //     socket.send({
    //         type: 'tile'
    //     });
    //     $(this).text('tiling on');
    //     return false;
    // });

    // $('#control_madden').click(function(e) {
    //     e.stopPropagation();
    //     $('#madden').css({ display: 'block' });
    //     makeMadden();
    //     return false;
    // });

    // $('#control_print').click(function(e) {
    //     e.stopPropagation();
    //     printMadden();
    //     return false;
    // });

    // Map interaction
    m.addCallback('panned', function(m) {
        socket.json.send({
            type: 'center',
            center: m.getCenter(),
            coordinate: m.coordinate,
            zoom: m.getZoom(),
            room: getRoom()
        });
    });
}, false);
