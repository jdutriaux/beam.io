var nameStyle = {
  font: "16px Arial",
  fill: "white"
};
var Ship = function (playerName) {
  this.name = playerName;
  this.sprite = game.add.sprite(400, 300, 'ships', 1);
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
  this.lastPush++;

  if (this.lastPush >= 10) {
    this.lastPush = 0;
    this.sendInformations();
  }
};
