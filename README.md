multidep
========

##example

1. Publish repository of dependencies to any url

	```js
	define('_multidep_repository', {
        "version": "1.0.0",
        "dependencies": {
            "lodash": {
                "2.4.1": "//cdn.jsdelivr.net/lodash/2.4.1/lodash.min.js",
                "3.0.8": "//cdn.jsdelivr.net/lodash/3.8.0/lodash.min.js"
            },
            "moment": {
                "2.10.3": "//cdn.jsdelivr.net/momentjs/2.10.3/moment.min.js"
            }
        }
    });
	```

2. Init multidep with repository url, and require modules with semver format

	```js
	multidep.init('//path.to/repository.js').then(() => {
	    requirejs(['lodash@^2.0.0', 'lodash@~3.0.7', 'moment@2.10.3'],
	        function (lodash_1, lodash_2, moment) {
	            console.log(lodash_1.VERSION); // → 2.4.1
	            console.log(lodash_2.VERSION); // → 3.0.8
	            console.log(moment.version);   // → 2.10.3
	        })
	});
	```