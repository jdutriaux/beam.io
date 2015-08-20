/**
 * Wrapper-Object for messages sent over WebSockets
 * Uses window.socket as for now
 */

var Message = function (type, datas) {
  this.datas = datas || {};
  this.type = type;
};

Message.prototype.set = function (field, data) {
  this.datas[field] = data;
};

Message.prototype.send = function (errCallback) {
  var formatedMsg = {
    type: this.type
  };

  for (var field in this.datas) {
    formatedMsg[field] = this.datas[field];
  }

  formatedMsg = JSON.stringify(formatedMsg);

  try {
    socket.send(formatedMsg);
  } catch (e) {
    errCallback(e);
  }
};
