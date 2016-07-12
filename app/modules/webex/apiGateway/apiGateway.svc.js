(function () {
  'use strict';

  /* global Uint8Array:false */

  angular.module('WebExApp').service('WebExApiGatewayService', WebExApiGatewayService);

  /* @ngInject */
  function WebExApiGatewayService(
    $q,
    $window,
    $log,
    Authinfo,
    TokenService,
    WebExUtilsFact,
    WebExXmlApiFact,
    WebExXmlApiInfoSvc,
    WebExRestApiFact,
    WebExApiGatewayConstsService
  ) {

    var _this = this;

    this.csvConstructHttpsObj = function (
      siteUrl,
      csvApi
    ) {

      var httpsObj = null;
      var csvUrl = null;
      var accessToken = null;

      WebExApiGatewayConstsService.csvAPIs.forEach(
        function checkAPI(csvAPI) {
          if (csvApi == csvAPI.request) {
            csvUrl = 'https://' + siteUrl + '/meetingsapi/v1/users/' + csvAPI.api;

            accessToken = TokenService.getAccessToken();

            httpsObj = {
              url: csvUrl,
              method: csvAPI.method,
              headers: {
                'Content-Type': csvAPI.contentType,
                'Authorization': 'Bearer ' + accessToken,
              }
            };

            if ("POST" == csvAPI.method) {
              httpsObj.data = csvAPI.data;
            }
          }
        } // csvAPI()
      ); // WebExApiGatewayConstsService.csvAPIs.forEach()

      return httpsObj;
    }; // csvConstructHttpsObj()

    this.csvStatus = function (
      siteUrl,
      mockFlag,
      mockCsvStatusReq
    ) {

      var funcName = 'csvStatus()';
      var logMsg = '';

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvStatus
      );

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockFlag=" + mockFlag + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      // $log.log(logMsg);

      var successResult = {
        siteUrl: siteUrl,
        isMockResult: mockFlag,
        status: null, // can be any one of WebExApiGatewayConstsService.csvStatusTypes[]
        details: null
      };

      var errorResult = {
        siteUrl: siteUrl,
        isMockResult: mockFlag,
        status: 'error',
        errorId: null,
        errorDesc: null,
        details: null
      };

      var deferredResponse = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        mockCsvStatusReq,
        csvHttpsObj
      ).then(

        function success(response) {
          var funcName = "WebExRestApiFact.csvStatusReq.success()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          // $log.log(logMsg);

          successResult.details = response;
          errorResult.details = response;

          // TODO: if error response then return reject

          var csvJobType = response.jobType;
          var csvJobStatus = response.request;

          switch (csvJobType) {
          case WebExApiGatewayConstsService.csvJobTypes.typeNone:
            successResult.status = WebExApiGatewayConstsService.csvStates.none;
            break;

          case WebExApiGatewayConstsService.csvJobTypes.typeImport:
            switch (csvJobStatus) {
            case WebExApiGatewayConstsService.csvJobStatus.statusQueued:
            case WebExApiGatewayConstsService.csvJobStatus.statusPreProcess:
            case WebExApiGatewayConstsService.csvJobStatus.statusInProcess:
              successResult.status = WebExApiGatewayConstsService.csvStates.importInProgress;
              break;

            case WebExApiGatewayConstsService.csvJobStatus.statusCompleted:
              successResult.status = (
                response.failedRecords === 0
              ) ? WebExApiGatewayConstsService.csvStates.importCompletedNoErr : WebExApiGatewayConstsService.csvStates.importCompletedWithErr;
              break;

            default:
              // TODO: handle error
              break;
            }

            break;

          case WebExApiGatewayConstsService.csvJobTypes.typeExport:
            switch (csvJobStatus) {
            case WebExApiGatewayConstsService.csvJobStatus.statusQueued:
            case WebExApiGatewayConstsService.csvJobStatus.statusPreProcess:
            case WebExApiGatewayConstsService.csvJobStatus.statusInProcess:
              successResult.status = WebExApiGatewayConstsService.csvStates.exportInProgress;
              break;

            case WebExApiGatewayConstsService.csvJobStatus.statusCompleted:
              successResult.status = (
                response.failedRecords === 0
              ) ? WebExApiGatewayConstsService.csvStates.exportCompletedNoErr : WebExApiGatewayConstsService.csvStates.exportCompletedWithErr;
              break;

            default:
              // TODO: handle error
              break;
            }

            break;

          default:
            // TODO: handle error
            break;
          }

          deferredResponse.resolve(successResult);
        },

        function error(response) {
          var funcName = "WebExRestApiFact.csvStatusReq.error()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          deferredResponse.reject(errorResult);
        }
      );

      return deferredResponse.promise;
    }; // csvStatus()

    this.csvExport = function (
      siteUrl,
      mockFlag
    ) {

      var funcName = 'WebExApiGatewayService.csvExport()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl;
      // $log.log(logMsg);

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvExport
      );

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockFlag=" + mockFlag + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      // $log.log(logMsg);

      var deferredResponse = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        null,
        csvHttpsObj
      ).then(

        function success(response) {
          deferredResponse.resolve(response);
        },

        function error(response) {
          deferredResponse.reject(response);
        }
      ); // WebExRestApiFact.csvExportReq()

      return deferredResponse.promise;
    }; // csvExport()

    this.webexCreateImportBlob = function (data) {
      var funcName = "webexCreateImportBlob()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "data.length=" + data.length;
      // $log.log(logMsg);

      var intBytes = WebExUtilsFact.utf8ToUtf16le(data);

      var newData = new Uint8Array(intBytes);

      var blob = new $window.Blob([newData], {
        type: 'text/csv;charset=UTF-16LE;'
      });

      return blob;
    }; // webexCreateImportBlob()

    this.csvImportOld = function (
      vm
    ) {

      var funcName = 'csvImportOld()';
      var logMsg = '';

      var siteUrl = vm.siteUrl;
      var mockFlag = vm.csvImportObj.csvMock.mockImport;
      var csvFile = vm.modal.file;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + '\n' +
        'mockFlag=' + mockFlag + ' csvFile=' + csvFile;
      //$log.log(logMsg);

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvImport
      );

      var fd = new $window.FormData();
      fd.append("importCsvFile", _this.webexCreateImportBlob(csvFile));

      csvHttpsObj.data = fd;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      //$log.log(logMsg);

      var deferredResponse = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        null,
        csvHttpsObj
      ).then(

        function success(response) {
          deferredResponse.resolve(response);
        },

        function error(response) {
          deferredResponse.reject(response);
        }
      ); // WebExRestApiFact.csvExportReq()

      return deferredResponse.promise;
    }; // csvImportOld()

    this.csvImport = function (
      vm
    ) {

      var funcName = 'csvImport()';
      var logMsg = '';

      var siteUrl = vm.siteUrl;
      var mockFlag = vm.siteRow.csvMock.mockImport;
      var csvFile = vm.modal.file;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + '\n' +
        'mockFlag=' + mockFlag + ' csvFile=' + csvFile;
      //$log.log(logMsg);

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvImport
      );

      var fd = new $window.FormData();
      fd.append("importCsvFile", _this.webexCreateImportBlob(csvFile));

      csvHttpsObj.data = fd;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      //$log.log(logMsg);

      var deferredResponse = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        null,
        csvHttpsObj
      ).then(

        function success(response) {
          deferredResponse.resolve(response);
        },

        function error(response) {
          deferredResponse.reject(response);
        }
      ); // WebExRestApiFact.csvExportReq()

      return deferredResponse.promise;
    }; // csvImport()

    this.siteFunctions = function (siteUrl) {
      var funcName = "siteFunctions()";
      var logMsg = "";

      var deferredIsSiteSupportsIframe = $q.defer();
      var siteName = WebExUtilsFact.getSiteName(siteUrl);

      logMsg = funcName + ": " + "siteUrl=" + siteUrl;
      // $log.log(logMsg);

      WebExXmlApiFact.getSessionTicket(siteUrl, siteName).then(
        function getSessionTicketSuccess(response) {
          WebExXmlApiInfoSvc.xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";
          WebExXmlApiInfoSvc.webexSiteName = WebExUtilsFact.getSiteName(siteUrl);
          WebExXmlApiInfoSvc.webexAdminID = Authinfo.getPrimaryEmail();
          WebExXmlApiInfoSvc.webexAdminSessionTicket = response;

          getSiteData().then(
            function getSiteDataSuccess(response) {
              var funcName = "getSiteDataSuccess()";
              var logMsg = "";

              var siteVersionJsonObj = WebExUtilsFact.validateSiteVersionXmlData(response.siteVersionXml);
              var isAdminReportEnabled = isAdminReportEnabledCheck(WebExUtilsFact.validateSiteInfoXmlData(response.siteInfoXml));
              var t31Site = isT31Site(siteVersionJsonObj);

              var isSiteSupportsIframeResult = {
                siteUrl: siteUrl,
                isCSVSupported: t31Site,
                isIframeSupported: true,
                isAdminReportEnabled: isAdminReportEnabled
              };

              logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
                "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
              $log.log(logMsg);

              deferredIsSiteSupportsIframe.resolve(isSiteSupportsIframeResult);
            }, // getSiteDataSuccess()

            function getSiteDataError(response) {
              var funcName = "getSiteDataError()";
              var logMsg = "";

              var isSiteSupportsIframeResult = {
                siteUrl: siteUrl,
                error: "getSiteDataError",
                response: response
              };

              logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
                "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
              $log.log(logMsg);

              deferredIsSiteSupportsIframe.reject(isSiteSupportsIframeResult);
            } // getSiteDataError()
          ); // getSiteData().then
        }, // siteFunctions().getSessionTicketSuccess()

        function getSessionTicketError(response) {
          var funcName = "siteFunctions().getSessionTicketError()";
          var logMsg = "";

          var result = {
            siteUrl: siteUrl,
            error: "getSessionTicketError",
            response: response
          };

          logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
            "result=" + JSON.stringify(result);
          $log.log(logMsg);

          deferredIsSiteSupportsIframe.reject(result);
        } // siteFunctions().getSessionTicketError()
      ); // siteFunctions().getSessionTicket(siteUrl).then()

      function getSiteData() {
        var siteVersionXml = WebExXmlApiFact.getSiteVersion(WebExXmlApiInfoSvc);
        var siteInfoXml = WebExXmlApiFact.getSiteInfo(WebExXmlApiInfoSvc);

        return $q.all({
          siteVersionXml: siteVersionXml,
          siteInfoXml: siteInfoXml
        });
      } // getSiteData()

      function getEnableT30UnifiedAdminData() {
        var enableT30UnifiedAdminInfoXml = WebExXmlApiFact.getEnableT30UnifiedAdminInfo(WebExXmlApiInfoSvc);

        return $q.all({
          enableT30UnifiedAdminInfoXml: enableT30UnifiedAdminInfoXml
        });
      } // getEnableT30UnifiedAdminData()

      function isT31Site(siteVersionJsonObj) {
        var funcName = "isT31Site()";
        var logMsg = "";

        var trainReleaseOrder = WebExUtilsFact.getSiteVersion(siteVersionJsonObj).trainReleaseOrder;
        var isT31SiteResult = (
          (null != trainReleaseOrder) &&
          (400 <= +trainReleaseOrder)
        ) ? true : false;

        logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
          "trainReleaseOrder=" + trainReleaseOrder + "\n" +
          "isT31SiteResult=" + isT31SiteResult;
        // $log.log(logMsg);

        return isT31SiteResult;
      } // isT31Site()

      function isAdminReportEnabledCheck(siteInfoJsonObj) {
        var funcName = "isAdminReportEnabledCheck()";
        var logMsg = "";

        var isAdminReportEnabled = false;

        if ("" === siteInfoJsonObj.errId) { // got a good response
          var siteInfoJson = siteInfoJsonObj.bodyJson;

          isAdminReportEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_commerceAndReporting.ns1_siteAdminReport
          ) ? true : false;
        }

        return isAdminReportEnabled;
      } // isAdminReportEnabledCheck()

      return deferredIsSiteSupportsIframe.promise;
    }; // siteFunctions()
  } // end top level function
})();
