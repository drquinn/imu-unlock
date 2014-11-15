var socket = io.connect('localhost:5000');

socket.on('serial_update', function(data) {
  console.log(data);
  $("#log_data").append("<div>" + data + "</div>");
});

$.get('/getIP', function(res) {
    console.log(res);
});

