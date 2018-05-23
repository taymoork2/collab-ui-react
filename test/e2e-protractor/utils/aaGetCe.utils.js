'use strict';

const config = require('./test.config.js');
const request = require('request');
const omitDeep = require('omit-deep-lodash');

//
//validateCesDefinition - validate CE Definition
//
//Used to validate CE definition created

exports.validateCesDefinition = function (ceInfo) {
  return helper.getBearerToken('aa-admin')
    .then(function (bearer) {
      var options = {
        method: 'get',
        url: config.getAutoAttendantsUrl(helper.auth['aa-admin'].org),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + bearer,
        },
      };
      var defer = protractor.promise.defer();
      request(options,
        function (error, response) {
          if (!error && response.statusCode === 200) {
            var body = JSON.parse(response.body);
            var aa = _.find(body, function (aa) {
              return aa.callExperienceName === deleteUtils.testAAName
            });
            return defer.fulfill(aa.callExperienceURL);
          } else {
            return defer.reject({
              error: error,
              message: body,
            });
          }
        });
      return defer.promise.then(function (ceURL) {
        return exports.getAndValidateCesDefinition(bearer, ceURL, ceInfo);
      });
    });
};

exports.getAndValidateCesDefinition = function (bearer, ceURL, ceInfo) {
  var options = {
    method: 'get',
    url: ceURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + bearer,
    },
  };
  var defer = protractor.promise.defer();
  request(options,
    function (error, response) {
      if (!error && response.statusCode === 200) {
        var body = JSON.parse(response.body);
        return defer.fulfill(body);
      }
    });
  return defer.promise.then(function (cesBody) {
    return exports.areCeDefinitionsEqual(ceInfo, cesBody);
  });
};
//exports.ceInfo = '';
exports.areCeDefinitionsEqual = function (ceInfo, res) {
  //These parameters are dynamical that's why omitting them 

  //description is different in case of media file uploaded as it contains the date of uploading file
  var result = omitDeep(res.actionSets, 'htmlModel', 'url', 'deleteUrl', 'as', 'description');  

  expect(_.isEqual(result, ceInfo)).toBe(true);
}

exports.validateCesDefinitionForHybridOrg = function (ceInfo) {
  return helper.getBearerToken('hybrid-org')
    .then(function (bearer) {
      var options = {
        method: 'get',
        url: config.getAutoAttendantsUrl(helper.auth['hybrid-org'].org),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + bearer,
        },
      };
      var defer = protractor.promise.defer();
      request(options,
        function (error, response) {
          if (!error && response.statusCode === 200) {
            var body = JSON.parse(response.body);
            var aa = _.find(body, function (aa) {
              return aa.callExperienceName === deleteUtils.testAAName
            });
            return defer.fulfill(aa.callExperienceURL);
          } else {
            return defer.reject({
              error: error,
              message: body,
            });
          }
        });
      return defer.promise.then(function (ceURL) {
        return exports.getAndValidateCesDefinitionForHybridOrg(bearer, ceURL, ceInfo);
      });
    });
};

exports.getAndValidateCesDefinitionForHybridOrg = function (bearer, ceURL, ceInfo) {
  var options = {
    method: 'get',
    url: ceURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + bearer,
    },
  };
  var defer = protractor.promise.defer();
  request(options,
    function (error, response) {
      if (!error && response.statusCode === 200) {
        var body = JSON.parse(response.body);
        return defer.fulfill(body);
      }
    });
  return defer.promise.then(function (cesBody) {
    return exports.areCeDefinitionsEqual(ceInfo, cesBody);
  });
};
