(function () {
  var socket = io.connect("http://localhost:1337");
  var nameStyle = {
    font: "16px Arial",
    fill: "white"
  };

  var Ship = function (playerName) {
    this.sprite = game.add.sprite(400, 300, 'ships');
    this.sprite.anchor.setTo(0.5, 0.6);
    this.sprite.scale.setTo(0.5, 0.5);
    this.sprite.animations.add("main")
    this.label = game.add.text(this.sprite.x, this.sprite.y, playerName, nameStyle);
    this.label.anchor.set(0.5);
  };

  Ship.prototype.sendPosition = function () {
    socket.emit("updatePosition", this.sprite.position);
  }

  Ship.prototype.sendVelocity = function () {
    socket.emit("updateVelocity", this.sprite.body.velocity);
  }

  Ship.prototype.update = function () {
    this.label.x = this.sprite.x; 
    this.label.y = this.sprite.y;
  };

  var player_ship;
  var ships = [];
  var game_functions = {
    preload: preload,
    create: create,
    update: update,
    render: render
  };
  var game = new Phaser.Game(800, 600, Phaser.AUTO, "game", game_functions);

  function preload() {
    game.load.spritesheet('ships', '/assets/ships.png', 256, 256);
  }
  function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = "black";

    player_ship = new Ship("fooBar");

    game.physics.enable(player_ship.sprite, Phaser.Physics.ARCADE);
    player_ship.sprite.body.allowRotation = false;
    socket.emit("welcome", player_ship.sprite.position);
  }

  function update() {
      player_ship.update();
      player_ship.sprite.rotation = game.physics.arcade.moveToPointer(
        player_ship.sprite,
        60,
        game.input.activePointer,
        300) + ((3 * Math.PI) * 0.5);
  }

  function render() {
  }
})();
