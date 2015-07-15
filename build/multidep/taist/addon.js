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

	var config      = __webpack_require__(1);
	var publish     = __webpack_require__(2);
	var resolver    = __webpack_require__(4);
	var wrapDefine  = __webpack_require__(6);
	var loadScript  = __webpack_require__(7);

	var protocol = window.location.protocol;

	Promise.all([
	  loadScript(config.cdn.requirejs, 'requirejs'),
	  loadScript(config.cdn.browserPolyfill)
	  //loadScript(config.cdn.babelHelpers, 'babelHelpers')
	]).then(function () {
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = {
	  paths: {
	    multiver: 'https://rawgit.com/wmakeev/requirejs-multiversion/master/dist/multiver',
	    semver: 'https://cdn.rawgit.com/wmakeev/node-semver/5284ffbd6f25fa5f576b9e563b0a401a2a94d252/dist/semver'
	  },
	  cdn: {
	    requirejs: 'https://cdn.jsdelivr.net/requirejs/2.1.14/require.min.js',
	    repository: 'https://rawgit.com/wmakeev/multiversion-repository/master/multiversion-repository.js',
	    babelHelpers: 'https://rawgit.com/wmakeev/babel-external-helpers/master/external-helpers.min.js',
	    browserPolyfill: 'https://rawgit.com/wmakeev/babel-external-helpers/master/browser-polyfill.min.js'
	  },
	  timeout: 10
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var guid = __webpack_require__(3);

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
/* 3 */
/***/ function(module, exports) {

	module.exports = "70152108-2745-4c6a-b529-c4fe10e488a7";

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// https://regex101.com/r/tU5aI9/2
	var moduleNameRegex = /^((?:@[\w\-]+\/)?[\w\-]+)(?:@([0-9\.]+))?$/;
	var config = __webpack_require__(1);

	var discover = __webpack_require__(5);


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

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var guid = __webpack_require__(3);

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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var publish = __webpack_require__(2);

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
/* 7 */
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