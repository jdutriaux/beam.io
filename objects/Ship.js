module.exports = function (world, p2) {
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

  Ship.prototype = {
    format: function () {
      return {
        position: this.body.position,
        angle: this.angle,
        name: this.name,
        id: this.id
      };
    },

    angleToPointer: function (pointer) {
      var dx = pointer.x - this.body.position[0];
      var dy = pointer.y - this.body.position[1];

      return Math.atan2(dy, dx);
    },

    distanceToPointer: function (pointer) {
      var dx = this.body.position[0] - pointer.x;
      var dy = this.body.position[1] - pointer.y;

      return Math.sqrt(dx * dx + dy * dy);
    },

    moveToPointer: function (pointer) {
      var time  = 300; // Time to reach the pointer
      var angle = this.angleToPointer(pointer);
      var speed = this.distanceToPointer(pointer) / (time / 1000);

      this.body.velocity = [
        Math.cos(angle) * speed, // X Velocity
        Math.sin(angle) * speed  // Y Velocity
      ];

      this.angle = angle;
    }
  };

  return Ship;
};
