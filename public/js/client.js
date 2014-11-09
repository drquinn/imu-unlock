var socket = io.connect('192.168.1.124:5000');

socket.on('pong', function (data) {
    console.log("pong");
});

socket.on('udp_update', function(data) {
  console.log(data);
  $("#log_data").append("<div>" + data + "</div>");
});

socket.on('serial_update', function(data) {
  console.log(data);
  $("#log_data").append("<div>" + data + "</div>");
});




$(document).ready(function() {
    $("#hello").click(function(){
        socket.emit('ping', { duration: 2 });
    }); 
});

