'use strict';

/* global protractor */

var request = require('request');
// var jar = request.jar();
// var req = request.defaults({
//   jar: jar
// });

exports.randomId = function() {
  return (Math.random() + 1).toString(36).slice(2);
};

exports.randomTestEmail = function() {
	return 'atlas-' + this.randomId() + '@wx2.example.com';
};

exports.randomTestGmail = function() {
  return 'phtest77+' + this.randomId() + '@gmail.com';
};

exports.sendRequest = function(options) {
  var defer = protractor.promise.defer();

  console.log('\nSending Request...', options);

  request(options, function(error, response, message) {
    console.log('\nResponse Received...', options.url);
    console.log('--error: ' + error);
    console.log('--status code: ' + response.statusCode);
    console.log('--message: ' + message);
   
    if (error || response.statusCode >= 400) {
      defer.reject({
        status: response.statusCode,
        error: error,
        message: message
      });
    } else {
      defer.fulfill(message);
    }
  });
  return defer.promise;
};