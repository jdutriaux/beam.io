var express = require("express");
var app     = express();
var morgan  = require("morgan");
var server  = require("http").Server(app);
var io      = require("socket.io")(server);
var vantage = require("vantage")();
var p2      = require("./statics/js/p2.js");
var world   = new p2.World({
  gravity: [0, 0]
});
var ships = {};

var Ship = function (datas) {
  var width = 256;
  var height = 256;

  this.name = datas.name;
  this.body = new p2.Body({
    position: [datas.position.x, datas.position.y],
    mass: 0
  });
  this.shape = new p2.Box({
    width: width,
    height: height
  });

  this.body.addShape(this.shape);
  world.addBody(this.body);
};

Ship.prototype.format = function () {
  return {
    position: this.body.position,
    name: this.name
  };
}

vantage
  .command("clients")
  .description("List connected clients")
  .action(function (args, callback) {
    var str = "";
    var i = 0;
    for (var ship_id in ships) {
      var ship = ships[ship_id];
      str += "\t["+ i +"] " + ship_id + " : " + ship.name +
             " [" + ship.position.x.toFixed(2) + ";" + ship.position.y.toFixed(2) + "]\n";
      i++;
    }
    this.log(str);
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
    ships[socket.id] = new Ship(datas);
    datas["id"] = socket.id;
    socket.broadcast.emit("newPlayer", datas);
  });

  socket.on("setMouse", function (mouse) {
    socket.emit("setPosition", ships[socket.id].format());
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("disconnectedPlayer", socket.id);
    delete ships[socket.id];
  });
});
