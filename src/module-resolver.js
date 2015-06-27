var semver = require('../vendor/semver');
var discover = require('@wmakeev/locator/discover');

module.exports = {
  resolve: function (name, version, cb) {
    var resolved = false;
    discover('amd:module', function (data, stop) {
      var moduleName = data.name;
      var moduleVersion = 'default';

      if (name === moduleName && (version === moduleVersion || !version)) {
        resolved = true;
        stop();
        cb(null, moduleName);
      }

      var nameVersion = moduleName.split('@');
      if (nameVersion.length === 2 && nameVersion[0]) {
        moduleName = nameVersion[0];
        moduleVersion = nameVersion[1];
        if (moduleVersion === 'default' && semver.satisfies()) {
          resolved = true;
          stop();
          cb(null, moduleName);
        }
      }

      setTimeout(function () {
        if (!resolved) {
          stop();
          cb(new Error(name + '@' + version + ' resolve timeout'));
        }
      }, 15000)
    });
  }
};