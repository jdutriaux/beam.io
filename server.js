var express = require("express");
var app     = express();
var morgan  = require("morgan");
var server  = require("http").Server(app);
var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port: 8080});
var vantage = require("vantage")();
var p2      = require("./statics/js/p2.js");
var uuid    = require("uuid");

var width   = 800;
var height  = 600;
var world   = new p2.World({
  gravity: [0, 0]
});
var bounds  = {
  left  : new p2.Body({mass: 0, position: [0, 0], angle: Math.PI * 0.5}),
  right : new p2.Body({mass: 0, position: [width, 0], angle: -Math.PI * 0.5}),
  top   : new p2.Body({mass: 0, position: [0, 0], angle: -Math.PI}),
  bottom: new p2.Body({mass: 0, position: [0, height]})
};

for (var name in bounds) {
  var bound = bounds[name];
  bound.addShape(new p2.Plane());
  world.addBody(bound);
}

var ships = {};

var Ship = function (datas) {
  var width = 256;
  var height = 256;

  this.angle = 0;
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
    angle: this.angle,
    name: this.name,
    id: this.id
  };
};

Ship.prototype.angleToPointer = function (pointer) {
  var dx = pointer.x - this.body.position[0];
  var dy = pointer.y - this.body.position[1];

  return Math.atan2(dy, dx);
};

Ship.prototype.distanceToPointer = function (pointer) {
  var dx = this.body.position[0] - pointer.x;
  var dy = this.body.position[1] - pointer.y;

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

  this.angle = angle;
};

vantage
  .command("clients")
  .description("List connected clients")
  .action(function (args, callback) {
    var str = "";
    var i = 0;
    forEachShip(function (ship, ship_id) {
      str += "\t["+ i +"] " + ship_id + " : " + ship.name +
             " [" + ship.body.position[0].toFixed(2) + ";" + ship.body.position[1].toFixed(2) + "]\n";
      i++;
    });
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

server.listen(1337, "0.0.0.0", function () {
  var port = server.address().port;
  console.log("Listening on port " + port);
});


var timeStep = 1 / 30; // Seconds for physics calculation

function updatePositions () {
  world.step(timeStep);

  var positions = [];
  var msg = {
    type: "updatePositions",
    positions: positions
  };

  for (var ship_id in ships) {
    positions.push(ships[ship_id].format());
  }

  broadcast(JSON.stringify(msg));
  setTimeout(updatePositions, 1000 * timeStep);
}

updatePositions();

function broadcast (datas, excludedSocket) {
  wss.clients.forEach(function (client) {
    try {
      if (client !== excludedSocket) client.send(datas);
    } catch (e) {
      console.log(e);
    }
  });
}

function forEachShip (callback) {
  for (var ship_id in ships) {
    callback(ships[ship_id], ship_id);
  }
}

wss.on("connection", function (socket) {
  socket.id = uuid.v4();
  console.log("New WS client");

  socket.on("message", function (message) {
    message = JSON.parse(message);
    switch (message.type) {
      case "join":
        var welcomeObject = {
          type: "welcome",
          id: socket.id,
          players: []
        };

        forEachShip(function (ship) {
          welcomeObject.players.push(ship.format());
        });

        socket.send(JSON.stringify(welcomeObject));
        break;
      case "newPlayer":
        message["id"] = socket.id;
        ships[socket.id] = new Ship(message);
        broadcast(JSON.stringify(message), socket);
        break;
      case "setMouse":
        var ship = ships[socket.id];
        if (ship) {
          ship.moveToPointer(message);
        }
        break;
    }
  });

  socket.on("close", function () {
    var closeMessage = {
      type: "disconnectedPlayer",
      id: socket.id
    };
    delete ships[socket.id];
    broadcast(JSON.stringify(closeMessage), socket);
  });
});
