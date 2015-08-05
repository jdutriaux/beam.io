var express = require("express");
var app = express();
var morgan = require("morgan");
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(morgan("tiny"));
app.use(express.static('statics'));
app.set("view engine", "jade");

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(1337, function () {
  var port = server.address().port;
  console.log("Listening on port " + port);
});

io.on("connection", function (socket) {
  console.log("New sio client.");
  socket.on("welcome", function (datas) {
    
  });
});
