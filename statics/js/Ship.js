var Ship = function (playerName, position, sprite_id) {
  var nameStyle = {
    font: "16px Arial",
    fill: "white"
  };
  var ships_list = [0, 2, 4, 6];

  if (sprite_id === undefined) {
    sprite_id = ships_list[Math.floor(Math.random() * ships_list.length)];
  }

  this.mainShip = false;
  this.name = playerName;

  if (!position) {
    this.sprite = game.add.sprite(400, 300, 'ships', sprite_id);
  } else {
    this.sprite = game.add.sprite(position.x, position.y, 'ships', ships_list[sprite_id]);
  }

  this.sprite.anchor.setTo(0.5, 0.6);
  this.sprite.scale.setTo(0.5, 0.5);
  this.sprite.animations.add("main")
  this.label = game.add.text(this.sprite.x, this.sprite.y, playerName, nameStyle);
  this.label.anchor.set(0.5);

  this.lastPush = 0;
};

Ship.prototype.sendInformations = function () {
  socket.emit("updateInformations", {
    position :this.sprite.position,
    angle: this.sprite.angle
  });
};

Ship.prototype.update = function () {
  this.label.x = this.sprite.x;
  this.label.y = this.sprite.y;

  if (!this.mainShip) {
    return;
  }

  this.lastPush++;

  if (this.lastPush >= 6) {
    this.lastPush = 0;
    this.sendInformations();
  }
};

Ship.prototype.destroy = function () {
  this.sprite.destroy();
  this.label.destroy();
};
