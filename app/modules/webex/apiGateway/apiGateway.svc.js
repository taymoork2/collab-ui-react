'use strict';

angular.module('WebExApp').service('WebExApiGatewayService', [
  '$rootScope',
  '$q',
  '$log',
  'Authinfo',
  'WebExUtilsFact',
  'WebExXmlApiFact',
  'WebExXmlApiInfoSvc',
  'WebExRestApiFact',

  function (
    $rootScope,
    $q,
    $log,
    Authinfo,
    WebExUtilsFact,
    WebExXmlApiFact,
    webExXmlApiInfoObj,
    WebExRestApiFact
  ) {

    var _this = this;

    this.csvStatusTypes = [
      'none',
      'exportInProgress',
      'exportCompletedNoErr',
      'exportCompletedWithErr',
      'importInProgress',
      'importCompletedNoErr',
      'importCompletedWithErr'
    ];

    this.csvStatus = function (
      siteUrl,
      checkCsvStatusReq
    ) {

      var funcName = 'csvStatus()';
      var logMsg = '';

      logMsg = funcName + ': ' + 'siteUrl=' + siteUrl + "\n" +
        'checkCsvStatusReq=' + checkCsvStatusReq;
      $log.log(logMsg);

      var completionDetails = null;

      var successResult = {
        siteUrl: siteUrl,
        isTestResult: false,
        status: 'none', // can be any one of this.csvStatusTypes
        completionDetails: null, // null unless status is exportCompleted or importCompleted
      };

      var errorResult = {
        siteUrl: siteUrl,
        isTestResult: false,
        status: 'error',
        errorId: null,
        errorDesc: null
      };

      var deferredCsvStatus = $q.defer();

      WebExRestApiFact.csvStatusReq(siteUrl).then(
        function success(response) {
          var funcName = "WebExRestApiFact.csvStatusReq.success()";
          var logMsg = "";

          if (null != checkCsvStatusReq) { // return a mock/test csv status if requested
            successResult.isTestResult = true;

            if ('none' == checkCsvStatusReq) {
              successResult.status = "none";

              deferredCsvStatus.resolve(successResult);
            }

            if ('exportInProgress' == checkCsvStatusReq) {
              successResult.status = "exportInProgress";

              deferredCsvStatus.resolve(successResult);
            }

            if ('exportCompletedNoErr' == checkCsvStatusReq) {
              completionDetails = {};

              successResult.status = "exportCompletedNoErr";
              successResult.completionDetails = completionDetails;

              deferredCsvStatus.resolve(successResult);
            }

            if ('exportCompletedWithErr' == checkCsvStatusReq) {
              completionDetails = {};

              successResult.status = "exportCompletedWithErr";
              successResult.completionDetails = completionDetails;

              deferredCsvStatus.resolve(successResult);
            }

            if ('importInProgress' == checkCsvStatusReq) {
              successResult.status = "importInProgress";

              deferredCsvStatus.resolve(successResult);
            }

            if ('importCompletedNoErr' == checkCsvStatusReq) {
              completionDetails = {};

              successResult.status = "importCompletedNoErr";
              successResult.completionDetails = completionDetails;

              deferredCsvStatus.resolve(successResult);
            }

            if ('importCompletedWithErr' == checkCsvStatusReq) {
              completionDetails = {};

              successResult.status = "importCompletedWithErr";
              successResult.completionDetails = completionDetails;

              deferredCsvStatus.resolve(successResult);
            }
          } // return a mock/test csv status if requested

          // TODO: if error response then return reject

          // TODO: update successResult appropriately
          deferredCsvStatus.resolve(successResult);
        },

        function error(response) {
          var funcName = "WebExRestApiFact.csvStatusReq.error()";
          var logMsg = "";

          deferredCsvStatus.reject(errorResult);
        }
      );

      return deferredCsvStatus.promise;
      /*
      return WebExRestApiFact.csvStatusReq(
        siteUrl
      ).then(
        function success(response) {
          var funcName = "WebExRestApiFact.csvStatusReq.success()";
          var logMsg = "";

          logMsg = funcName + ": " + "siteUrl=" + siteUrl + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          $q.resolve(result);
        } // csvStatusReqSuccess()
      ).catch(
        function errorCatch(result) {
          var funcName = "WebExRestApiFact.csvStatusReq.errorCatch()";
          var logMsg = "";

          $q.reject(result);
        } // restApiReqCatch()
      ); // return WebExRestApiFact.csvStatusReq()
      */
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

      return WebExRestApiFact.csvExportReq(siteUrl).then(
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

      return WebExRestApiFact.csvImportReq(
        siteUrl,
        csvFile
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
