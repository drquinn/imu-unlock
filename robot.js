var five = require('johnny-five'),
    board = new five.Board();
var derp;

board.on("ready", function() {
    // create an led on pin 13 strobe it on/off
    // optionally set speed
    (new five.Led(11)).off();
});
