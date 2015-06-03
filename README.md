multidep
========

##example

1. Publish dependencies repository to any public url

	```js
	define({
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

2. Init **multidep** with repository url, and define module

	```js
	multidep.init('//path.to/repository.js').then(() => {
	    define('my-module', ['lodash@^2.0.0', 'lodash@~3.0.7', 'moment@2.10.3'],
	        function (lodash_1, lodash_2, moment) {
	            return [lodash_1.VERSION, lodash_2.VERSION, moment.version]
	        })
	});
	```

3. Require module

    ```js
    requirejs(['my-module'], function(myModule) {
        console.log(myModule); // → ["2.4.1", "3.0.8", "2.10.3"]
    }
    ```