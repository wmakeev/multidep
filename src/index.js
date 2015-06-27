var publish = require('@wmakeev/locator/publish');
var resolver = require('./module-resolver');
var wrapDefine = require('./wrap-define');

var requirejsCdn    = 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js';
var repositoryCdn   = 'https://cdn.rawgit.com/wmakeev/multiversion-repository/1.0.0/multiversion-repository.js';
// TODO move to cdn
var multiversionCdn = 'https://rawgit.com/wmakeev/requirejs-multiversion/master/build/multiver';

var protocol = window.location.protocol;

require('./load-script')(requirejsCdn, 'requirejs')
  .then(function () {
    requirejs([repositoryCdn], function (repo) {
      requirejs.config({
        paths: {
          multiver: multiversionCdn
        },
        config: {
          multiver: {
            repository: repo,
            resolver: resolver
          }
        }
      });

      wrapDefine();

      publish('amd:ready', {
        define: window.define,
        require: window.requirejs
      });
    });



  })
  .catch(function (err) {
    throw err;
  });