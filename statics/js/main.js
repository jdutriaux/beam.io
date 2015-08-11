(function () {
  window.socket = io.connect("http://localhost:1337");

  var player_ship;
  var ships = {};
  var game_functions = {
    preload: preload,
    create: create,
    update: update,
    render: render
  };
  window.game = new Phaser.Game(800, 600, Phaser.AUTO, "game", game_functions);

  socket.on("playerList", function (dist_ships) {
    window.setTimeout(function () {
      for (var ship_id in dist_ships) {
        var ship = dist_ships[ship_id];
        ships[ship_id] = new Ship(ship.name, ship.position, ship.sprite);
      }
    }, 500);
  });

  socket.on("newPlayer", function (player_informations) {
    var newShip = new Ship(player_informations.name, player_informations.position, player_informations.sprite);
    game.physics.enable(newShip.sprite, Phaser.Physics.ARCADE);
    ships[player_informations.id] = newShip;
  });

  socket.on("updatePosition", function (informations) {
    for (var i = 0; i < informations.length; i++) {
      var ship = ships[informations[0].id];
      ship.sprite.x = informations[0].position[0];
      ship.sprite.y = informations[0].position[1];
    }
  });

  socket.on("disconnectedPlayer", function (id) {
    ships[id].destroy();
    delete ships[id];
  });

  function preload() {
    game.load.spritesheet('ships', '/assets/ships.png', 256, 256);
  }

  function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = "black";

    player_ship = new Ship("fooBar");
    ships[socket.id] = player_ship;

    game.physics.enable(player_ship.sprite, Phaser.Physics.ARCADE);
    player_ship.mainShip = true;
    player_ship.sprite.body.allowRotation = false;
    socket.emit("newPlayer", {
      name: player_ship.name,
      position: player_ship.sprite.position,
      sprite: player_ship.sprite.frame
    });
  }

  var serverTick = 0;
  function update() {
    player_ship.update();
    serverTick++;

    if (serverTick >= 8) {
      socket.emit("setMouse", {
        x: game.input.activePointer.x,
        y: game.input.activePointer.y
      });
      serverTick = 0;
    }
  }

  function render() {
  }
})();
