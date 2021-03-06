var config = require('./config');
var publish = require('@wmakeev/locator/publish');
var resolver = require('./module-resolver');
var wrapDefine = require('./wrap-define');
var loadScript = require('./load-script');

var protocol = window.location.protocol;
// TODO Remove (temp)
var oldRequire = window.require;

Promise.all([
  loadScript(config.cdn.requirejs, 'requirejs'),
  loadScript(config.cdn.browserPolyfill)
  //loadScript(config.cdn.babelHelpers, 'babelHelpers')
]).then(function () {
  // TODO Remove (temp)
  if (oldRequire) {
    window.require = oldRequire;
  }
  var r = requirejs; // FIXIT Webpack hack (webpack deleting requirejs.config, bug?)
  r.config({
    paths: config.paths,
    config: {
      multiver: {
        repository: config.cdn.repository,
        resolver: resolver,
        fallBackToParentRequire: false
      }
    },
    waitSeconds: config.timeout + 1
  });

  wrapDefine();

  publish('amd:ready', {
    define: window.define,
    require: window.requirejs
  });
})
  .catch(function (err) {
    throw err;
  });
