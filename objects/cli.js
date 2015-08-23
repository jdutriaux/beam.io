var vantage = require("vantage")();

module.exports = function (ships) {
  var tools   = require("./tools.js")(ships);
  return {
    init: function () {
      vantage
        .command("clients")
        .description("List connected clients")
        .action(function (args, callback) {
          var str = "";
          var i = 0;
          tools.forEachShip(function (ship, ship_id) {
            str += "\t["+ i +"] " + ship_id + " : " + ship.name +
                  " [" + ship.body.position[0].toFixed(2) + ";" + ship.body.position[1].toFixed(2) + "]\n";
            i++;
          });
          this.log(str);
          callback();
        });

      vantage.delimiter("beam.io $ ").show();
    }
  };
};
