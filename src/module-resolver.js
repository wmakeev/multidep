// https://regex101.com/r/tU5aI9/2
var moduleNameRegex = /^((?:@[\w\-]+\/)?[\w\-]+)(?:@([0-9\.]+))?$/;
var config = require('./config');

var discover = require('@wmakeev/locator/discover');


module.exports = {
  /**
   * Module resolver
   *
   * @param name Name or url of module to require it with requirejs
   * @param versionRange= Module version range (optional)
   * @param cb
   */
  resolve: function resolve(name, versionRange, cb) {
    var discovering;
    var resolved = false;

    function resolve(resolvedName) {
      resolved = true;
      discovering.stop();
      cb(null, resolvedName);
    }

    function discoverHandler(data) {
      if (!data.name) return;

      var match = data.name.match(moduleNameRegex);
      var moduleName = match[1];
      var moduleVersion = match[2];

      if (name === moduleName) {
        if (versionRange === '*' || !versionRange) {
          resolve(data.name)
        }
        else {
          requirejs(['semver'], function (semver) {
            if (semver.satisfies(moduleVersion, versionRange)) {
              resolve(data.name)
            }
          });
        }
      }
    }

    discovering = discover('amd:module', discoverHandler);

    setTimeout(function () {
      if (!resolved) {
        if (discovering) { discovering.stop() }
        cb(new Error(name + (versionRange ? '@' + versionRange : '') + ' resolve timeout'));
      }
    }, config.timeout * 1000)
  }
};