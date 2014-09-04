'use strict';

/* global protractor */

var config = require('./testconfig.js');
var utils = require('./testUtils.js');

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

    utils.sendRequest(options).then(function(status) {
      console.log('user deleted successfully: ', email);
      defer.fulfill(200);
    }, function(data) {
      console.log('user deletion failed: ', email, data);
      defer.reject(data);
    });

  });
  return defer.promise;
};