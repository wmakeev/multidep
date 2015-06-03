/**
 * index
 * Date: 03.06.15
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var loadScript = require('./src/tools/load-script');
var requirejs_cdn = 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js';

var wrapDefine = require('./src/wrap-define');

exports.init = function (options) {
    return new Promise(function (resolve, reject) {
        // load requirejs if it not yet loaded
        return loadScript(requirejs_cdn, 'requirejs')
            .then(function () {
                return loadScript(options.repositoryUrl);
            })
            .then(function () {
                return new Promise(function (resolve, reject) {
                    requirejs(['_multidep_repository'], function (repository) {
                        var path = {},
                            dependencies = repository.dependencies;

                        for (var libName in dependencies) {
                            if (dependencies.hasOwnProperty(libName)) {
                                var versions = dependencies[libName];
                                for (var version in versions) {
                                    if (versions.hasOwnProperty(version)) {
                                        var pathKey = libName + '@' + version;
                                        //TODO detect protocol
                                        path[pathKey] = 'https:' + versions[version];
                                    }
                                }
                            }
                        }

                        requirejs.config({
                            path: path
                        });

                        wrapDefine(dependencies);
                        resolve();
                    });
                });
            });
    });
};