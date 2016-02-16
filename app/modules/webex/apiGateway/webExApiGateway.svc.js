'use strict';

angular.module('WebExApp').service('WebExApiGatewayService', [
  '$rootScope',
  '$q',
  '$log',
  'Authinfo',
  'WebExUtilsFact',
  'WebExXmlApiFact',
  'WebExXmlApiInfoSvc',
  function (
    $rootScope,
    $q,
    $log,
    Authinfo,
    WebExUtilsFact,
    WebExXmlApiFact,
    webExXmlApiInfoObj
  ) {

    this.csvStatus = function (siteUrl) {
      var funcName = 'csvStatus()';
      var logMsg = '';

      logMsg = funcName + '\n' +
        'siteUrl=' + siteUrl;
      $log.log(logMsg);

      // the code below is just a mock call to an existing webex api
      // this will be replaced with call to the real webex api once it is available
      var dummyResult = {
        siteUrl: siteUrl,
        result: 'success',
        status: ''
      };

      return $q.when(dummyResult);
      /*
      return WebExXmlApiFact.getSessionTicket(siteUrl)
        .then(
          function dummySuccess(response) {
            var dummyResult = null;

            if (null == response) {
              dummyResult = {
                siteUrl: siteUrl,
                result: 'failed',
                code: response
              };

              $q.reject(result);
            }

            dummyResult = {
              siteUrl: siteUrl,
              result: 'success',
              status: response
            };

            return result;
          } // dummySuccess()
        ) // WebExXmlApiFact.getSessionTicket().then()
        .catch(
          function dummyCatch(error) {
            var dummyResult = {
              siteUrl: siteUrl,
              result: 'error',
              code: error
            };

            $q.reject(result);
          } // dummyCatch()
        ); // WebExXmlApiFact.getSessionTicket().catch()
        */
    }; // csvStatus()

    this.csvExport = function (siteUrl) {
      var funcName = "csvExport()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      $log.log(logMsg);

    }; // csvExport()

    this.csvImport = function (siteUrl) {
      var funcName = "csvImport()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      $log.log(logMsg);

    }; // csvImport()

    this.csvFileDownload = function (siteUrl) {
      var funcName = "csvFileDownload()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      $log.log(logMsg);

    }; // csvFileDownload()

    this.isSiteSupportsIframe = function (siteUrl) {
      var deferredIsSiteSupportsIframe = $q.defer();

      WebExXmlApiFact.getSessionTicket(siteUrl).then(
        function getSessionTicketSuccess(response) {
          $log.log("getSessionTicketSuccess(): siteUrl=" + siteUrl);

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

                logMsg = funcName + ": " + "\n" +
                  "siteUrl=" + siteUrl + "\n" +
                  "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
                // $log.log(logMsg);

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

                    logMsg = funcName + ": " + "\n" +
                      "siteUrl=" + siteUrl + "\n" +
                      "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
                    // $log.log(logMsg);

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

                    logMsg = funcName + ": " + "\n" +
                      "siteUrl=" + siteUrl + "\n" +
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

              logMsg = funcName + ": " + "\n" +
                "siteUrl=" + siteUrl + "\n" +
                "isSiteSupportsIframeResult=" + JSON.stringify(isSiteSupportsIframeResult);
              $log.log(logMsg);

              deferredIsSiteSupportsIframe.reject(isSiteSupportsIframeResult);
            } // getSiteDataError()
          ); // getSiteData().then
        }, // getSessionTicketSuccess()

        function getSessionTicketError(response) {
          var funcName = "getSessionTicketError()";
          var logMsg = "";

          var result = {
            siteUrl: siteUrl,
            error: "getSessionTicketError",
            response: response
          };

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "result=" + JSON.stringify(result);
          $log.log(logMsg);

          deferredIsSiteSupportsIframe.reject(result);
        } // getSessionTicketError()
      ); // getSessionTicket(siteUrl).then()

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

        logMsg = funcName + ": " + "\n" +
          "siteUrl=" + siteUrl + "\n" +
          "trainReleaseOrder=" + trainReleaseOrder + "\n" +
          "isT31IframeSupported=" + isT31IframeSupported;
        $log.log(logMsg);

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

        logMsg = funcName + ": " + "\n" +
          "siteUrl=" + siteUrl + "\n" +
          "enableT30UnifiedAdmin=" + enableT30UnifiedAdmin + "\n" +
          "isIframeSupported=" + isT30IframeSupported;
        $log.log(logMsg);

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
  } //end top level service function
]);
