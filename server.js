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

  this.id = datas.id;
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
    name: this.name,
    id: this.id
  };
};

Ship.prototype.angleToPointer = function (pointer) {
  var dx = pointer.x - this.body.position.x;
  var dy = pointer.y - this.body.position.y;

  return Math.atan2(dy, dx);
};

Ship.prototype.distanceToPointer = function (pointer) {
  var dx = this.body.position.x - pointer.x;
  var dy = this.body.position.y - pointer.y;

  return Math.sqrt(dx * dx + dy * dy);
};

Ship.prototype.moveToPointer = function (pointer) {
  var time  = 300; // Time to reach the pointer
  var angle = this.angleToPointer(pointer);
  var speed = this.distanceToPointer(pointer) / (time / 1000);

  this.body.velocity = [
    Math.cos(angle) * speed, // X Velocity
    Math.sin(angle) * speed  // Y Velocity
  ];

  return angle;
};

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


var timeStep = 1 / 60; // Seconds for physics calculation
setInterval(function () {
  world.step(timeStep);
}, 1000 * timeStep);

io.on("connection", function (socket) {
  socket.emit("playerList", ships);

  socket.on("newPlayer", function (datas) {
    datas["id"] = socket.id;
    ships[socket.id] = new Ship(datas);
    socket.broadcast.emit("newPlayer", datas);
  });

  socket.on("setMouse", function (mouse) {
    var ship = ships[socket.id];
    ship.moveToPointer(mouse);
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("disconnectedPlayer", socket.id);
    delete ships[socket.id];
  });

  setInterval(function () {
    if (!ships[socket.id]) {
      return false;
    }
    console.log("sending position" , ships[socket.id].format());
    socket.emit("setPosition", ships[socket.id].format());
  }, 1000 * timeStep);
});
