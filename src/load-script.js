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