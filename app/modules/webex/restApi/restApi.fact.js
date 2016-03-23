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
    'WebExUtilsFact',

    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
      $rootScope,
      Authinfo,
      WebExUtilsFact
    ) {

      var _this = this;

      this.sendRestApiReq = function (
        httpReq,
        resolve,
        reject
      ) {

        var funcName = "sendRestApiReq()";
        var logMsg = "";

        logMsg = funcName + "\n" +
          "httpReq.url=" + JSON.stringify(httpReq.url);
        $log.log(logMsg);

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
      }; //sendRestApiReq()

      return {
        csvApiRequest: function (
          mockCsvStatus,
          mockCsvStatusReq,
          httpsReqObj
        ) {

          if (!mockCsvStatus) {
            return $q(
              function (resolve, reject) {
                _this.sendRestApiReq(
                  httpsReqObj,
                  resolve,
                  reject
                );
              }
            );
          }

          var fakeResult = null;

          if ('none' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 0,
            };
          } else if ('exportInProgress' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 2,
              "request": 0
            };
          } else if ('exportCompletedNoErr' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 2,
              "request": 2,
              "created": "03/23/16 12:41 AM",
              "started": "03/23/16 12:41 AM",
              "finished": "03/23/16 12:41 AM",
              "totalRecords": 5,
              "successRecords": 5,
              "failedRecords": 0,
              "exportFileLink": "http://sjsite14.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl"
            };
          } else if ('exportCompletedWithErr' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 2,
              "request": 2,
              "created": "03/23/16 12:41 AM",
              "started": "03/23/16 12:41 AM",
              "finished": "03/23/16 12:41 AM",
              "totalRecords": 5,
              "successRecords": 4,
              "failedRecords": 1,
              "exportFileLink": "http://sjsite14.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl"
            };
          } else if ('importInProgress' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 1,
              "request": 0,
            };
          } else if ('importCompletedNoErr' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 1,
              "request": 2,
              "created": "03/23/16 12:41 AM",
              "started": "03/23/16 12:41 AM",
              "finished": "03/23/16 12:41 AM",
              "totalRecords": 5,
              "successRecords": 5,
              "failedRecords": 0
            };
          } else if ('importCompletedWithErr' == mockCsvStatusReq) {
            fakeResult = {
              "jobType": 1,
              "request": 2,
              "errorLogLink": "http://sjsite14.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl",
              "created": "03/23/16 12:41 AM",
              "started": "03/23/16 12:41 AM",
              "finished": "03/23/16 12:41 AM",
              "totalRecords": 5,
              "successRecords": 3,
              "failedRecords": 2
            };
          }

          return $q.resolve(fakeResult);
        }, // csvApiRequest()
      }; // return
    } // top level function()
  ]);
})();
