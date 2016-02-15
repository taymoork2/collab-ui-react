'use strict';

angular.module('WebExApp').service('WebExRestApiService', [
  '$q',
  '$rootScope',
  '$http',
  '$timeout',
  '$interpolate',
  '$log',
  'Authinfo',
  function (
    $q,
    $rootScope,
    $http,
    $timeout,
    $interpolate,
    $log,
    Authinfo
  ) {
    var _this = this;

    this.sendRestApiReq = function (
      siteUrl,
      requestObj,
      resolve,
      reject
    ) {

      var funcName = 'sendRestApiReq()';
      var logMsg = '';

      var restApiUrl = 'https://' + siteUrl + '/???';
      var primaryEmail = Authinfo.getPrimaryEmail();
      var authToken = $rootScope.token;

      logMsg = funcName + '\n' +
        'restApiUrl=' + restApiUrl + '\n' +
        'requestObj=' + JSON.stringify(requestObj) + '\n' +
        'primaryEmail=' + primaryEmail;
      $log.log(logMsg);

      /*
      $http({
        url: restApiUrl,
        method: 'POST',
        headers: {},
        data: requestObj
      }).success(function (data) {
        resolve(data);
      }).error(function (data) {
        reject(data);
      });
      */
    }; // sendRestApiReq()

    this.csvStatusReq = function (siteUrl) {
      var requestObj = {
        request: 'dummy'
      };

      _this.sendRestApiReq(
        siteUrl,
        requestObj,
        null,
        null
      );
      /*
      return $q(
        function sendRestApiReq(
          resolve,
          reject
        ) {
          _this.sendRestApiReq(
            siteUrl,
            requestObj,
            resolve,
            reject
          );
        } // senddRestApiReq()
      );
      */
    }; // csvStatusReq()
  } // top level service function
]);
