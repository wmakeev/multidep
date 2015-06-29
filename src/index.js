var publish = require('@wmakeev/locator/publish');
var resolver = require('./module-resolver');
var wrapDefine = require('./wrap-define');

var requirejsCdn    = 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js';
var repositoryCdn   = 'https://cdn.rawgit.com/wmakeev/multiversion-repository/2.0.3/multiversion-repository.js';
// TODO move to cdn
var multiverCdn = 'https://rawgit.com/wmakeev/requirejs-multiversion/master/build/multiver';

var protocol = window.location.protocol;

require('./load-script')(requirejsCdn, 'requirejs')
  .then(function () {
    var r = requirejs; // FIXIT Webpack hack (webpack deleting requirejs.config, bug?)
    r.config({
      paths: {
        multiver: multiverCdn
      },
      config: {
        multiver: {
          repository: repositoryCdn,
          resolver: resolver
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