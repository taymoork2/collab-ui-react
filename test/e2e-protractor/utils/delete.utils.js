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
        'Authorization': 'Bearer ' + token
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

exports.deleteSquaredUCUser = function(customerUuid,userUuid,email) {
  var defer = protractor.promise.defer();

  utils.getToken().then(function(token) {
    var options = {
      method: 'delete',
      url: config.squaredUCServiceUrl.integration + 'common/customers/' + customerUuid + '/users/' + userUuid,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };

    utils.sendRequest(options).then(function() {
      console.log('user deleted successfully: ', email);
      defer.fulfill(204);
    }, function(data) {
      console.log('user deletion failed: ', email, data);
      defer.reject(data);
    });

  });
  return defer.promise;
};

exports.deleteDirectoryNumber = function(customerUuid,userUuid,directoryNumber) {
  var defer = protractor.promise.defer();

  utils.getToken().then(function(token) {
    var options = {
      method: 'get',
      url: config.squaredUCServiceUrl.integration + 'voice/customers/' + customerUuid + '/users/' + userUuid + '/directorynumbers/',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };

    utils.sendRequest(options).then(function(message) {
      console.log('user returned successfully: ');
      var lineUuid = utils.findDirectoryNumber(JSON.parse(message), directoryNumber);
      if (lineUuid !== null) {
        options.method = 'delete';
        var url = options.url + lineUuid;
        options.url = url;
        utils.sendRequest(options).then(function() {
          console.log('directory number deleted successfully: ', directoryNumber);
          defer.fulfill(204);
        }, function(data) {
          console.log('user deletion failed: ', lineUuid, data);
          defer.reject(data);
        });
      } else {
        console.log('user does not have directory number: ', directoryNumber);
        defer.reject(message);
      }
    }, function(data) {
      console.log('user deletion failed: ', directoryNumberUuid, data);
      defer.reject(data);
    });

  });
  return defer.promise;
};