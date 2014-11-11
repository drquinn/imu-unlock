var app = require('http').createServer(handler)
var url= require('url')
var fs = require('fs')
var os = require('os')
var io = require('socket.io').listen(app)
var serialport = require("serialport");
var SP = serialport.SerialPort;
var serialPort = new SP("/dev/ttyUSB0",
	{
		baudrate: 115200,
		parser: serialport.parsers.readline("\n")
	}, false);


app.listen(5000);

var dgram = require('dgram');

// Get localhost IP
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                        addresses.push(address.address);
                }
        }
}


var udp_socket = dgram.createSocket('udp4');

/* SERIAL WORK */

serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    serialPort.on('data', function(data) {
      console.log('data received: ' + data);
      io.sockets.emit('serial_update', data);
    });
    //serialPort.write("ls\n", function(err, results) {
    //  console.log('err ' + err);
    //  console.log('results ' + results);
    //});
  }
});


// Http handler function
function handler (req, res) {
    
    // Using URL to parse the requested URL
    var path = url.parse(req.url).pathname;
    
    // Managing the root route
    if (path == '/') {
        index = fs.readFile(__dirname+'/public/index.html', 
            function(error,data) {
                
                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load index.html");
                }
                
                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(data);
            });
    // Managing the root for threejs
    } else if (path == '/threejs') {
        index = fs.readFile(__dirname+'/public/threejs/three.html', 
            function(error,data) {
                
                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load threejs.html - " + error);
                }
                
                res.writeHead(200,{'Content-Type': 'text/html'});
                res.end(data);
            });
    // Managing the route for the javascript files
    } else if( /\.(js)$/.test(path) ) {
        index = fs.readFile(__dirname+'/public'+path, 
            function(error,data) {
                
                if (error) {
                    res.writeHead(500);
                    return res.end("Error: unable to load " + path);
                }
                
                res.writeHead(200,{'Content-Type': 'text/plain'});
                res.end(data);
            });
    } else {
        res.writeHead(404);
        res.end("Error: 404 - File not found.");
    }
    
}



// Web Socket Connection
io.sockets.on('connection', function (socket) {
    
  // If we recieved a command from a client to start watering lets do so
  socket.on('ping', function(data) {
      console.log("ping");
      
      delay = data["duration"];
      
      // Set a timer for when we should stop watering
      setTimeout(function(){
          socket.emit("pong");
      }, delay*1);
      
  });

});



udp_socket.on('message', function(content, rinfo) {
	console.log('UDP byte ', content, ' from ', rinfo.address, rinfo.port, ' JSON or rinfo ', JSON.stringify(rinfo));
	io.sockets.emit('udp_update', content.toString("utf8", 0, rinfo.size));
});


udp_socket.bind(1900);

