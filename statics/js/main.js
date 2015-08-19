(function () {
  window.socket = new WebSocket("ws://localhost:8080");

  var player_ship;
  var ships = {};
  var game_functions = {
    preload: preload,
    create: create,
    update: update,
    render: render
  };
  var rawPlayers;

  socket.onmessage = function (evt) {
    var msg = JSON.parse(evt.data);
    switch (msg.type) {
      case "welcome":
        socket.id = msg.id;
        window.game = new Phaser.Game(800, 600, Phaser.AUTO, "game", game_functions);
        rawPlayers = msg.players;
        console.log(rawPlayers);
        break;
      case "newPlayer":
        addPlayer(msg);
        break;
      case "disconnectedPlayer":
        removePlayer(msg);
        break;
      case "updatePositions":
        updatePositions(msg.positions);
        break;
      default:
        console.log("Unhandled msg\n", msg);
    }
  };

  function populatePlayers(list) {
    for (var i = 0; i < list.length; i++)  {
      var ship = list[i];
      ships[ship.id] = new Ship(ship.name, ship.position, ship.sprite);
    }
  }

  function addPlayer (player_informations) {
    console.log(player_informations);
    var newShip = new Ship(player_informations.name, player_informations.position, player_informations.sprite);
    game.physics.enable(newShip.sprite, Phaser.Physics.ARCADE);
    ships[player_informations.id] = newShip;
  }

  function updatePositions (informations) {
    for (var i = 0; i < informations.length; i++) {
      var ship = ships[informations[i].id];
      if (ship) {
        ship.sprite.x = informations[i].position[0];
        ship.sprite.y = informations[i].position[1];
      }
    }
  }

  function removePlayer (id) {
    ships[id].destroy();
    delete ships[id];
  }

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
    var sendObject = {
      type: "newPlayer",
      name: player_ship.name,
      position: player_ship.sprite.position,
      sprite: player_ship.sprite.frame
    };
    socket.send(JSON.stringify(sendObject));
    populatePlayers(rawPlayers);
    rawPlayers = null;
  }

  var serverTick = 0;
  function update() {
    for (var ship_id in ships) {
      ships[ship_id].update();
    }
    serverTick++;

    if (serverTick >= 8) {
      socket.send(JSON.stringify({
        type: "setMouse",
        x: game.input.activePointer.x,
        y: game.input.activePointer.y
      }));
      serverTick = 0;
    }
  }

  function render() {
  }
})();
