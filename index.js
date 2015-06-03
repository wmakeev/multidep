/**
 * index
 * Date: 03.06.15
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var loadScript = require('./src/tools/load-script');
var requirejs_cdn = 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js';

var wrapDefine = require('./src/wrap-define');

exports.init = function (options) {
    var protocol = window.location.protocol;
    if (typeof options === 'string') {
        options = {
            repositoryUrl: options
        }
    }
    // load requirejs if it not yet loaded
    return loadScript(requirejs_cdn, 'requirejs')
        .then(function () {
            return new Promise(function (resolve, reject) {
                //TODO protocol
                var repositoryUrl = protocol + options.repositoryUrl;
                requirejs([repositoryUrl],
                    function (repository) {
                        var paths = {},
                            dependencies = repository.dependencies;

                        for (var libName in dependencies) {
                            if (dependencies.hasOwnProperty(libName)) {
                                var versions = dependencies[libName];
                                for (var version in versions) {
                                    if (versions.hasOwnProperty(version)) {
                                        var pathKey = libName + '@' + version;
                                        var path = versions[version];
                                        if (path.slice(-3) === '.js')
                                            path = path.slice(0, -3);
                                        //TODO protocol
                                        paths[pathKey] = protocol + path;
                                    }
                                }
                            }
                        }

                        requirejs.config({
                            paths: paths
                        });

                        wrapDefine(dependencies);
                        resolve();
                    },
                    reject);
            });
        });
};

exports.version = require('./package').version;