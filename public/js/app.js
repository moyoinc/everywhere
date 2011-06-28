// The map as a global, for hacking.
var m;

/*
function makeMadden() {
    var canvasDiv = document.getElementById('madden');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', canvasDiv.offsetWidth);
    canvas.setAttribute('height', canvasDiv.offsetHeight);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    context = canvas.getContext("2d");

    var bakerDiv = document.getElementById('tilebaker');
    bakerCanvas = document.createElement('canvas');
    bakerCanvas.setAttribute('width', 256);
    bakerCanvas.setAttribute('height', 256);
    bakerCanvas.setAttribute('id', 'tilebaker');
    bakerDiv.appendChild(bakerCanvas);
    tilebakerContext = bakerCanvas.getContext("2d");


    // Thanks to
    // http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/#demo-simple

    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint;

    function addClick(x, y, dragging) {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
    }

    function redraw() {
      canvas.width = canvas.width; // Clears the canvas
      context.strokeStyle = "#e00034";
      context.lineJoin = "round";
      context.lineWidth = 10;
      for(var i=0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
          context.moveTo(clickX[i-1], clickY[i-1]);
         } else {
           context.moveTo(clickX[i]-1, clickY[i]);
         }
         context.lineTo(clickX[i], clickY[i]);
         context.closePath();
         context.stroke();
      }
    }

    $('#canvas').bind('touchstart mousedown', function(e){
        var mouseX = (e.type === 'touchstart') ?
            e.touches[0].clientX - this.offsetLeft :
            e.clientX - this.offsetLeft;
        var mouseY = (e.type === 'touchstart') ?
            e.touches[0].clientY - this.offsetTop :
            e.clientY - this.offsetTop;
        paint = true;
        addClick(mouseX - this.offsetLeft, mouseY - this.offsetTop);
        redraw();
        return false;
    });

    $('#canvas').bind('mousemove touchmove', function(e) {
        if (paint) {
            if (e.type == 'touchmove') {
                addClick(e.touches[0].clientX - this.offsetLeft,
                         e.touches[0].clientY - this.offsetTop, true);
            } else {
                addClick(e.clientX - this.offsetLeft,
                         e.clientY - this.offsetTop, true);
            }
            redraw();
        }
        return false;
    });

    $('#canvas').bind('mouseup touchend', function(e){
        paint = false;
    });
}

function printMadden() {
    var tiles = (function(t) {
        var o = [];
        for (var key in t) {
            if (key.split(',')[0] == m.getZoom()) {
                var offset = wax.util.offset(t[key]);
                o.push([offset.top, offset.left, key]);
            }
        }
        return o;
    })(m.tiles);
    for (var i in tiles) {
        var data = context.getImageData(
            tiles[i][1], // y
            tiles[i][0], // x
            256, 256 // dimensions
        );
        tilebakerContext.putImageData(data, 0, 0);
        $.ajax({
            url: '/baker',
            type: 'json',
            method: 'post',
            data: JSON.stringify({
                image: bakerCanvas.toDataURL(),
                key: tiles[i][2]
            }),
            success: function(data) {
                console.log(arguments);
            }
        });
    }
}
*/

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
    var socket = new io.Socket();
    socket.connect();
    socket.on('connect', function(){
        socket.send({
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
        socket.send({
            type: 'center',
            center: m.getCenter(),
            coordinate: m.coordinate,
            zoom: m.getZoom(),
            room: getRoom()
        });
    });
}, false);
