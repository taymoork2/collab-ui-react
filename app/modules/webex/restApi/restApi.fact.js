(function () {
  'use strict';

  angular.module('WebExApp').factory('WebExRestApiFact', [
    '$http',
    '$log',
    '$interpolate',
    '$q',
    '$timeout',
    '$rootScope',
    'Authinfo',
    'Storage',
    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
      $rootScope,
      Authinfo,
      Storage
    ) {
      var _this = this;

      this.sendRestApiReq = function (
        siteUrl,
        reqType,
        resolve,
        reject
      ) {

        var funcName = "sendRestApiReq()";
        var logMsg = "";

        logMsg = funcName + "\n" +
          "siteUrl=" + siteUrl + "\n" +
          "reqType=" + reqType;
        $log.log(logMsg);

        var restApiUrl = null; // TODO
        var fakeResult = null;

        if ("csvStatusReq" == reqType) {
          fakeResult = {
            'sitename': siteUrl,
            'result:': null,
            'status': 'none', // none, expInProgress, expCompleted, impInProgress, impCompleted
            'completionInfo': null // not null only if status is expCompleted or impCompleted
          };
        }

        $q.when(fakeResult);
      }; //sendRestApiReq()

      return {
        csvStatusReq: function (
          siteUrl
        ) {

          var funcName = "csvStatusReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          $log.log(logMsg);

          return $q.when(_this.sendRestApiReq(
            siteUrl,
            'csvStatusReq'
          ));
        }, // csvStatusReq()
      }; // return
    } // top level function()
  ]);
})();
