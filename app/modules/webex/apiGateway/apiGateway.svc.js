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

  function (
    $rootScope,
    $q,
    $log,
    Authinfo,
    Storage,
    WebExUtilsFact,
    WebExXmlApiFact,
    webExXmlApiInfoObj,
    WebExRestApiFact
  ) {

    var _this = this;

    this.csvConstructHttpsObj = function (
      siteUrl,
      csvApi
    ) {

      var apiUrl = 'https://' + siteUrl + '/meetingsapi/v1/users/';
      var httpsObj = null;

      if (csvApi == "csvStatus") {
        httpsObj = {
          url: apiUrl + 'importexportstatus',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': 'Bearer ' + Storage.get('accessToken')
          }
        };
      } else if (csvApi == "csvExport") {
        httpsObj = {
          url: apiUrl + 'export',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': 'Bearer ' + Storage.get('accessToken')
          }
        };
      } else if (csvApi == "csvImport") {
        httpsObj = {
          url: apiUrl + 'import',
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data;charset=utf-8"',
            'Authorization': 'Bearer ' + Storage.get('accessToken')
          }
        };
      }

      return httpsObj;
    }; // csvConstructHttpsObj()

    this.csvStatus = function (
      siteUrl,
      mockCsvStatusReq
    ) {

      var funcName = 'csvStatus()';
      var logMsg = '';

      var mockCsvStatus = (
        null != mockCsvStatusReq
      ) ? true : false;

      var csvHttpsObj = _this.csvConstructHttpsObj(siteUrl, "csvStatus");

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockCsvStatus=" + mockCsvStatus + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      $log.log(logMsg);

      var successResult = {
        siteUrl: siteUrl,
        isMockResult: mockCsvStatus,
        status: null, // can be any one of WebExApiGatewayConstsService.csvStatusTypes[]
        details: null
      };

      var errorResult = {
        siteUrl: siteUrl,
        isMockResult: mockCsvStatus,
        status: 'error',
        errorId: null,
        errorDesc: null,
        details: null
      };

      var deferredCsvStatus = $q.defer();

      WebExRestApiFact.csvApiRequest(
        mockCsvStatus,
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

          // TODO: update successResult appropriately

          var csvJobType = response.jobType;
          var csvJobStatus = response.request;

          switch (csvJobType) {
          case 0:
            successResult.status = 'none';
            break;

          case 1:
            switch (csvJobStatus) {
            case 0:
            case 1:
            case 3:
              successResult.status = 'importInProgress';
              break;

            case 2:
              successResult.status = (response.failedRecords === 0) ? 'importCompletedNoErr' : 'importCompletedWithErr';
              break;

            default:
              // TODO: handle error
              break;
            }

            break;

          case 2:
            switch (csvJobStatus) {
            case 0:
            case 1:
            case 3:
              successResult.status = 'exportInProgress';
              break;

            case 2:
              successResult.status = (response.failedRecords === 0) ? 'exportCompletedNoErr' : 'exportCompletedWithErr';
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

          deferredCsvStatus.resolve(successResult);
        },

        function error(response) {
          var funcName = "WebExRestApiFact.csvStatusReq.error()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          deferredCsvStatus.reject(errorResult);
        }
      );

      return deferredCsvStatus.promise;
    }; // csvStatus()

    this.csvExport = function (siteUrl) {
      var funcName = 'csvExport()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl;
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

      var mockCsvStatus = true;
      var csvHttpsObj = _this.csvConstructHttpsObj(siteUrl, "csvExport");

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockCsvStatus=" + mockCsvStatus + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      $log.log(logMsg);

      return WebExRestApiFact.csvApiRequest(
        mockCsvStatus,
        csvHttpsObj
      ).then(

        function success(response) {
          $q.resolve(successResult);
        },

        function error(response) {
          $q.reject(errorResult);
        }

      ).catch(

        function catchError(response) {
          $q.reject(errorResult);
        }

      ); // WebExRestApiFact.csvExportReq()
    }; // csvExport()

    this.csvImport = function (
      siteUrl,
      csvFile
    ) {

      var funcName = 'csvImport()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + '\n' +
        'csvFile=' + csvFile;
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

      var mockCsvStatus = true;
      var csvHttpsObj = _this.csvConstructHttpsObj(siteUrl, "csvImport");

      // TODO: add the content of csv file to csvHttpsObj

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        "mockCsvStatus=" + mockCsvStatus + "\n" +
        "csvHttpsObj=" + JSON.stringify(csvHttpsObj);
      $log.log(logMsg);

      return WebExRestApiFact.csvApiRequest(
        mockCsvStatus,
        csvHttpsObj
      ).then(

        function success(response) {
          $q.resolve(successResult);
        },

        function error(response) {
          $q.reject(errorResult);
        }

      ).catch(

        function catchError(response) {
          $q.reject(errorResult);
        }

      ); // WebExRestApiFact.csvExportReq()
    }; // csvImport()

    this.csvFileDownload = function (
      siteUrl,
      downloadUrl
    ) {
      var funcName = 'csvFileDownload()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + '\n' +
        'downloadUrl=' + downloadUrl;
      $log.log(logMsg);
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
