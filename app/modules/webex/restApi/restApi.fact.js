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

      return {
        csvStatusReq: function (
          siteUrl
        ) {

          var funcName = "csvStatusReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          $log.log(logMsg);

          var fakeResult = {
            'sitename': siteUrl,
            'result:': null,
            'status': 'none', // none, expInProgress, expCompleted, impInProgress, impCompleted
            'completionInfo': null // not null only if status is expCompleted or impCompleted
          };

          return $q.when(fakeResult);
        }, // csvStatusReq()

        csvExportReq: function (siteUrl) {
          var funcName = "csvExportReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          $log.log(logMsg);

          var fakeResult = {
            'sitename': siteUrl,
            'result:': null,
            'status': 'none', // none, expInProgress, expCompleted, impInProgress, impCompleted
            'completionInfo': null // not null only if status is expCompleted or impCompleted
          };

          return $q.when(fakeResult);
        }, // csvExportReq()
      }; // return
    } // top level function()
  ]);
})();
