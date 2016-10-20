'use strict';

/* global protractor */

var _ = require('lodash');

var config = require('./test.config.js');
var utils = require('./test.utils.js');

// exports.deleteTrial = function(trialId) {
//   var defer = protractor.promise.defer();

//   utils.getToken().then(function(token) {
//     var options = {
//       method: 'delete',
//       url: config.getAdminServiceUrl() + 'trials/' + trialId,
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer ' + token
//       },
//     };

//     utils.sendRequest(options).then(function() {
//       //console.log('trial deleted successfully: ', trialId);
//       defer.fulfill(200);
//     }, function(data) {
//       //console.log('trial deletion failed: ', trialId, data);
//       defer.reject(data);
//     });

//   });
//   return defer.promise;
// };

function getBlackListOrgs() {
  var auth = helper.auth,
    ret = {};

  _.forOwn(auth, function (value) {
    ret[value.org] = null;
  });
  return ret;
}

function isBlackListedOrg(orgId) {
  if (!orgId) {
    throw new Error('Invalid value for orgId: ' + orgId);
  }
  var blackList = getBlackListOrgs();
  return (orgId in blackList);
}

exports.deleteOrg = function (orgId, token) {
  var defer = protractor.promise.defer();

  var options = {
    method: 'delete',
    url: config.getAdminServiceUrl() + 'organizations/' + orgId,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
  };

  if (isBlackListedOrg(orgId)) {
    // console.log('Prevent delete of a blacklisted orgId: ' + orgId);
    defer.reject('Prevent delete of a blacklisted orgId: ' + orgId);
  } else {
    utils.sendRequest(options).then(function () {
      // console.log('org deleted successfully: ', orgId);
      defer.fulfill(200);
    }, function () {
      // console.log('org deletion failed: ', orgId, data);
      defer.fulfill(200);
    });
  }

  return defer.promise;
};
