var publish = require('@wmakeev/locator/publish');
var resolver = require('./module-resolver');
var wrapDefine = require('./wrap-define');

// Not paths links with .js
var requirejsCdn = 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js';
var repositoryCdn = 'https://rawgit.com/wmakeev/multiversion-repository/master/multiversion-repository.js'; // TODO move to cdn
//var repositoryCdn   = 'https://cdn.rawgit.com/wmakeev/multiversion-repository/2.0.4/multiversion-repository.js';

// Require.js paths w/o .js
var multiverCdn = 'https://rawgit.com/wmakeev/requirejs-multiversion/master/build/multiver'; // TODO move to cdn
var semverCdn = 'https://cdn.rawgit.com/wmakeev/node-semver/5284ffbd6f25fa5f576b9e563b0a401a2a94d252/dist/semver';

var protocol = window.location.protocol;

require('./load-script')(requirejsCdn, 'requirejs')
  .then(function () {
    var r = requirejs; // FIXIT Webpack hack (webpack deleting requirejs.config, bug?)
    r.config({
      paths: {
        semver: semverCdn,
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