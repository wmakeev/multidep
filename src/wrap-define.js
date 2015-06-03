/**
 * wrap-define
 * Date: 03.06.15
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var semver = require('semver');

module.exports = function (dependencies) {
    var _oldDefine = window.define;

    window.define = function () {
        var args = Array.prototype.slice.call(arguments, 0);

        var deps;
        if (typeof args[0] === 'string' && args[1] instanceof Array)
            deps = args[1];
        else if (args[0] instanceof Array)
            deps = args[0];

        for (var i = 0; i < deps.length; i++) {
            var dep = deps[i];
            if (dep.indexOf('@') !== -1) {
                // need to resolve the dependency
                var nameVer = dep.split('@');
                // i.e. module@^1.0.0
                if (nameVer.length === 2) {
                    var moduleName    = nameVer[0],
                        versionRange  = nameVer[1];

                    if (dependencies[moduleName] && semver.valid(versionRange)) {
                        var versions = Object.keys(dependencies[moduleName]);
                        var version = semver.maxSatisfying(versions, versionRange);
                        if (version) {
                            // fix dependency version on existing in repository
                            deps[i] = moduleName + '@' + version;
                        }
                    }
                }
            }
        }

        return _oldDefine.apply(this, args);
    };

    window.define.amd = {
        jQuery: true
    };

    window.define.multidep = true;
};