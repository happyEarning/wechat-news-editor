const request = require('request'),
    async = require('async'),
    _ = require('lodash');

module.exports.get = function(url, headers, params, callback) {
    if (arguments.length === 3) {
        callback = arguments[2];
        params = arguments[1];
        headers = {};
    }
    params = params || {};
    let queryStr = _.toPairs(params).map(function (p) {
        return '' + p[0] + '=' + encodeURIComponent(p[1]);
    }).join('&');
    if (queryStr) {
        url += '?' + queryStr;
    }

    request.get({
        url : url,
        headers : headers,
        gzip : true
    }, callback);
};

module.exports.json = function(url, headers, params, callback) {
    if (arguments.length === 3) {
        callback = arguments[2];
        params = arguments[1];
        headers = {};
    }
    params = params || {};
    request.post({
        url : url,
        headers : headers,
        body : params,
        json : true,
        gzip : true
    }, callback);
};

module.exports.postForm = function (url, params, callback) {
  request.post({
    url: url,
    form: params
  }, callback)
}