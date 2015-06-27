var publish = require('@wmakeev/locator/publish');

module.exports = function () {
  var _oldDefine = window.define;

  window.define = function () {
    var returnValue = _oldDefine.apply(this, arguments);
    var args = Array.prototype.slice.call(arguments, 0);

    if (typeof args[0] === 'string') {
      publish('amd:define', {
        name: args[0]
      });
    }

    return returnValue;
  };

  window.define.amd = {
    jQuery: true
  };

  window.define.multidep = true;
};