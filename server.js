var express = require("express");
var app = express();
var morgan = require("morgan");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var vantage = require("vantage")();
var ships = {};


vantage
  .command("clients")
  .description("List connected clients")
  .action(function (args, callback) {
    this.log(JSON.stringify(ships));
    callback();
  });

vantage
  .delimiter("beam.io $ ")
  .show();


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
  socket.emit("playerList", ships);

  socket.on("newPlayer", function (datas) {
    ships[socket.id] = {};
    for (var key in datas) {
      ships[socket.id][key] = datas[key];
    }
    datas["id"] = socket.id;
    socket.broadcast.emit("newPlayer", datas);
  });

  socket.on("updateInformations", function (datas) {
    for (var key in datas) {
      ships[socket.id][key] = datas[key];
    }
    datas["id"] = socket.id;
    socket.broadcast.emit("updateInformations", datas);
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("disconnectedPlayer", socket.id);
    delete ships[socket.id];
  });
});
