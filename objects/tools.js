module.exports = function (ships) {
  return {
    forEachShip: function (callback) {
      for (var ship_id in ships) {
        callback(ships[ship_id], ship_id);
      }
    }
  }
};
