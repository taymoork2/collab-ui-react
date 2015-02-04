'use strict';

/* global protractor */

var config = require('./test.config.js');
var utils = require('./test.utils.js');

// exports.deleteTrial = function(trialId) {
//   var defer = protractor.promise.defer();

//   utils.getToken().then(function(token) {
//     var options = {
//       method: 'delete',
//       url: config.adminServiceUrl.integration + 'trials/' + trialId,
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer ' + token
//       },
//     };

//     utils.sendRequest(options).then(function() {
//       console.log('trial deleted successfully: ', trialId);
//       defer.fulfill(200);
//     }, function(data) {
//       console.log('trial deletion failed: ', trialId, data);
//       defer.reject(data);
//     });

//   });
//   return defer.promise;
// };

exports.deleteOrg = function(orgId, token) {
  var defer = protractor.promise.defer();

  var options = {
    method: 'delete',
    url: config.adminServiceUrl.integration + 'organizations/' + orgId,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
  };

  utils.sendRequest(options).then(function() {
    console.log('org deleted successfully: ', orgId);
    defer.fulfill(200);
  }, function(data) {
    console.log('org deletion failed: ', orgId, data);
    defer.reject(data);
  });

  return defer.promise;
};
