/**
 * @class Super simple Ajax class.
 * @author <a href="mailto:brad@vimeo.com">Brad Dougherty</a>
 * @version 1.0
 *
 * @example
 * // Asynchronous request
 * new XHR.get('page.json', function(data) {
 *     console.log(data); // json object
 * });
 *
 * // Synchronous request
 * var string = new XHR.get('page.txt');
 * console.log(string); // string
 *
 *
 * @constructor
 * @description Create a new XHR object.
 */
XHR = function() {
    // Trick IE
    if (typeof XMLHTTPRequest === 'undefined') {
        XMLHTTPRequest = function() {
            return (XDomainRequest) ? new XDomainRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        }
    }

    /**
     * Try to parse a response into a JSON object
     * @private
     * @param {String} responseText
     * @returns {String|Object}
     */
    function parseResponse(responseText) {
        try {
            return JSON.parse(responseText);
        }
        catch (error) {
            return responseText;
        }
    }

    /**
     * Make a request.
     * @private
     * @param {string} method The HTTP method to use
     * @param {string} url The URL to request
     * @param {string|null} data The data to POST (querystring format)
     * @param {Function|null} [callback] A callback function for async calls
     * @param {boolean} [sendCredentials] Whether or not to send credentials
     * @param {string} [type] The content-type of the response
     * @returns {null|string|Object}
     */
    function request(method, url, data, callback, sendCredentials, type) {
        var req = new XMLHttpRequest(),
            parts = /^(\w+:)?\/\/([^\/?#]+)/.exec(url),
            remote = parts && (parts[1] && parts[1].toLowerCase() !== location.protocol || parts[2].toLowerCase() !== location.host);

        req.open(method, url, !!callback);

        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // script tag hack
        if (type === 'script' && method === 'GET' && remote) {
            var head = document.getElementsByTagName('head')[0] || document.documentElement,
                script = document.createElement('script'),
                done = false;

            script.src = url;

            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;

                    // Memory leak in IE
                    script.onload = script.onreadystatechange = null;
                    if (head && script.parentNode) {
                        head.removeChild(script);
                    }
                }
            }

            head.insertBefore(script, head.firstChild);

            return true;
        }

        if (!remote) {
            req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }

        if (sendCredentials) {
            req.withCredentials = true;
        }

        if (!!callback) {
            req.onreadystatechange = function(event) {
                if (req.readyState === 4) {
                    callback.call(req, parseResponse(req.responseText), req.status);
                }
            }
        }

        req.send(data);
        return !!callback ? true : parseResponse(req.responseText);
    }

    /**
     * Make a GET request.
     * If the callback is null, will be synchronous. Synchronous calls return either the response text or parsed JSON. Asynchronous calls return null.
     * @param {string} url The URL to request
     * @param {Function|null} [callback] The function to call on completion
     * @returns {null|string|Object}
     */
    this.get = function(url, callback) {
        return request('GET', url, null, callback);
    }

    /**
     * Make a GET request with credentials (for CORS).
     * If the callback is null, will be synchronous. Synchronous calls return either the response text or parsed JSON. Asynchronous calls return null.
     * @param {string} url The URL to request
     * @param {Function|null} [callback] The function to call on completion
     * @returns {null|string|Object}
     */
    this.getWithCredentials = function(url, callback) {
        return request('GET', url, null, callback, true);
    }

    /**
     * Make a GET request for JSON.
     * If the callback is null, will be synchronous. Synchronous calls return either the response text or parsed JSON. Asynchronous calls return null.
     * @param {string} url The URL to request
     * @param {boolean} credentials Whether or not to send credentials
     * @returns {null|string|Object}
     */
    this.getJson = function(url, credentials) {
        return request('GET', url, null, null, credentials, 'script');
    }

    /**
     * Make a POST request.
     * If the callback is null, will be synchronous. Synchronous calls return either the response text or parsed JSON. Asynchronous calls return null.
     * @param {string} url The URL to request
     * @param {string} data The data to POST (querystring format)
     * @param {Function|null} [callback] The function to call on completion
     * @returns {null|string|Object}
     */
    this.post = function(url, data, callback) {
        return request('POST', url, data, callback);
    }

    /**
     * Make a POST request with credentials (for CORS).
     * If the callback is null, will be synchronous. Synchronous calls return either the response text or parsed JSON. Asynchronous calls return null.
     * @param {string} url The URL to request
     * @param {string} data The data to POST (querystring format)
     * @param {Function|null} [callback] The function to call on completion
     * @returns {null|string|Object}
     */
    this.postWithCredentials = function(url, data, callback) {
        return request('POST', url, data, callback, true);
    }

    this.request = request;
};

window.XHR = XHR;