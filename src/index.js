var config      = require('./config');
var publish     = require('@wmakeev/locator/publish');
var resolver    = require('./module-resolver');
var wrapDefine  = require('./wrap-define');

var protocol = window.location.protocol;

require('./load-script')(config.cdn.requirejs, 'requirejs')
  .then(function () {
    var r = requirejs; // FIXIT Webpack hack (webpack deleting requirejs.config, bug?)
    r.config({
      paths: config.paths,
      config: {
        multiver: {
          repository: config.cdn.repository,
          resolver: resolver,
          fallBackToParentRequire: true
        }
      }
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
