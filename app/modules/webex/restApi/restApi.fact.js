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
    'WebExUtilsFact',

    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
      $rootScope,
      Authinfo,
      Storage,
      WebExUtilsFact
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

        var siteName = WebExUtilsFact.getSiteName(siteUrl);

        var reqData = {
          'siteName': siteName
        };

        var reqHeader = {
          'Content-Type': 'application/json;charset=utf-8',
          'Authorization': 'Bearer ???',
          'TrackingID': 'ATLAS_9011da04-7198-0d6c-fe4a-9dfe92135fb6'
        };

        var restApiUrl = "https://" + siteUrl + "/meeting/v1/users";
        if ("csvStatusReq" == reqType) {
          restApiUrl = restApiUrl + "/importexportstatus";
        } else if ("csvExportReq" == reqType) {
          restApiUrl = restApiUrl + "/export";
        }

        var httpReq = {
          'url': restApiUrl,
          'method': 'POST',
          'headers': reqHeader,
          'data': reqData
        };

        logMsg = funcName + "\n" +
          "httpReq=" + JSON.stringify(httpReq);
        $log.log(logMsg);

        var fakeResult = {
          'sitename': siteUrl,
          'reqType:': reqType,
        };

        return $q.when(fakeResult);
        /*
        $http(
          httpReq
        ).success(
          function (data) {
            resolve(data);
          }
        ).error(
          function (data) {
            reject(data);
          }
        );
        */
      }; //sendRestApiReq()

      return {
        csvStatusReq: function (
          siteUrl
        ) {
          var funcName = "csvStatusReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          // $log.log(logMsg);

          return $q.when(_this.sendRestApiReq(
            siteUrl,
            'csvStatusReq'
          ));
        }, // csvStatusReq()

        csvImportReq: function (
          siteUrl
        ) {
          var funcName = "csvImportReq()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "siteUrl=" + siteUrl;
          // $log.log(logMsg);

          return $q.when(_this.sendRestApiReq(
            siteUrl,
            'csvImportReq'
          ));
        }, // csvStatusReq()
      }; // return
    } // top level function()
  ]);
})();
