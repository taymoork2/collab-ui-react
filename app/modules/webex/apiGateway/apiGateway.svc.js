'use strict';

angular.module('WebExApp').service('WebExApiGatewayService', [
  '$rootScope',
  '$q',
  '$log',
  'Authinfo',
  'Storage',
  'WebExUtilsFact',
  'WebExXmlApiFact',
  'WebExXmlApiInfoSvc',
  'WebExRestApiFact',
  'WebExApiGatewayConstsService',

  function (
    $rootScope,
    $q,
    $log,
    Authinfo,
    Storage,
    WebExUtilsFact,
    WebExXmlApiFact,
    webExXmlApiInfoObj,
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

      WebExApiGatewayConstsService.csvAPIs.forEach(
        function checkAPI(csvAPI) {

          if (csvApi == csvAPI.request) {

            csvUrl = 'https://' + siteUrl + '/meetingsapi/v1/users/' + csvAPI.api;

            var accessToken = Storage.get('accessToken');

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
          $log.log(logMsg);

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

      var funcName = 'csvExport()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl;
      $log.log(logMsg);

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvExport
      );

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockFlag=" + mockFlag + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      $log.log(logMsg);

      var successResult = {
        'siteUrl': siteUrl,
        'status': 'success'
      };

      var errorResult = {
        'siteUrl': siteUrl,
        'status:': "error",
        'errorCode': null,
        'errorText': null
      };

      var deferredResponse = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        null,
        csvHttpsObj
      ).then(

        function success(response) {
          var funcName = "WebExRestApiFact.csvApiRequest.success()";
          var logMsg = "";

          $log.log(funcName);

          deferredResponse.resolve(successResult);
        },

        function error(response) {
          var funcName = "WebExRestApiFact.csvApiRequest.error()";
          var logMsg = "";

          $log.log(funcName);

          deferredResponse.reject(errorResult);
        }

      ).catch(

        function catchError(response) {
          var funcName = "WebExRestApiFact.csvApiRequest.catchError()";
          var logMsg = "";

          $log.log(funcName);

          deferredResponse.reject(errorResult);
        }

      ); // WebExRestApiFact.csvExportReq()

      return deferredResponse.promise;
    }; // csvExport()

    this.csvImport = function (
      vm
    ) {

      var funcName = 'csvImport()';
      var logMsg = '';

      var siteUrl = vm.siteUrl;
      var mockFlag = vm.csvImportObj.csvMock.mockImport;
      var csvFile = vm.modal.file;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + '\n' +
        'mockFlag=' + mockFlag;
      // $log.log(logMsg);

      var successResult = {
        'siteUrl': siteUrl,
        'status': 'success'
      };

      var errorResult = {
        'siteUrl': siteUrl,
        'status:': "error",
        'errorCode': null,
        'errorText': null
      };

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvImport
      );

      csvHttpsObj.data.file = csvFile;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      $log.log(logMsg);

      var deferredResponse = $q.defer();
      var mockFlag = false;

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        null,
        csvHttpsObj
      ).then(

        function success(response) {
          deferredResponse.resolve(successResult);
        },

        function error(response) {
          deferredResponse.reject(errorResult);
        }

      ).catch(

        function catchError(response) {
          deferredResponse.reject(errorResult);
        }

      ); // WebExRestApiFact.csvExportReq()

      return deferredResponse.promise;
    }; // csvImport()

    this.csvFileDownload = function (
      siteUrl,
      downloadUrl,
      mockFlag
    ) {
      var funcName = 'csvFileDownload()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + '\n' +
        'downloadUrl=' + downloadUrl + "\n" +
        'mockFlag=' + mockFlag;
      // $log.log(logMsg);

      var successResult = {
        'siteUrl': siteUrl,
        'status': 'success'
      };

      var errorResult = {
        'siteUrl': siteUrl,
        'status:': "error",
        'errorCode': null,
        'errorText': null
      };

      var csvHttpsObj = _this.csvConstructHttpsObj(
        siteUrl,
        WebExApiGatewayConstsService.csvRequests.csvFileDownload
      );

      csvHttpsObj.url = downloadUrl;

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockFlag=" + mockFlag + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      $log.log(logMsg);

      var deferredResponse = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockFlag,
        null,
        csvHttpsObj
      ).then(

        function success(response) {
          deferredResponse.resolve(successResult);
        },

        function error(response) {
          deferredResponse.reject(errorResult);
        }

      ).catch(

        function catchError(response) {
          deferredResponse.reject(errorResult);
        }

      ); // WebExRestApiFact.csvExportReq()

      return deferredResponse.promise;
    }; // csvFileDownload()

    this.isSiteSupportsIframe = function (siteUrl) {
      var funcName = "isSiteSupportsIframe()";
      var logMsg = "";

      var deferredIsSiteSupportsIframe = $q.defer();
      var siteName = WebExUtilsFact.getSiteName(siteUrl);

      logMsg = funcName + ": " + "siteUrl=" + siteUrl;
      // $log.log(logMsg);

      WebExXmlApiFact.getSessionTicket(siteUrl, siteName).then(
        function getSessionTicketSuccess(response) {
          webExXmlApiInfoObj.xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfoObj.webexSiteName = WebExUtilsFact.getSiteName(siteUrl);
          webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfoObj.webexAdminSessionTicket = response;

          var siteVersionJsonObj = null;
          var enableT30UnifiedAdminJsonObj = null;

          var isAdminReportEnabled = false;
          var isT31IframeSupported = false;
          var isT30IframeSupported = false;

          getSiteData().then(
            function getSiteDataSuccess(response) {
              var funcName = "getSiteDataSuccess()";
              var logMsg = "";

              siteVersionJsonObj = WebExUtilsFact.validateSiteVersionXmlData(response.siteVersionXml);
              isAdminReportEnabled = isAdminReportEnabledCheck(WebExUtilsFact.validateSiteInfoXmlData(response.siteInfoXml));
              isT31IframeSupported = isT31IframeSupportedCheck(siteVersionJsonObj);

              if (isT31IframeSupported) {
                var isSiteSupportsIframeResult = {
                  siteUrl: siteUrl,
                  isCSVSupported: true,
                  isIframeSupported: true,
                  isAdminReportEnabled: isAdminReportEnabled
                };

                logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
                  "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
                $log.log(logMsg);

                deferredIsSiteSupportsIframe.resolve(isSiteSupportsIframeResult);
              } else { // check iFrame support for T30 site
                getEnableT30UnifiedAdminData().then(
                  function getEnableT30UnifiedAdminDataSuccess(response) {
                    var funcName = "getEnableT30UnifiedAdminDataSuccess()";
                    var logMsg = "";

                    enableT30UnifiedAdminJsonObj = WebExUtilsFact.validateAdminPagesInfoXmlData(response.enableT30UnifiedAdminInfoXml);
                    isT30IframeSupported = isT30IframeSupportedCheck(
                      siteVersionJsonObj,
                      enableT30UnifiedAdminJsonObj
                    );

                    var isSiteSupportsIframeResult = {
                      siteUrl: siteUrl,
                      isCSVSupported: false,
                      isIframeSupported: isT30IframeSupported,
                      isAdminReportEnabled: isAdminReportEnabled
                    };

                    logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
                      "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
                    $log.log(logMsg);

                    deferredIsSiteSupportsIframe.resolve(isSiteSupportsIframeResult);
                  }, // getEnableT30UnifiedAdminDataSuccess()

                  function getEnableT30UnifiedAdminDataError(response) {
                    var funcName = "getEnableT30UnifiedAdminDataError()";
                    var logMsg = "";

                    var isSiteSupportsIframeResult = {
                      siteUrl: siteUrl,
                      error: "getEnableT30UnifiedAdminDataError",
                      response: response
                    };

                    logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
                      "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
                    $log.log(logMsg);

                    deferredIsSiteSupportsIframe.reject(isSiteSupportsIframeResult);
                  } // getEnableT30UnifiedAdminDataError()
                ); // getEnableT30UnifiedAdminData().then()
              } // check iFrame support for T30 site
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
        }, // isSiteSupportsIframe().getSessionTicketSuccess()

        function getSessionTicketError(response) {
          var funcName = "isSiteSupportsIframe().getSessionTicketError()";
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
        } // isSiteSupportsIframe().getSessionTicketError()
      ); // isSiteSupportsIframe().getSessionTicket(siteUrl).then()

      function getSiteData() {
        var siteVersionXml = WebExXmlApiFact.getSiteVersion(webExXmlApiInfoObj);
        var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);

        return $q.all({
          siteVersionXml: siteVersionXml,
          siteInfoXml: siteInfoXml
        });
      } // getSiteData()

      function getEnableT30UnifiedAdminData() {
        var enableT30UnifiedAdminInfoXml = WebExXmlApiFact.getEnableT30UnifiedAdminInfo(webExXmlApiInfoObj);

        return $q.all({
          enableT30UnifiedAdminInfoXml: enableT30UnifiedAdminInfoXml
        });
      } // getEnableT30UnifiedAdminData()

      function isT31IframeSupportedCheck(siteVersionJsonObj) {
        var funcName = "isT31IframeSupportedCheck()";
        var logMsg = "";

        var trainReleaseOrder = WebExUtilsFact.getSiteVersion(siteVersionJsonObj).trainReleaseOrder;
        var isT31IframeSupported = (
          (null != trainReleaseOrder) &&
          (400 <= +trainReleaseOrder)
        ) ? true : false;

        logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
          "trainReleaseOrder=" + trainReleaseOrder + "\n" +
          "isT31IframeSupported=" + isT31IframeSupported;
        // $log.log(logMsg);

        return isT31IframeSupported;
      } // isT31IframeSupportedCheck()

      function isT30IframeSupportedCheck(
        siteVersionJsonObj,
        enableT30UnifiedAdminJsonObj
      ) {
        var funcName = "isT30IframeSupportedCheck()";
        var logMsg = "";

        var enableT30UnifiedAdmin = WebExUtilsFact.getEnableT30UnifiedAdmin(enableT30UnifiedAdminJsonObj);
        var isT30IframeSupported = (
          (null != enableT30UnifiedAdmin) &&
          ("true" == enableT30UnifiedAdmin)
        ) ? true : false;

        logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
          "enableT30UnifiedAdmin=" + enableT30UnifiedAdmin + "\n" +
          "isIframeSupported=" + isT30IframeSupported;
        // $log.log(logMsg);

        return isT30IframeSupported;
      } // isT30IframeSupportedCheck()

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
    }; // isSiteSupportsIframe()
  } // end top level function
]);
