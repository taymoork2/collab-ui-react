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
    'WebExApiGatewayConstsService',

    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
      $rootScope,
      Authinfo,
      WebExUtilsFact,
      WebExApiGatewayConstsService
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

          if (WebExApiGatewayConstsService.csvStates.none == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeNone
            };
          } else if (WebExApiGatewayConstsService.csvStates.exportInProgress == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeExport,
              request: WebExApiGatewayConstsService.csvJobStatus.statusQueued
            };
          } else if (WebExApiGatewayConstsService.csvStates.exportCompletedNoErr == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeExport,
              request: WebExApiGatewayConstsService.csvJobStatus.statusCompleted,
              created: "03/23/16 12:41 AM",
              started: "03/23/16 12:41 AM",
              finished: "03/23/16 12:41 AM",
              totalRecords: 5,
              successRecords: 5,
              failedRecords: 0,
              exportFileLink: "http://fakeSite.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl"
            };
          } else if (WebExApiGatewayConstsService.csvStates.exportCompletedWithErr == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeExport,
              request: WebExApiGatewayConstsService.csvJobStatus.statusCompleted,
              created: "03/23/16 12:41 AM",
              started: "03/23/16 12:41 AM",
              finished: "03/23/16 12:41 AM",
              totalRecords: 5,
              successRecords: 4,
              failedRecords: 1,
              exportFileLink: "http://fakeSite.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl"
            };
          } else if (WebExApiGatewayConstsService.csvStates.importInProgress == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeImport,
              request: WebExApiGatewayConstsService.csvJobStatus.statusQueued,
            };
          } else if (WebExApiGatewayConstsService.csvStates.importCompletedNoErr == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeImport,
              request: WebExApiGatewayConstsService.csvJobStatus.statusCompleted,
              created: "03/23/16 12:41 AM",
              started: "03/23/16 12:41 AM",
              finished: "03/23/16 12:41 AM",
              totalRecords: 5,
              successRecords: 5,
              failedRecords: 0
            };
          } else if (WebExApiGatewayConstsService.csvStates.importCompletedWithErr == mockCsvStatusReq) {
            fakeResult = {
              jobType: WebExApiGatewayConstsService.csvJobTypes.typeImport,
              request: WebExApiGatewayConstsService.csvJobStatus.statusCompleted,
              errorLogLink: "http://fakeSite.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl",
              created: "03/23/16 12:41 AM",
              started: "03/23/16 12:41 AM",
              finished: "03/23/16 12:41 AM",
              totalRecords: 5,
              successRecords: 3,
              failedRecords: 2
            };
          }

          return $q.resolve(fakeResult);
        }, // csvApiRequest()
      }; // return
    } // top level function()
  ]);
})();
