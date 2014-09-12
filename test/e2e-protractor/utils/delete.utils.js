'use strict';

/* global protractor */

var config = require('./test.config.js');
var utils = require('./test.utils.js');

exports.deleteUser = function(email) {
  var defer = protractor.promise.defer();

  utils.getToken().then(function(token) {
    var options = {
      method: 'delete',
      url: config.adminServiceUrl.integration + 'user?email=' + encodeURIComponent(email),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
    };

    utils.sendRequest(options).then(function() {
      console.log('user deleted successfully: ', email);
      defer.fulfill(200);
    }, function(data) {
      console.log('user deletion failed: ', email, data);
      defer.reject(data);
    });

  });
  return defer.promise;
};
