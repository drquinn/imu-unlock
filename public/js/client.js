var socket = io.connect('localhost:5000');

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

$.get('/getIP', function(res) {
    console.log(res);
});


$(document).ready(function() {
    $("#hello").click(function(){
        socket.emit('ping', { duration: 2 });
    }); 
});

