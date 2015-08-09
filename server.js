var express = require("express");
var app = express();
var morgan = require("morgan");
var server = require("http").Server(app);
var io = require("socket.io")(server);
/* var vantage = require("vantage")();


vantage
  .command("foo")
  .description("Plop")
  .action(function (args, callback) {
    this.log("plop");
    callback();
  });

vantage
  .delimiter("beam.io $ ")
  .show();
*/

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

var ships = {};
io.on("connection", function (socket) {
  socket.on("newPlayer", function (datas) {
    ships["id"] = datas;
    datas["id"] = socket.id;
    socket.broadcast.emit("newPlayer", datas);
  });

  socket.on("updateInformations", function (datas) {
    datas["id"] = socket.id;
    ships["id"] = datas;
    socket.broadcast.emit("updateInformations", datas);
  });
});
