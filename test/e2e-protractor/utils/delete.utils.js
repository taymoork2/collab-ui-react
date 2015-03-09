'use strict';

var config = require('./test.config.js');
var utils = require('./test.utils.js');

exports.deleteUser = function (email) {
  return utils.getToken().then(function (token) {
    var options = {
      method: 'delete',
      url: config.adminServiceUrl.integration + 'user?email=' + encodeURIComponent(email),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
    };

    return utils.sendRequest(options).then(function () {
      return 200;
    });
  });
};

exports.deleteSquaredUCUser = function (customerUuid, userUuid) {
  return utils.getToken().then(function (token) {
    var options = {
      method: 'delete',
      url: config.squaredUCServiceUrl.integration + 'common/customers/' + customerUuid + '/users/' + userUuid,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };

    return utils.sendRequest(options).then(function () {
      return 204;
    });
  });
};
