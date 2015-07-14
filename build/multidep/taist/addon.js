function init() {

  function startModule(taistApi, entryPoint) {
    /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var publish = __webpack_require__(1);
	var resolver = __webpack_require__(3);
	var wrapDefine = __webpack_require__(5);

	// Not paths links with .js
	var requirejsCdn = 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js';
	var repositoryCdn = 'https://rawgit.com/wmakeev/multiversion-repository/master/multiversion-repository.js'; // TODO move to cdn
	//var repositoryCdn   = 'https://cdn.rawgit.com/wmakeev/multiversion-repository/2.0.4/multiversion-repository.js';

	// Require.js paths w/o .js
	var multiverCdn = 'https://rawgit.com/wmakeev/requirejs-multiversion/master/build/multiver'; // TODO move to cdn
	var semverCdn = 'https://cdn.rawgit.com/wmakeev/node-semver/5284ffbd6f25fa5f576b9e563b0a401a2a94d252/dist/semver';

	var protocol = window.location.protocol;

	__webpack_require__(6)(requirejsCdn, 'requirejs')
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var guid = __webpack_require__(2);

	module.exports = function publish(key, value) {
	  var id = Math.random().toString();
	  var publishEventName = guid + ':publish';
	  var discoverEventName = guid + ':discover';

	  var dispatch = function() {
	    var event = new CustomEvent(publishEventName, {
	      detail: {
	        id: id,
	        key: key,
	        value: value
	      }
	    });
	    window.dispatchEvent(event);
	  };

	  var listener = function (ev) {
	    ev = ev.detail;
	    if (ev && ev.key === key) {
	      dispatch();
	    }
	  };

	  window.addEventListener(discoverEventName, listener);

	  dispatch();

	  return {
	    stop: function () {
	      window.removeEventListener(discoverEventName, listener);
	    }
	  }
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = "70152108-2745-4c6a-b529-c4fe10e488a7";

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// https://regex101.com/r/tU5aI9/2
	var moduleNameRegex = /^((?:@[\w\-]+\/)?[\w\-]+)(?:@([0-9\.]+))?$/;

	var discover = __webpack_require__(4);


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
	        cb(new Error(name + (versionRange ? '@' + versionRange : '') + ' lib resolve timeout'));
	      }
	    }, 10000)
	  }
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var guid = __webpack_require__(2);

	module.exports = function discover(key, handler) {
	  var discoveredEventsIds = {};
	  var publishEventName = guid + ':publish';
	  var discoverEventName = guid + ':discover';

	  var stop = function () {
	    window.removeEventListener(publishEventName, listener);
	  };

	  var listener = function (ev) {
	    ev = ev.detail;
	    if (ev && ev.id && ev.key === key && !discoveredEventsIds.hasOwnProperty(ev.id)) {
	      discoveredEventsIds[ev.id] = true;
	      handler(ev.value, stop);
	    }
	  };
	  window.addEventListener(publishEventName, listener);

	  var event = new CustomEvent(discoverEventName, {
	    detail: {
	      key: key
	    }
	  });
	  window.dispatchEvent(event);

	  return {
	    stop: stop
	  }
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var publish = __webpack_require__(1);

	module.exports = function () {
	  var _oldDefine = window.define;

	  window.define = function () {
	    var returnValue = _oldDefine.apply(this, arguments);
	    var args = Array.prototype.slice.call(arguments, 0);

	    if (typeof args[0] === 'string') {
	      publish('amd:define', {
	        name: args[0]
	      });
	    }

	    return returnValue;
	  };

	  window.define.amd = {
	    jQuery: true
	  };

	  window.define.multidep = true;
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function (src, globalName) {
	    return new Promise(function(resolve, reject) {
	        if (globalName && window[globalName]) return resolve();

	        var head = document.head || document.getElementsByTagName('head')[0];
	        var script = document.createElement('script');

	        script.type     = 'text/javascript';
	        script.charset  = 'utf8';
	        script.async    = true;
	        script.src      = src;

	        script.onload = function () {
	            this.onerror = this.onload = null;
	            console.debug('load-script: [' + (globalName || src) + '] injected');
	            resolve();
	        };

	        script.onerror = function () {
	            // this.onload = null here is necessary
	            // because even IE9 works not like others
	            this.onerror = this.onload = null;
	            reject(new Error('load-script: failed to load [' + this.src + ']'))
	        };

	        head.appendChild(script);
	    })
	};

/***/ }
/******/ ]);

  }
  
  return {
    start: function(taistApi, entryPoint) {
      startModule(taistApi, entryPoint);
    }
  };
}