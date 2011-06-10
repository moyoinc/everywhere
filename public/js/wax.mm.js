/*!
  * 0.1.6 with IE readyState fix in https://github.com/ded/reqwest/issues/18
  *
  * Reqwest! A x-browser general purpose XHR connection manager
  * copyright Dustin Diaz 2011
  * https://github.com/ded/reqwest
  * license MIT
  */
!function(window){function serial(a){var b=a.name;if(a.disabled||!b)return"";b=enc(b);switch(a.tagName.toLowerCase()){case"input":switch(a.type){case"reset":case"button":case"image":case"file":return"";case"checkbox":case"radio":return a.checked?b+"="+(a.value?enc(a.value):!0)+"&":"";default:return b+"="+(a.value?enc(a.value):!0)+"&"}break;case"textarea":return b+"="+enc(a.value)+"&";case"select":return b+"="+enc(a.options[a.selectedIndex].value)+"&"}return""}function enc(a){return encodeURIComponent(a)}function reqwest(a,b){return new Reqwest(a,b)}function init(o,fn){function error(a){o.error&&o.error(a),complete(a)}function success(resp){o.timeout&&clearTimeout(self.timeout)&&(self.timeout=null);var r=resp.responseText;switch(type){case"json":resp=eval("("+r+")");break;case"js":resp=eval(r);break;case"html":resp=r}fn(resp),o.success&&o.success(resp),complete(resp)}function complete(a){o.complete&&o.complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort(),error()},o.timeout)),this.request=getRequest(o,success,error)}function setType(a){if(/\.json$/.test(a))return"json";if(/\.jsonp$/.test(a))return"jsonp";if(/\.js$/.test(a))return"js";if(/\.html?$/.test(a))return"html";if(/\.xml$/.test(a))return"xml";return"js"}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function getRequest(a,b,c){if(a.type!="jsonp"){var f=xhr();f.open(a.method||"GET",typeof a=="string"?a:a.url,!0),setHeaders(f,a),f.onreadystatechange=readyState(f,b,c),a.before&&a.before(f),f.send(a.data||null);return f}var d=doc.createElement("script");window[getCallbackName(a)]=generalCallback,d.type="text/javascript",d.src=a.url,d.async=!0;var e=function(){a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(d)};d.onload=e,d.onreadystatechange=function(){d.readyState=="loaded"||d.readyState=="complete"&&e()},head.appendChild(d)}function generalCallback(a){lastValue=a}function getCallbackName(a){var b=a.jsonpCallback||"callback";if(a.url.slice(-(b.length+2))==b+"=?"){var c="reqwest_"+uniqid++;a.url=a.url.substr(0,a.url.length-1)+c;return c}var d=new RegExp(b+"=([\\w]+)");return a.url.match(d)[1]}function setHeaders(a,b){var c=b.headers||{};c.Accept="text/javascript, text/html, application/xml, text/xml, */*",c["X-Requested-With"]=c["X-Requested-With"]||"XMLHttpRequest";if(b.data){c["Content-type"]="application/x-www-form-urlencoded";for(var d in c)c.hasOwnProperty(d)&&a.setRequestHeader(d,c[d],!1)}}function readyState(a,b,c){return function(){a&&a.readyState==4&&(twoHundo.test(a.status)?b(a):c(a))}}var twoHundo=/^20\d$/,doc=document,byTag="getElementsByTagName",head=doc[byTag]("head")[0],xhr="XMLHttpRequest"in window?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")},uniqid=0,lastValue;Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}},reqwest.serialize=function(a){var b=a[byTag]("input"),c=a[byTag]("select"),d=a[byTag]("textarea");return(v(b).chain().toArray().map(serial).value().join("")+v(c).chain().toArray().map(serial).value().join("")+v(d).chain().toArray().map(serial).value().join("")).replace(/&$/,"")},reqwest.serializeArray=function(a){for(var b=this.serialize(a).split("&"),c=0,d=b.length,e=[],f;c<d;c++)b[c]&&(f=b[c].split("="))&&e.push({name:f[0],value:f[1]});return e};var old=window.reqwest;reqwest.noConflict=function(){window.reqwest=old;return this},window.reqwest=reqwest}(this)
// Instantiate objects based on a JSON "record". The record must be a statement
// array in the following form:
//
//     [ "{verb} {subject}", arg0, arg1, arg2, ... argn ]
//
// Each record is processed from a passed `context` which starts from the
// global (ie. `window`) context if unspecified.
//
// - `@literal` Evaluate `subject` and return its value as a scalar. Useful for
//   referencing API constants, object properties or other values.
// - `@new` Call `subject` as a constructor with args `arg0 - argn`. The
//   newly created object will be the new context.
// - `@call` Call `subject` as a function with args `arg0 - argn` in the
//   global namespace. The return value will be the new context.
// - `@chain` Call `subject` as a method of the current context with args `arg0
//   - argn`. The return value will be the new context.
// - `@inject` Call `subject` as a method of the current context with args
//   `arg0 - argn`. The return value will *not* affect the context.
// - `@group` Treat `arg0 - argn` as a series of statement arrays that share a
//   context. Each statement will be called in serial and affect the context
//   for the next statement.
//
// Usage:
//
//     var gmap = ['@new google.maps.Map',
//         ['@call document.getElementById', 'gmap'],
//         {
//             center: [ '@new google.maps.LatLng', 0, 0 ],
//             zoom: 2,
//             mapTypeId: [ '@literal google.maps.MapTypeId.ROADMAP' ]
//         }
//     ];
//     wax.Record(gmap);
var wax = wax || {};


// TODO: replace with non-global-modifier
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(fun /*, initialValue */) {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var k = 0;
    var accumulator;
    if (arguments.length >= 2) {
      accumulator = arguments[1];
    } else {
      do {
        if (k in t) {
          accumulator = t[k++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++k >= len)
          throw new TypeError();
      }
      while (true);
    }

    while (k < len) {
      if (k in t)
        accumulator = fun.call(undefined, accumulator, t[k], k, t);
      k++;
    }

    return accumulator;
  };
}


wax.Record = function(obj, context) {
    var getFunction = function(head, cur) {
        // TODO: strip out reduce
        var ret = head.split('.').reduce(function(part, segment) {
            return [part[1] || part[0], part[1] ? part[1][segment] : part[0][segment]];
        }, [cur || window, null]);
        if (ret[0] && ret[1]) {
            return ret;
        } else {
            throw head + ' not found.';
        }
    };
    var makeObject = function(fn_name, args) {
        var fn_obj = getFunction(fn_name),
            obj;
        args = args.length ? wax.Record(args) : [];

        // real browsers
        if (Object.create) {
            obj = Object.create(fn_obj[1].prototype);
            fn_obj[1].apply(obj, args);
        // lord have mercy on your soul.
        } else {
            switch (args.length) {
                case 0: obj = new fn_obj[1](); break;
                case 1: obj = new fn_obj[1](args[0]); break;
                case 2: obj = new fn_obj[1](args[0], args[1]); break;
                case 3: obj = new fn_obj[1](args[0], args[1], args[2]); break;
                case 4: obj = new fn_obj[1](args[0], args[1], args[2], args[3]); break;
                case 5: obj = new fn_obj[1](args[0], args[1], args[2], args[3], args[4]); break;
                default: break;
            }
        }
        return obj;
    };
    var runFunction = function(fn_name, args, cur) {
        var fn_obj = getFunction(fn_name, cur);
        var fn_args = args.length ? wax.Record(args) : [];
        // @TODO: This is currently a stopgap measure that calls methods like
        // `foo.bar()` in the context of `foo`. It will probably be necessary
        // in the future to be able to call `foo.bar()` from other contexts.
        if (cur && fn_name.indexOf('.') === -1) {
            return fn_obj[1].apply(cur, fn_args);
        } else {
            return fn_obj[1].apply(fn_obj[0], fn_args);
        }
    };
    var isKeyword = function(string) {
        return wax.util.isString(string) && (wax.util.indexOf([
            '@new',
            '@call',
            '@literal',
            '@chain',
            '@inject',
            '@group'
        ], string.split(' ')[0]) !== -1);
    };
    var altersContext = function(string) {
        return wax.util.isString(string) && (wax.util.indexOf([
            '@new',
            '@call',
            '@chain'
        ], string.split(' ')[0]) !== -1);
    };
    var getStatement = function(obj) {
        if (wax.util.isArray(obj) && obj[0] && isKeyword(obj[0])) {
            return {
                verb: obj[0].split(' ')[0],
                subject: obj[0].split(' ')[1],
                object: obj.slice(1)
            };
        }
        return false;
    };

    var i,
        fn = false,
        ret = null,
        child = null,
        statement = getStatement(obj);
    if (statement) {
        switch (statement.verb) {
        case '@group':
            for (i = 0; i < statement.object.length; i++) {
                ret = wax.Record(statement.object[i], context);
                child = getStatement(statement.object[i]);
                if (child && altersContext(child.verb)) {
                    context = ret;
                }
            }
            return context;
        case '@new':
            return makeObject(statement.subject, statement.object);
        case '@literal':
            fn = getFunction(statement.subject);
            return fn ? fn[1] : null;
        case '@inject':
            return runFunction(statement.subject, statement.object, context);
        case '@chain':
            return runFunction(statement.subject, statement.object, context);
        case '@call':
            return runFunction(statement.subject, statement.object, null);
        }
    } else if (obj !== null && typeof obj === 'object') {
        var keys = wax.util.keys(obj);
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            obj[key] = wax.Record(obj[key], context);
        }
        return obj;
    } else {
        return obj;
    }
};
// Wax GridUtil
// ------------

// Wax header
var wax = wax || {};

// Request
// -------
// Request data cache. `callback(data)` where `data` is the response data.
wax.request = {
    cache: {},
    locks: {},
    promises: {},
    get: function(url, callback) {
        // Cache hit.
        if (this.cache[url]) {
            return callback(this.cache[url][0], this.cache[url][1]);
        // Cache miss.
        } else {
            this.promises[url] = this.promises[url] || [];
            this.promises[url].push(callback);
            // Lock hit.
            if (this.locks[url]) return;
            // Request.
            var that = this;
            this.locks[url] = true;
            reqwest({
                url: url + '?callback=grid',
                type: 'jsonp',
                jsonpCallback: 'callback',
                success: function(data) {
                    that.locks[url] = false;
                    that.cache[url] = [null, data];
                    for (var i = 0; i < that.promises[url].length; i++) {
                        that.promises[url][i](that.cache[url][0], that.cache[url][1]);
                    }
                },
                error: function(err) {
                    that.locks[url] = false;
                    that.cache[url] = [err, null];
                    for (var i = 0; i < that.promises[url].length; i++) {
                        that.promises[url][i](that.cache[url][0], that.cache[url][1]);
                    }
                }
            });
        }
    }
};

// GridInstance
// ------------
// GridInstances are queryable, fully-formed
// objects for acquiring features from events.
wax.GridInstance = function(grid_tile, formatter, options) {
    options = options || {};
    this.grid_tile = grid_tile;
    this.formatter = formatter;
    // resolution is the grid-elements-per-pixel ratio of gridded data.
    this.resolution = options.resolution || 4;
    // The size of a tile element. For now we expect tiles to be squares.
    this.tileSize = options.tileSize || 256;
};

// Resolve the UTF-8 encoding stored in grids to simple
// number values.
// See the [utfgrid section of the mbtiles spec](https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md)
// for details.
wax.GridInstance.prototype.resolveCode = function(key) {
  if (key >= 93) key--;
  if (key >= 35) key--;
  key -= 32;
  return key;
};

// Get a feature:
//
// * `x` and `y`: the screen coordinates of an event
// * `tile_element`: a DOM element of a tile, from which we can get an offset.
// * `options` options to give to the formatter: minimally having a `format`
//   member, being `full`, `teaser`, or something else.
wax.GridInstance.prototype.getFeature = function(x, y, tile_element, options) {
    if (!(this.grid_tile && this.grid_tile.grid)) return;

    // IE problem here - though recoverable, for whatever reason
    var offset = wax.util.offset(tile_element);
    var tileX = offset.left;
    var tileY = offset.top;

    // This tile's resolution. larger tiles will have lower, aka coarser, resolutions
    var res = (offset.width / this.tileSize) * this.resolution;

    if (y - tileY < 0) return;
    if (x - tileX < 0) return;
    if (Math.floor(y - tileY) > this.tileSize) return;
    if (Math.floor(x - tileX) > this.tileSize) return;

    // Find the key in the grid. The above calls should ensure that
    // the grid's array is large enough to make this work.
    var key = this.grid_tile.grid[
       Math.floor((y - tileY) / res)
    ].charCodeAt(
       Math.floor((x - tileX) / res)
    );

    key = this.resolveCode(key);

    // If this layers formatter hasn't been loaded yet,
    // download and load it now.
    if (this.grid_tile.keys[key] && this.grid_tile.data[this.grid_tile.keys[key]]) {
        return this.formatter.format(options, this.grid_tile.data[this.grid_tile.keys[key]]);
    }
};

// GridManager
// -----------
// Generally one GridManager will be used per map.
//
// It takes one options object, which current accepts a single option:
// `resolution` determines the number of pixels per grid element in the grid.
// The default is 4.
wax.GridManager = function(options) {
    options = options || {};
    this.resolution = options.resolution || 4;
    this.grid_tiles = {};
    this.key_maps = {};
    this.formatters = {};
    this.locks = {};
};

// Get a grid - calls `callback` with either a `GridInstance`
// object or false. Behind the scenes, this calls `getFormatter`
// and gets grid data, and tries to avoid re-downloading either.
wax.GridManager.prototype.getGrid = function(url, callback) {
    var that = this;
    that.getFormatter(that.formatterUrl(url), function(err, f) {
        if (err || !f) return callback(err, null);

        wax.request.get(that.tileDataUrl(url), function(err, t) {
            if (err) return callback(err, null);
            callback(null, new wax.GridInstance(t, f, {
                resolution: that.resolution || 4
            }));
        });
    });
};

// Simplistically derive the URL of the grid data endpoint from a tile URL
wax.GridManager.prototype.tileDataUrl = function(url) {
  return url.replace(/(\.png|\.jpg|\.jpeg)(\d*)/, '.grid.json');
};

// Simplistically derive the URL of the formatter function from a tile URL
wax.GridManager.prototype.formatterUrl = function(url) {
  return url.replace(/\d+\/\d+\/\d+\.\w+/, 'layer.json');
};

// Request and save a formatter, passed to `callback()` when finished.
wax.GridManager.prototype.getFormatter = function(url, callback) {
    var that = this;
    // Formatter is cached.
    if (typeof this.formatters[url] !== 'undefined') {
        callback(null, this.formatters[url]);
        return;
    } else {
        wax.request.get(url, function(err, data) {
            if (data && data.formatter) {
                that.formatters[url] = new wax.Formatter(data);
            } else {
                that.formatters[url] = false;
            }
            callback(err, that.formatters[url]);
        });
    }
};

// Formatter
// ---------
wax.Formatter = function(obj) {
    // Prevent against just any input being used.
    if (obj.formatter && typeof obj.formatter === 'string') {
        try {
            // Ugly, dangerous use of eval.
            eval('this.f = ' + obj.formatter);
        } catch (e) {
            // Syntax errors in formatter
            if (console) console.log(e);
        }
    } else {
        this.f = function() {};
    }
};

// Wrap the given formatter function in order to
// catch exceptions that it may throw.
wax.Formatter.prototype.format = function(options, data) {
    try {
        return this.f(options, data);
    } catch (e) {
        if (console) console.log(e);
    }
};
// Wax Legend
// ----------

// Wax header
var wax = wax || {};

wax.Legend = function(context, container) {
    this.legends = {};
    this.context = context;
    this.container = container;
    if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'wax-legends';
    }
    this.context.appendChild(this.container);
};

wax.Legend.prototype.render = function(urls) {
    var url;
    for (url in this.legends) {
        this.legends[url].style.display = 'none';
    }
    var render = wax.util.bind(function(url, content) {
        if (!content) {
            this.legends[url] = false;
        } else if (this.legends[url]) {
            this.legends[url].style.display = 'block';
        } else {
            this.legends[url] = document.createElement('div');
            this.legends[url].className = 'wax-legend';
            this.legends[url].innerHTML = content;
            this.container.appendChild(this.legends[url]);
        }
    }, this);
    for (var i = 0; i < urls.length; i++) {
        url = this.legendUrl(urls[i]);
        wax.request.get(url, function(err, data) {
            if (data && data.legend) render(url, data.legend);
        });
    }
};

wax.Legend.prototype.legendUrl = function(url) {
    return url.replace(/\d+\/\d+\/\d+\.\w+/, 'layer.json');
};

// Like underscore's bind, except it runs a function
// with no arguments off of an object.
//
//     var map = ...;
//     w(map).melt(myFunction);
//
// is equivalent to
//
//     var map = ...;
//     myFunction(map);
//
var w = function(self) {
    self.melt = function(func, obj) {
        func.apply(obj, [self, obj]);
        return self;
    };
    return self;
};
var wax = wax || {};
wax.tooltip = {};

wax.tooltip = function(options) {
    this._currentTooltip = undefined;
    options = options || {};
    if (options.animationOut) this.animationOut = options.animationOut;
    if (options.animationIn) this.animationIn = options.animationIn;
};

// Helper function to determine whether a given element is a wax popup.
wax.tooltip.prototype.isPopup = function(el) {
    return el && el.className.indexOf('wax-popup') !== -1;
};

// Get the active tooltip for a layer or create a new one if no tooltip exists.
// Hide any tooltips on layers underneath this one.
wax.tooltip.prototype.getTooltip = function(feature, context, index, evt) {
    tooltip = document.createElement('div');
    tooltip.className = 'wax-tooltip wax-tooltip-' + index;
    tooltip.innerHTML = feature;
    context.appendChild(tooltip);
    return tooltip;
};

// Hide a given tooltip.
wax.tooltip.prototype.hideTooltip = function(el) {
    if (!el) return;
    var event;
    var remove = function() {
        this.parentNode.removeChild(this);
    };
    if (el.style['-webkit-transition'] !== undefined && this.animationOut) {
        event = 'webkitTransitionEnd';
    } else if (el.style.MozTransition !== undefined && this.animationOut) {
        event = 'transitionend';
    }
    if (event) {
        el.addEventListener(event, remove, false);
        el.addEventListener('transitionend', remove, false);
        el.className += ' ' + this.animationOut;
    } else {
        el.parentNode.removeChild(el);
    }
};

// Expand a tooltip to be a "popup". Suspends all other tooltips from being
// shown until this popup is closed or another popup is opened.
wax.tooltip.prototype.click = function(feature, context, index) {
    // Hide any current tooltips.
    this.unselect(context);

    var tooltip = this.getTooltip(feature, context, index);
    var close = document.createElement('a');
    close.href = '#close';
    close.className = 'close';
    close.innerHTML = 'Close';

    var closeClick = wax.util.bind(function(ev) {
        this.hideTooltip(tooltip);
        this._currentTooltip = undefined;
        ev.returnValue = false; // Prevents hash change.
        if (ev.stopPropagation) ev.stopPropagation();
        if (ev.preventDefault) ev.preventDefault();
        return false;
    }, this);
    // IE compatibility.
    if (close.addEventListener) {
        close.addEventListener('click', closeClick, false);
    } else if (close.attachEvent) {
        close.attachEvent('onclick', closeClick);
    }

    tooltip.className += ' wax-popup';
    tooltip.innerHTML = feature;
    tooltip.appendChild(close);
    this._currentTooltip = tooltip;
};

// Show a tooltip.
wax.tooltip.prototype.select = function(feature, context, layer_id, evt) {
    if (!feature) return;
    if (this.isPopup(this._currentTooltip)) return;

    this._currentTooltip = this.getTooltip(feature, context, layer_id, evt);
    context.style.cursor = 'pointer';
};


// Hide all tooltips on this layer and show the first hidden tooltip on the
// highest layer underneath if found.
wax.tooltip.prototype.unselect = function(context) {
    if (this.isPopup(this._currentTooltip)) return;

    context.style.cursor = 'default';
    if (this._currentTooltip) {
        this.hideTooltip(this._currentTooltip);
        this._currentTooltip = undefined;
    }
};

wax.tooltip.prototype.out = wax.tooltip.prototype.unselect;
wax.tooltip.prototype.over = wax.tooltip.prototype.select;
wax.tooltip.prototype.click = wax.tooltip.prototype.click;
wax.util = wax.util || {};

// Utils are extracted from other libraries or
// written from scratch to plug holes in browser compatibility.
wax.util = {
    // From Bonzo
    offset: function(el) {
        // TODO: window margin offset
        var width = el.offsetWidth,
            height = el.offsetHeight,
            top = 0,
            left = 0;

        var calculateOffset = function(el) {
            if (el === document.body || el === document.documentElement) return;
            top += el.offsetTop;
            left += el.offsetLeft;

            // Add additional CSS3 transform handling.
            // These features are used by Google Maps API V3.
            var style = el.style.transform ||
                el.style['-webkit-transform'] ||
                el.style.MozTransform;
            if (style) {
                if (match = style.match(/translate\((.+)px, (.+)px\)/)) {
                    top += parseInt(match[2], 10);
                    left += parseInt(match[1], 10);
                } else if (match = style.match(/translate3d\((.+)px, (.+)px, (.+)px\)/)) {
                    top += parseInt(match[2], 10);
                    left += parseInt(match[1], 10);
                }
            }
        };

        calculateOffset(el);

        try {
            while (el = el.offsetParent) calculateOffset(el);
        } catch(e) {
            // Hello, internet explorer.
        }

        // Offsets from the body
        top += document.body.offsetTop;
        left += document.body.offsetLeft;
        // Offsets from the HTML element
        top += document.body.parentNode.offsetTop;
        left += document.body.parentNode.offsetLeft;

        // Firefox and other weirdos. Similar technique to jQuery's
        // `doesNotIncludeMarginInBodyOffset`.
        var htmlComputed = document.defaultView ?
          window.getComputedStyle(document.body.parentNode) :
          document.body.parentNode.currentStyle;
        if (document.body.parentNode.offsetTop !==
            parseInt(htmlComputed.marginTop, 10) &&
            !isNaN(parseInt(htmlComputed.marginTop, 10))) {
            top += parseInt(htmlComputed.marginTop, 10);
            left += parseInt(htmlComputed.marginLeft, 10);
        }

        return {
            top: top,
            left: left,
            height: height,
            width: width
        };
    },
    // From underscore, minus funcbind for now.
    // Returns a version of a function that always has the second parameter,
    // `obj`, as `this`.
    bind: function(func, obj) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function() {
        return func.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
      };
    },
    // From underscore
    isString: function(obj) {
      return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
    },
    // IE doesn't have indexOf
    indexOf: function(array, item) {
      var nativeIndexOf = Array.prototype.indexOf;
      if (array === null) return -1;
      var i, l;
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
      return -1;
    },
    // is this object an array?
    isArray: Array.isArray || function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    // From underscore: reimplement the ECMA5 `Object.keys()` methodb
    keys: Object.keys || function(obj) {
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      if (obj !== Object(obj)) throw new TypeError('Invalid object');
      var keys = [];
      for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
      return keys;
    },
    // From quirksmode: normalize the offset of an event from the top-left
    // of the page.
    eventoffset: function(e) {
        var posx = 0;
        var posy = 0;
        if (!e) var e = window.event;
        if (e.pageX || e.pageY) {
            // Good browsers
            return {
                x: e.pageX,
                y: e.pageY
            };
        } else if (e.clientX || e.clientY) {
            // Internet Explorer
            var doc = document.documentElement, body = document.body;
            var htmlComputed = document.body.parentNode.currentStyle;
            var topMargin = parseInt(htmlComputed.marginTop, 10) || 0;
            var leftMargin = parseInt(htmlComputed.marginLeft, 10) || 0;
            return {
                x: e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                  (doc && doc.clientLeft || body && body.clientLeft || 0) + leftMargin,
                y: e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                  (doc && doc.clientTop  || body && body.clientTop  || 0) + topMargin
            };
        } else if (e.touches && e.touches.length === 1) {
            // Touch browsers
            return {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY
            };
        }
    }
};
wax = wax || {};
wax.mm = wax.mm || {};

// Box Selector
// ------------
wax.mm.boxselector = function(map, opts) {
    var mouseDownPoint = null;

    var callback = (typeof opts === 'function') ?
        opts :
        opts.callback;

    var boxselector = {
        add: function(map) {
            this.boxDiv = document.createElement('div');
            this.boxDiv.id = map.parent.id + '-boxselector-box';
            this.boxDiv.className = 'boxselector-box';
            map.parent.appendChild(this.boxDiv);

            com.modestmaps.addEvent(map.parent, 'mousedown', this.mouseDown());
            map.addCallback('drawn', this.drawbox());
        },
        remove: function() {
            map.parent.removeChild(this.boxDiv);
            map.removeCallback('mousedown', this.drawbox());
        },
        getMousePoint: function(e) {
            // start with just the mouse (x, y)
            var point = new com.modestmaps.Point(e.clientX, e.clientY);
            // correct for scrolled document
            point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
            point.y += document.body.scrollTop + document.documentElement.scrollTop;

            // correct for nested offsets in DOM
            for (var node = map.parent; node; node = node.offsetParent) {
                point.x -= node.offsetLeft;
                point.y -= node.offsetTop;
            }
            return point;
        },
        mouseDown: function() {
            if (!this._mouseDown) this._mouseDown = wax.util.bind(function(e) {
                if (e.shiftKey) {
                    mouseDownPoint = this.getMousePoint(e);

                    this.boxDiv.style.left = mouseDownPoint.x + 'px';
                    this.boxDiv.style.top = mouseDownPoint.y + 'px';

                    com.modestmaps.addEvent(map.parent, 'mousemove', this.mouseMove());
                    com.modestmaps.addEvent(map.parent, 'mouseup', this.mouseUp());

                    map.parent.style.cursor = 'crosshair';
                    return com.modestmaps.cancelEvent(e);
                }
            }, this);
            return this._mouseDown;
        },
        mouseMove: function(e) {
            if (!this._mouseMove) this._mouseMove = wax.util.bind(function(e) {
                var point = this.getMousePoint(e);
                this.boxDiv.style.display = 'block';
                if (point.x < mouseDownPoint.x) {
                    this.boxDiv.style.left = point.x + 'px';
                } else {
                    this.boxDiv.style.left = mouseDownPoint.x + 'px';
                }
                this.boxDiv.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
                if (point.y < mouseDownPoint.y) {
                    this.boxDiv.style.top = point.y + 'px';
                } else {
                    this.boxDiv.style.top = mouseDownPoint.y + 'px';
                }
                this.boxDiv.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
                return com.modestmaps.cancelEvent(e);
            }, this);
            return this._mouseMove;
        },
        mouseUp: function() {
            if (!this._mouseUp) this._mouseUp = wax.util.bind(function(e) {
                var point = boxselector.getMousePoint(e);

                var l1 = map.pointLocation(point),
                    l2 = map.pointLocation(mouseDownPoint);

                // Format coordinates like mm.map.getExtent().
                var extent = [
                    new com.modestmaps.Location(
                        Math.max(l1.lat, l2.lat),
                        Math.min(l1.lon, l2.lon)),
                    new com.modestmaps.Location(
                        Math.min(l1.lat, l2.lat),
                        Math.max(l1.lon, l2.lon))
                ];

                this.box = [l1, l2];
                callback(extent);

                com.modestmaps.removeEvent(map.parent, 'mousemove', this.mouseMove());
                com.modestmaps.removeEvent(map.parent, 'mouseup', this.mouseUp());

                map.parent.style.cursor = 'auto';
            }, this);
            return this._mouseUp;
        },
        drawbox: function() {
            if (!this._drawbox) this._drawbox = wax.util.bind(function(map, e) {
                if (this.boxDiv) {
                    this.boxDiv.style.display = 'block';
                    this.boxDiv.style.height = 'auto';
                    this.boxDiv.style.width = 'auto';
                    var br = map.locationPoint(this.box[0]);
                    var tl = map.locationPoint(this.box[1]);
                    this.boxDiv.style.left = Math.max(0, tl.x) + 'px';
                    this.boxDiv.style.top = Math.max(0, tl.y) + 'px';
                    this.boxDiv.style.right = Math.max(0, map.dimensions.x - br.x) + 'px';
                    this.boxDiv.style.bottom = Math.max(0, map.dimensions.y - br.y) + 'px';
                }
            }, this);
            return this._drawbox;
        }
    };

    return boxselector.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// Fullscreen
// ----------
// A simple fullscreen control for Modest Maps

// Add zoom links, which can be styled as buttons, to a `modestmaps.Map`
// control. This function can be used chaining-style with other
// chaining-style controls.
wax.mm.fullscreen = function(map, opts) {

    var fullscreen = {
        state: 1, // minimized

        // Modest Maps demands an absolute height & width, and doesn't auto-correct
        // for changes, so here we save the original size of the element and
        // restore to that size on exit from fullscreen.
        add: function(map) {
            this.a = document.createElement('a');
            this.a.className = 'wax-fullscreen';
            this.a.href = '#fullscreen';
            this.a.innerHTML = 'fullscreen';
            map.parent.appendChild(this.a);
            com.modestmaps.addEvent(this.a, 'click', this.click(map));
            return this;
        },

        click: function(map) {
            if (this._click) return this._click;
            else this._click = wax.util.bind(function(e) {
                if (e) com.modestmaps.cancelEvent(e);

                if (this.state) {
                    this.smallSize = [map.parent.offsetWidth, map.parent.offsetHeight];
                    map.parent.className += ' wax-fullscreen-map';
                    map.setSize(
                        map.parent.offsetWidth,
                        map.parent.offsetHeight);
                } else {
                    map.parent.className = map.parent.className.replace('wax-fullscreen-map', '');
                    map.setSize(
                        this.smallSize[0],
                        this.smallSize[1]);
                }
                this.state = !this.state;
            }, this);
            return this._click;
        }
    };

    return fullscreen.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// A basic manager dealing only in hashchange and `location.hash`.
// This **will interfere** with anchors, so a HTML5 pushState
// implementation will be preferred.
wax.mm.locationHash = {
  stateChange: function(callback) {
    com.modestmaps.addEvent(window, 'hashchange', function() {
      callback(location.hash);
    }, false);
  },
  getState: function() {
    return location.hash.substring(1);
  },
  pushState: function(state) {
    location.hash = '#' + state;
  }
};

// a HTML5 pushstate-based hash changer.
//
// This **does not degrade** with non-supporting browsers - it simply
// does nothing.
wax.mm.pushState = {
  stateChange: function(callback) {
      com.modestmaps.addEvent(window, 'popstate', function(e) {
          if (e.state && e.state.map_location) {
              callback(e.state.map_location);
          }
      }, false);
  },
  getState: function() {
     if (!(window.history && window.history.state)) return;
     return history.state && history.state.map_location;
  },
  // Push states - so each substantial movement of the map
  // is a history object.
  pushState: function(state) {
      if (!(window.history && window.history.pushState)) return;
      window.history.pushState({ map_location: state });
  }
};

// Hash
// ----
wax.mm.hash = function(map, options) {
    // cached location.hash
    var s0,
        // allowable latitude range
        lat = 90 - 1e-8;

    // Ripped from underscore.js
    // Internal function used to implement `_.throttle` and `_.debounce`.
    var limit = function(func, wait, debounce) {
        var timeout;
          return function() {
              var context = this, args = arguments;
              var throttler = function() {
                  timeout = null;
                  func.apply(context, args);
              };
              if (debounce) clearTimeout(timeout);
              if (debounce || !timeout) timeout = setTimeout(throttler, wait);
          };
    };

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time.
    var throttle = function(func, wait) {
        return limit(func, wait, false);
    };

    var hash = {
        map: this,
        parser: function(s) {
            var args = s.split('/');
            for (var i = 0; i < args.length; i++) {
                args[i] = Number(args[i]);
                if (isNaN(args[i])) return true;
            }
            if (args.length < 3) {
                // replace bogus hash
                return true;
            } else if (args.length == 3) {
                map.setCenterZoom(new com.modestmaps.Location(args[1], args[2]), args[0]);
            }
        },
        add: function(map) {
            if (options.manager.getState()) {
                hash.stateChange(options.manager.getState());
            } else {
                hash.initialize();
                hash.move();
            }
            map.addCallback('drawn', throttle(hash.move, 500));
            options.manager.stateChange(hash.stateChange);
        },
        // Currently misnamed. Get the hash string that will go in the URL,
        // pulling from the map object
        formatter: function() {
            var center = map.getCenter(),
                zoom = map.getZoom(),
                precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
            return [zoom.toFixed(2),
              center.lat.toFixed(precision),
              center.lon.toFixed(precision)].join('/');
        },
        move: function() {
            var s1 = hash.formatter();
            if (s0 !== s1) {
                s0 = s1;
                // don't recenter the map!
                options.manager.pushState(s0);
            }
        },
        stateChange: function(state) {
            // ignore spurious hashchange events
            if (state === s0) return;
            if (hash.parser(s0 = state)) {
                // replace bogus hash
                hash.move();
            }
        },
        // If a state isn't present when you initially load the map, the map should
        // still get a center and zoom level.
        initialize: function() {
            if (options.defaultCenter) map.setCenter(options.defaultCenter);
            if (options.defaultZoom) map.setZoom(options.defaultZoom);
        }
    };
    return hash.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// A chaining-style control that adds
// interaction to a modestmaps.Map object.
//
// Takes an options object with the following keys:
//
// * `callbacks` (optional): an `out`, `over`, and `click` callback.
//   If not given, the `wax.tooltip` library will be expected.
// * `clickAction` (optional): **full** or **location**: default is
//   **full**.
// * `clickHandler` (optional): if not given, `clickAction: 'location'` will
//   assign a location to your window with `window.location = 'location'`.
//   To make location-getting work with other systems, like those based on
//   pushState or Backbone, you can provide a custom function of the form
//
//
//     `clickHandler: function(url) { ... go to url ... }`
wax.mm.interaction = function(map, options) {
    var MM = com.modestmaps;
    options = options || {};

    var interaction = {
        modifyingEvents: ['zoomed', 'panned', 'centered',
            'extentset', 'resized', 'drawn'],

        // Our GridManager (from `gridutil.js`). This will keep the
        // cache of grid information and provide friendly utility methods
        // that return `GridTile` objects instead of raw data.
        waxGM: new wax.GridManager(),

        // This requires wax.Tooltip or similar
        callbacks: options.callbacks || new wax.tooltip(),

        clickAction: options.clickAction || ['full'],

        clickHandler: options.clickHandler || function(url) {
            window.location = url;
        },

        // Attach listeners to the map
        add: function() {
            for (var i = 0; i < this.modifyingEvents.length; i++) {
                map.addCallback(
                    this.modifyingEvents[i],
                    wax.util.bind(this.clearTileGrid, this)
                );
            }
            if (!wax.util.isArray(this.clickAction)) this.clickAction = [this.clickAction];
            MM.addEvent(map.parent, 'mousemove', this.onMove());
            MM.addEvent(map.parent, 'mousedown', this.onDown());
            if (map.parent.ontouchstart) {
                MM.addEvent(map.parent, 'touchstart', this.onDown());
            }
            return this;
        },

        // Search through `.tiles` and determine the position,
        // from the top-left of the **document**, and cache that data
        // so that `mousemove` events don't always recalculate.
        getTileGrid: function() {
            // TODO: don't build for tiles outside of viewport
            // Touch interaction leads to intermediate
            var zoom = Math.round(map.getZoom());
            // Calculate a tile grid and cache it, by using the `.tiles`
            // element on this map.
            return this._getTileGrid || (this._getTileGrid =
                (function(t) {
                    var o = [];
                    for (var key in t) {
                        if (key.split(',')[0] == zoom) {
                            var offset = wax.util.offset(t[key]);
                            o.push([offset.top, offset.left, t[key]]);
                        }
                    }
                    return o;
                })(map.tiles));
        },

        // When the map moves, the tile grid is no longer valid.
        clearTileGrid: function(map, e) {
            this._getTileGrid = null;
        },

        getTile: function(evt) {
            var tile;
            var grid = this.getTileGrid();
            for (var i = 0; i < grid.length; i++) {
                if ((grid[i][0] < evt.y) &&
                   ((grid[i][0] + 256) > evt.y) &&
                    (grid[i][1] < evt.x) &&
                   ((grid[i][1] + 256) > evt.x)) {
                    tile = grid[i][2];
                    break;
                }
            }
            return tile || false;
        },

        // Clear the double-click timeout to prevent double-clicks from
        // triggering popups.
        clearTimeout: function() {
            if (this.clickTimeout) {
                window.clearTimeout(this.clickTimeout);
                this.clickTimeout = null;
                return true;
            } else {
                return false;
            }
        },

        onMove: function(evt) {
            if (!this._onMove) this._onMove = wax.util.bind(function(evt) {
                var pos = wax.util.eventoffset(evt);
                var tile = this.getTile(pos);
                if (tile) {
                    this.waxGM.getGrid(tile.src, wax.util.bind(function(err, g) {
                        if (err) return;
                        if (g) {
                            var feature = g.getFeature(pos.x, pos.y, tile, {
                                format: 'teaser'
                            });
                            // This and other Modest Maps controls only support a single layer.
                            // Thus a layer index of **0** is given to the tooltip library
                            if (feature) {
                                if (feature && this.feature !== feature) {
                                    this.feature = feature;
                                    this.callbacks.out(map.parent);
                                    this.callbacks.over(feature, map.parent, 0, evt);
                                } else if (!feature) {
                                    this.feature = null;
                                    this.callbacks.out(map.parent);
                                }
                            } else {
                                this.feature = null;
                                this.callbacks.out(map.parent);
                            }
                        }
                    }, this));
                }
            }, this);
            return this._onMove;
        },

        // A handler for 'down' events - which means `mousedown` and `touchstart`
        onDown: function(evt) {
            if (!this._onDown) this._onDown = wax.util.bind(function(evt) {
                // Ignore double-clicks by ignoring clicks within 300ms of
                // each other.
                if (this.clearTimeout()) {
                    return;
                }
                // Store this event so that we can compare it to the
                // up event
                this.downEvent = wax.util.eventoffset(evt);
                if (evt.type === 'mousedown') {
                    MM.addEvent(map.parent, 'mouseup', this.onUp());
                // Only track single-touches. Double-touches will not affect this
                // control
                } else if (evt.type === 'touchstart' && evt.touches.length === 1) {
                    // turn this into touch-mode. Fallback to teaser and full.
                    this.clickAction = ['full', 'teaser'];
                    // Don't make the user click close if they hit another tooltip
                    if (this.callbacks._currentTooltip) {
                        this.callbacks.hideTooltip(this.callbacks._currentTooltip);
                    }
                    // Touch moves invalidate touches
                    MM.addEvent(map.parent, 'touchend', this.onUp());
                    MM.addEvent(map.parent, 'touchmove', this.touchCancel());
                }
            }, this);
            return this._onDown;
        },

        // If we get a touchMove event, it isn't a tap.
        touchCancel: function() {
            if (!this._touchCancel) this._touchCancel = wax.util.bind(function(evt) {
                MM.removeEvent(map.parent, 'touchend', this.onUp());
                MM.removeEvent(map.parent, 'touchmove', this.onUp());
            }, this);
            return this._touchCancel;
        },

        onUp: function() {
            if (!this._onUp) this._onUp = wax.util.bind(function(evt) {
                MM.removeEvent(map.parent, 'mouseup', this.onUp());
                if (map.parent.ontouchend) {
                    MM.removeEvent(map.parent, 'touchend', this.onUp());
                    MM.removeEvent(map.parent, 'touchmove', this.touchCancel());
                }
                // Don't register clicks that are likely the boundaries
                // of dragging the map
                // The tolerance between the place where the mouse goes down
                // and where where it comes up is set at 4px.
                var tol = 4;
                var pos = wax.util.eventoffset(evt);
                if (evt.type === 'touchend') {
                    // If this was a touch and it survived, there's no need to avoid a double-tap
                    this.click()(this.downEvent);
                } else if (Math.round(pos.y / tol) === Math.round(this.downEvent.y / tol) &&
                    Math.round(pos.x / tol) === Math.round(this.downEvent.x / tol)) {
                    // Contain the event data in a closure.
                    this.clickTimeout = window.setTimeout(
                        wax.util.bind(function() { this.click()(pos); }, this), 300);
                }
            }, this);
            return this._onUp;
        },

        // Handle a click event. Takes a second
        click: function(evt) {
            if (!this._onClick) this._onClick = wax.util.bind(function(pos) {
                var tile = this.getTile(pos);
                if (tile) {
                    this.waxGM.getGrid(tile.src, wax.util.bind(function(err, g) {
                        if (g) {
                            for (var i = 0; i < this.clickAction.length; i++) {
                                var feature = g.getFeature(pos.x, pos.y, tile, {
                                    format: this.clickAction[i]
                                });
                                if (feature) {
                                    switch (this.clickAction[i]) {
                                        case 'full':
                                        // clickAction can be teaser in touch interaction
                                        case 'teaser':
                                            return this.callbacks.click(feature, map.parent, 0, evt);
                                            break;
                                        case 'location':
                                            return this.clickHandler(feature);
                                            break;
                                    }
                                }
                            }
                        }
                    }, this));
                }
            }, this);
            return this._onClick;
        }
    };

    // Ensure chainability
    return interaction.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// Legend Control
// --------------
// The Modest Maps version of this control is a very, very
// light wrapper around the `/lib` code for legends.
wax.mm.legend = function(map, options) {
    options = options || {};
    var legend = {
        add: function() {
            this.legend = new wax.Legend(map.parent, options.container);
            this.legend.render([
                map.provider.getTileUrl({
                    zoom: 0,
                    column: 0,
                    row: 0
                })
            ]);
        }
    };
    return legend.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// Mobile
// ------
// For making maps on normal websites nicely mobile-ized
wax.mm.mobile = function(map, opts) {
    opts = opts || {};
    // Inspired by Leaflet
    var mm = com.modestmaps,
        ua = navigator.userAgent.toLowerCase(),
        isWebkit = ua.indexOf("webkit") != -1,
        isMobile = ua.indexOf("mobile") != -1,
        mobileWebkit = isMobile && isWebkit;

    var defaultOverlayDraw = function(div) {
        var canvas = document.createElement('canvas');
        var width = parseInt(div.style.width, 10),
            height = parseInt(div.style.height, 10),
            w2 = width / 2,
            h2 = height / 2,
            // Make the size of the arrow nicely proportional to the map
            size = Math.min(width, height) / 4;

        var ctx = canvas.getContext('2d');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        ctx.globalAlpha = 0.5;
        // Draw a nice gradient to signal that the map is inaccessible
        var inactive = ctx.createLinearGradient(0, 0, 300, 225);
        inactive.addColorStop(0, "black");
        inactive.addColorStop(1, "rgb(200, 200, 200)");
        ctx.fillStyle = inactive;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.beginPath();
        ctx.moveTo(w2 - size * 0.6, h2 - size); // give the (x,y) coordinates
        ctx.lineTo(w2 - size * 0.6, h2 + size);
        ctx.lineTo(w2 + size * 0.6, h2);
        ctx.fill();

        // Done! Now fill the shape, and draw the stroke.
        // Note: your shape will not be visible until you call any of the two methods.
        div.appendChild(canvas);
    };

    var defaultBackDraw = function(div) {
        div.style.position = 'absolute';
        div.style.height = '50px';
        div.style.left =
            div.style.right = '0';

        var canvas = document.createElement('canvas');
        canvas.setAttribute('width', div.offsetWidth);
        canvas.setAttribute('height', div.offsetHeight);

        var ctx = canvas.getContext('2d');
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, div.offsetWidth, div.offsetHeight);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("back", 20, 30);
        div.appendChild(canvas);
    };

    var maximizeElement = function(elem) {
        elem.style.position = 'absolute';
        elem.style.width =
            elem.style.height = 'auto';
        elem.style.top = (window.pageYOffset) + 'px';
        elem.style.left =
            elem.style.right = '0px';
    };

    var minimizeElement = function(elem) {
        elem.style.position = 'relative';
        elem.style.width =
            elem.style.height =
            elem.style.top =
            elem.style.left =
            elem.style.right = 'auto';
    };

    var overlayDiv,
        oldBody,
        standIn,
        meta,
        overlayDraw = opts.overlayDraw || defaultOverlayDraw,
        backDraw = opts.backDraw || defaultBackDraw;
        bodyDraw = opts.bodyDraw || function() {};

    var mobile = {
        add: function(map) {
            // Code in this block is only run on Mobile Safari;
            // therefore HTML5 Canvas is fine.
            if (mobileWebkit) {
                meta = document.createElement('meta');
                meta.id = 'wax-touch';
                meta.setAttribute('name', 'viewport');
                overlayDiv = document.createElement('div');
                overlayDiv.id = map.parent.id + '-mobileoverlay';
                overlayDiv.className = 'wax-mobileoverlay';
                overlayDiv.style.position = 'absolute';
                overlayDiv.style.width = map.dimensions.x + 'px';
                overlayDiv.style.height = map.dimensions.y + 'px';
                map.parent.appendChild(overlayDiv);
                overlayDraw(overlayDiv);

                standIn = document.createElement('div');
                backDiv = document.createElement('div');
                // Store the old body - we'll need it.
                oldBody = document.body;

                newBody = document.createElement('body');
                newBody.className = 'wax-mobile-body';
                newBody.appendChild(backDiv);

                mm.addEvent(overlayDiv, 'touchstart', this.toTouch);
                mm.addEvent(backDiv, 'touchstart', this.toPage);
            }
            return this;
        },
        // Enter "touch mode"
        toTouch: function() {
            // Enter a new body
            map.parent.parentNode.replaceChild(standIn, map.parent);
            newBody.insertBefore(map.parent, backDiv);
            document.body = newBody;

            bodyDraw(newBody);
            backDraw(backDiv);
            meta.setAttribute('content',
                'initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0');
            document.head.appendChild(meta);
            map._smallSize = [map.parent.clientWidth, map.parent.clientHeight];
            maximizeElement(map.parent);
            map.setSize(
                map.parent.offsetWidth,
                window.innerHeight);
            backDiv.style.display = 'block';
            overlayDiv.style.display = 'none';
        },
        // Return from touch mode
        toPage: function() {
            // Currently this code doesn't, and can't, reset the
            // scale of the page. Anything to not use the meta-element
            // would be a bit of a hack.
            document.body = oldBody;
            standIn.parentNode.replaceChild(map.parent, standIn);
            minimizeElement(map.parent);
            map.setSize(map._smallSize[0], map._smallSize[1]);
            backDiv.style.display = 'none';
            overlayDiv.style.display = 'block';
        }
    };
    return mobile.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// Point Selector
// --------------
//
// This takes an object of options:
//
// * `callback`: a function called with an array of `com.modestmaps.Location`
//   objects when the map is edited
//
// It also exposes a public API function: `addLocation`, which adds a point
// to the map as if added by the user.
wax.mm.pointselector = function(map, opts) {
    var mouseDownPoint = null,
        mouseUpPoint = null,
        tolerance = 5,
        overlayDiv,
        MM = com.modestmaps,
        locations = [];

    var callback = (typeof opts === 'function') ?
        opts :
        opts.callback;

    // Create a `com.modestmaps.Point` from a screen event, like a click.
    var makePoint = function(e) {
        var coords = wax.util.eventoffset(e);
        var point = new MM.Point(coords.x, coords.y);
        // correct for scrolled document

        // and for the document
        var body = {
            x: parseFloat(MM.getStyle(document.documentElement, 'margin-left')),
            y: parseFloat(MM.getStyle(document.documentElement, 'margin-top'))
        };

        if (!isNaN(body.x)) point.x -= body.x;
        if (!isNaN(body.y)) point.y -= body.y;

        // TODO: use wax.util.offset
        // correct for nested offsets in DOM
        for (var node = map.parent; node; node = node.offsetParent) {
            point.x -= node.offsetLeft;
            point.y -= node.offsetTop;
        }
        return point;
    };

    // Currently locations in this control contain circular references to elements.
    // These can't be JSON encoded, so here's a utility to clean the data that's
    // spit back.
    function cleanLocations(locations) {
        var o = [];
        for (var i = 0; i < locations.length; i++) {
            o.push(new MM.Location(locations[i].lat, locations[i].lon));
        }
        return o;
    }

    var pointselector = {
        // Attach this control to a map by registering callbacks
        // and adding the overlay
        add: function(map) {
            MM.addEvent(map.parent, 'mousedown', this.mouseDown());
            map.addCallback('drawn', pointselector.drawPoints());
            return this;
        },
        deletePoint: function(location, e) {
            if (confirm('Delete this point?')) {
                location.pointDiv.parentNode.removeChild(location.pointDiv);
                locations.splice(wax.util.indexOf(locations, location), 1);
                callback(cleanLocations(locations));
            }
        },
        // Redraw the points when the map is moved, so that they stay in the
        // correct geographic locations.
        drawPoints: function() {
            if (!this._drawPoints) this._drawPoints = wax.util.bind(function() {
                var offset = new MM.Point(0, 0);
                for (var i = 0; i < locations.length; i++) {
                    var point = map.locationPoint(locations[i]);
                    if (!locations[i].pointDiv) {
                        locations[i].pointDiv = document.createElement('div');
                        locations[i].pointDiv.className = 'wax-point-div';
                        locations[i].pointDiv.style.position = 'absolute';
                        locations[i].pointDiv.style.display = 'block';
                        // TODO: avoid circular reference
                        locations[i].pointDiv.location = locations[i];
                        // Create this closure once per point
                        MM.addEvent(locations[i].pointDiv, 'mouseup',
                            (function selectPointWrap(e) {
                            var l = locations[i];
                            return function(e) {
                                MM.removeEvent(map.parent, 'mouseup', pointselector.mouseUp());
                                pointselector.deletePoint(l, e);
                            };
                        })());
                        map.parent.appendChild(locations[i].pointDiv);
                    }
                    locations[i].pointDiv.style.left = point.x + 'px';
                    locations[i].pointDiv.style.top = point.y + 'px';
                }
            }, this);
            return this._drawPoints;
        },
        mouseDown: function() {
            if (!this._mouseDown) this._mouseDown = wax.util.bind(function(e) {
                mouseDownPoint = makePoint(e);
                MM.addEvent(map.parent, 'mouseup', this.mouseUp());
            }, this);
            return this._mouseDown;
        },
        // API for programmatically adding points to the map - this
        // calls the callback for ever point added, so it can be symmetrical.
        // Useful for initializing the map when it's a part of a form.
        addLocation: function(location) {
            locations.push(location);
            pointselector.drawPoints()();
            callback(cleanLocations(locations));
        },
        // Remove the awful circular reference from locations.
        // TODO: This function should be made unnecessary by not having it.
        mouseUp: function() {
            if (!this._mouseUp) this._mouseUp = wax.util.bind(function(e) {
                if (!mouseDownPoint) return;
                mouseUpPoint = makePoint(e);
                if (MM.Point.distance(mouseDownPoint, mouseUpPoint) < tolerance) {
                    this.addLocation(map.pointLocation(mouseDownPoint));
                    callback(cleanLocations(locations));
                }
                mouseDownPoint = null;
            }, this);
            return this._mouseUp;
        }
    };

    return pointselector.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// ZoomBox
// -------
// An OL-style ZoomBox control, from the Modest Maps example.
wax.mm.zoombox = function(map, opts) {
    // TODO: respond to resize
    var mouseDownPoint = null;

    var zoombox = {
        add: function(map) {
            this.box = document.createElement('div');
            this.box.id = map.parent.id + '-zoombox-box';
            this.box.className = 'zoombox-box';
            map.parent.appendChild(this.box);
            com.modestmaps.addEvent(map.parent, 'mousedown', this.mouseDown());
        },
        remove: function() {
            map.parent.removeChild(this.box);
            map.removeCallback('mousedown', this.mouseDown);
        },
        getMousePoint: function(e) {
            // start with just the mouse (x, y)
            var point = new com.modestmaps.Point(e.clientX, e.clientY);
            // correct for scrolled document
            point.x += document.body.scrollLeft + document.documentElement.scrollLeft;
            point.y += document.body.scrollTop + document.documentElement.scrollTop;

            // correct for nested offsets in DOM
            for (var node = map.parent; node; node = node.offsetParent) {
                point.x -= node.offsetLeft;
                point.y -= node.offsetTop;
            }
            return point;
        },
        mouseDown: function() {
            if (!this._mouseDown) this._mouseDown = wax.util.bind(function(e) {
                if (e.shiftKey) {
                    mouseDownPoint = this.getMousePoint(e);

                    this.box.style.left = mouseDownPoint.x + 'px';
                    this.box.style.top = mouseDownPoint.y + 'px';

                    com.modestmaps.addEvent(map.parent, 'mousemove', this.mouseMove());
                    com.modestmaps.addEvent(map.parent, 'mouseup', this.mouseUp());

                    map.parent.style.cursor = 'crosshair';
                    return com.modestmaps.cancelEvent(e);
                }
            }, this);
            return this._mouseDown;
        },
        mouseMove: function(e) {
            if (!this._mouseMove) this._mouseMove = wax.util.bind(function(e) {
                var point = this.getMousePoint(e);
                this.box.style.display = 'block';
                if (point.x < mouseDownPoint.x) {
                    this.box.style.left = point.x + 'px';
                } else {
                    this.box.style.left = mouseDownPoint.x + 'px';
                }
                this.box.style.width = Math.abs(point.x - mouseDownPoint.x) + 'px';
                if (point.y < mouseDownPoint.y) {
                    this.box.style.top = point.y + 'px';
                } else {
                    this.box.style.top = mouseDownPoint.y + 'px';
                }
                this.box.style.height = Math.abs(point.y - mouseDownPoint.y) + 'px';
                return com.modestmaps.cancelEvent(e);
            }, this);
            return this._mouseMove;
        },
        mouseUp: function(e) {
            if (!this._mouseUp) this._mouseUp = wax.util.bind(function(e) {
                var point = this.getMousePoint(e);

                var l1 = map.pointLocation(point),
                    l2 = map.pointLocation(mouseDownPoint);

                map.setExtent([l1, l2]);

                this.box.style.display = 'none';
                com.modestmaps.removeEvent(map.parent, 'mousemove', this.mouseMove());
                com.modestmaps.removeEvent(map.parent, 'mouseup', this.mouseUp());

                map.parent.style.cursor = 'auto';
            }, this);
            return this._mouseUp;
        }
    };

    return zoombox.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// Zoomer
// ------
// Add zoom links, which can be styled as buttons, to a `modestmaps.Map`
// control. This function can be used chaining-style with other
// chaining-style controls.
wax.mm.zoomer = function(map) {
    var zoomin = document.createElement('a');
    zoomin.innerHTML = '+';
    zoomin.href = '#';
    zoomin.className = 'zoomer zoomin';
    com.modestmaps.addEvent(zoomin, 'mousedown', function(e) {
        com.modestmaps.cancelEvent(e);
    });
    com.modestmaps.addEvent(zoomin, 'click', function(e) {
        com.modestmaps.cancelEvent(e);
        map.zoomIn();
    }, false);
    map.parent.appendChild(zoomin);

    var zoomout = document.createElement('a');
    zoomout.innerHTML = '-';
    zoomout.href = '#';
    zoomout.className = 'zoomer zoomout';
    com.modestmaps.addEvent(zoomout, 'mousedown', function(e) {
        com.modestmaps.cancelEvent(e);
    });
    com.modestmaps.addEvent(zoomout, 'click', function(e) {
        com.modestmaps.cancelEvent(e);
        map.zoomOut();
    }, false);
    map.parent.appendChild(zoomout);

    var zoomer = {
        add: function(map) {
            map.addCallback('drawn', function(map, e) {
                if (map.coordinate.zoom === map.provider.outerLimits()[0].zoom) {
                    zoomout.className = 'zoomer zoomout zoomdisabled';
                } else if (map.coordinate.zoom === map.provider.outerLimits()[1].zoom) {
                    zoomin.className = 'zoomer zoomin zoomdisabled';
                } else {
                    zoomin.className = 'zoomer zoomin';
                    zoomout.className = 'zoomer zoomout';
                }
            });
            return this;
        }
    };
    return zoomer.add(map);
};
wax = wax || {};
wax.mm = wax.mm || {};

// A layer connector for Modest Maps
//
// ### Required arguments
//
// * `base_url` first argument that can be a string for a single
// server or an array to hit multiple servers or CNAMEs.
// * `layername`
//
// ### Optional arguments
//
// * `filetype`: like `.jpeg` (default `.png`)
// * `zoomrange`: like [0, 10] (default [0, 18])
wax.mm.provider = function(options) {
    this.layerName = options.layerName;
    this.baseUrls = (typeof(options.baseUrl) == 'string') ?
            [options.baseUrl] : options.baseUrl;
    this.n_urls = this.baseUrls.length;
    this.filetype = options.filetype || '.png';
    this.zoomRange = options.zoomRange || [0, 18];
};

wax.mm.provider.prototype = {
    outerLimits: function() {
        return [
            new com.modestmaps.Coordinate(0,0,0).zoomTo(this.zoomRange[0]),
            new com.modestmaps.Coordinate(1,1,0).zoomTo(this.zoomRange[1])
        ];
    },
    getTileUrl: function(coord) {
        var server;
        coord = this.sourceCoordinate(coord);
        if (!coord) {
            return null;
        }

        var worldSize = Math.pow(2, coord.zoom);
        coord.row = Math.pow(2, coord.zoom) - coord.row - 1;
        if (this.n_urls === 1) {
            server = this.baseUrls[0];
        } else {
            server = this.baseUrls[parseInt(worldSize * coord.row + coord.column, 10) % this.n_urls];
        }
        var imgPath = ['1.0.0', this.layerName, coord.zoom, coord.column, coord.row].join('/');
        return server + imgPath + this.filetype;
    }
};

com.modestmaps.extend(wax.mm.provider, com.modestmaps.MapProvider);
