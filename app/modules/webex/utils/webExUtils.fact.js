(function () {
  'use strict';

  angular.module('WebExUtils').factory('WebExUtilsFact', [
    '$q',
    '$log',
    '$rootScope',
    '$http',
    '$timeout',
    'Authinfo',
    'Orgservice',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    function webexUtilsFact(
      $q,
      $log,
      $rootScope,
      $http,
      $timeout,
      Authinfo,
      Orgservice,
      WebExXmlApiFact,
      webExXmlApiInfoObj
    ) {
      var obj = {};

      obj.getSiteName = function (siteUrl) {
        var index = siteUrl.indexOf(".");
        var siteName = siteUrl.slice(0, index);

        return siteName;
      }; // getSiteName()

      obj.getNewInfoCardObj = function (
        label,
        iconClass1,
        iconClass2
      ) {

        var infoCardObj = {
          id: "SiteInfo",
          label: label,
          isLicensesOverage: false,

          licensesTotal: {
            id: "licensesTotal",
            count: "---"
          },

          licensesUsage: {
            id: "licensesUsage",
            count: "---"
          },

          licensesAvailable: {
            id: "licensesAvailable",
            count: "---"
          },

          iframeLinkObj1: {
            iconClass: iconClass1,
            iframePageObj: null,
          },

          iframeLinkObj2: {
            iconClass: iconClass2,
            iframePageObj: null,
          },
        };

        return infoCardObj;

      }; // getNewInfoObj()

      obj.validateXmlData = function (
        commentText,
        infoXml,
        startOfBodyStr,
        endOfBodyStr
      ) {
        var funcName = "validateXmlData()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "commentText=" + commentText + "\n" +
          "infoXml=\n" + infoXml + "\n" +
          "startOfBodyStr=" + startOfBodyStr + "\n" +
          "endOfBodyStr=" + endOfBodyStr;
        // $log.log(logMsg);

        var headerJson = WebExXmlApiFact.xml2JsonConvert(
          commentText + " Header",
          infoXml,
          "<serv:header>",
          "<serv:body>"
        ).body;

        var bodyJson = {};
        if ((null != startOfBodyStr) && (null != endOfBodyStr)) {
          bodyJson = WebExXmlApiFact.xml2JsonConvert(
            commentText,
            infoXml,
            startOfBodyStr,
            endOfBodyStr
          ).body;
        }

        var errReason = "";
        var errId = "";
        if ("SUCCESS" != headerJson.serv_header.serv_response.serv_result) {
          errReason = headerJson.serv_header.serv_response.serv_reason;
          errId = headerJson.serv_header.serv_response.serv_exceptionID;

          logMsg = funcName + ": " + "ERROR!!!" + "\n" +
            "headerJson=\n" + JSON.stringify(headerJson) + "\n" +
            "errReason=\n" + errReason;
          $log.log(logMsg);
        }

        var result = {
          headerJson: headerJson,
          bodyJson: bodyJson,
          errId: errId,
          errReason: errReason
        };

        return result;
      }; // validateXmlData()

      obj.validateSiteVersionXmlData = function (siteVersionXml) {
        var siteVersion = this.validateXmlData(
          "Site Version",
          siteVersionXml,
          "<ep:",
          "</serv:bodyContent>"
        );

        return siteVersion;
      }; // validateSiteVersionXmlData()

      obj.validate = function (enableT30UnifiedAdminInfoXml) {

      }; // 

      obj.validateUserInfoXmlData = function (userInfoXml) {
        var userInfo = this.validateXmlData(
          "User Data",
          userInfoXml,
          "<use:",
          "</serv:bodyContent>"
        );

        return userInfo;
      }; // validateUserInfoXmlData()

      obj.validateSiteInfoXmlData = function (siteInfoXml) {
        var siteInfo = this.validateXmlData(
          "Site Info",
          siteInfoXml,
          "<ns1:",
          "</serv:bodyContent>"
        );

        return siteInfo;
      }; // validateSiteInfoXmlData()

      obj.validateMeetingTypesInfoXmlData = function (meetingTypesInfoXml) {
        var meetingTypesInfo = this.validateXmlData(
          "Meeting Types Info",
          meetingTypesInfoXml,
          "<mtgtype:",
          "</serv:bodyContent>"
        );

        return meetingTypesInfo;
      }; // validateMeetingTypesInfoXmlData()

      obj.validateAdminPagesInfoXmlData = function (adminPagesInfoXml) {
        var adminPagesInfo = this.validateXmlData(
          "Admin Pages Info",
          adminPagesInfoXml,
          "<ns1:",
          "</serv:bodyContent>"
        );

        return adminPagesInfo;
      }; // validateAdminPagesInfoXmlData()

      obj.getSiteVersion = function (siteVersionJsonObj) {
        var funcName = "getSiteVersion()";
        var logMsg = "";

        var trainReleaseJson = {
          trainReleaseVersion: null,
          trainReleaseOrder: null
        };

        var trainReleaseVersion = null;
        var trainReleaseOrder = null;

        if ("" === siteVersionJsonObj.errId) { // got a good response
          var siteVersionJson = siteVersionJsonObj.bodyJson;

          trainReleaseJson.trainReleaseVersion = siteVersionJson.ep_trainReleaseVersion;
          trainReleaseJson.trainReleaseOrder = siteVersionJson.ep_trainReleaseOrder;
        }

        return trainReleaseJson;
      }; // getSiteVersion()

      obj.getEnableT30UnifiedAdmin = function (enableT30UnifiedAdminJsonObj) {
        var funcName = "getEnableT30UnifiedAdmin()";
        var logMsg = "";

        var enableT30UnifiedAdmin = null;

        if ("" === enableT30UnifiedAdminJsonObj.errId) { // got a good response
          enableT30UnifiedAdmin = enableT30UnifiedAdminJsonObj.bodyJson.ns1_enableT30UnifiedAdmin;
        }

        return enableT30UnifiedAdmin;
      }; // getEnableT30UnifiedAdmin()

      obj.getWebexLicenseInfo = function (siteUrl) {
        var deferredGetWebexLicenseInfo = $q.defer();

        Orgservice.getValidLicenses().then(
          function getValidLicensesSuccess(licenses) {
            var funcName = "getValidLicensesSuccess()";
            var logMsg = "";

            logMsg = funcName + ": " + "\n" +
              "licenses=" + JSON.stringify(licenses);
            // $log.log(logMsg);

            var licenseInfo = null;

            licenses.forEach(
              function checkLicense(license) {
                logMsg = funcName + ": " + "\n" +
                  "license=" + JSON.stringify(license);
                // $log.log(logMsg);

                if (
                  ("CONFERENCING" == license.licenseType) &&
                  (0 <= license.licenseId.indexOf(siteUrl))
                ) {

                  var licenseVolume = license.volume;
                  var licenseUsage = license.usage;
                  var licensesAvailable = licenseVolume - licenseUsage;

                  licenseInfo = {
                    volume: licenseVolume,
                    usage: licenseUsage,
                    available: licensesAvailable
                  };

                  deferredGetWebexLicenseInfo.resolve(licenseInfo);
                }
              } // checkLicense()
            ); // licenses.forEach()

            deferredGetWebexLicenseInfo.reject(licenseInfo);
          }, // getValidLicensesSuccess()

          function getValidLicensesError(info) {
            var funcName = "getValidLicensesError()";
            var logMsg = "";

            logMsg = funcName + ": " + "\n" +
              "info=" + JSON.stringify(info);
            $log.log(logMsg);

            deferredGetWebexLicenseInfo.reject(info);
          } // getValidLicensesError()
        ); // Orgservice.getValidLicenses().then()

        return deferredGetWebexLicenseInfo.promise;
      }; // getWebexLicenseInfo()

      obj.setInfoCardLicenseInfo = function (
        licenseInfo,
        infoCardObj
      ) {

        infoCardObj.licensesTotal.count = licenseInfo.volume;
        infoCardObj.licensesUsage.count = licenseInfo.usage;
        infoCardObj.licensesAvailable.count = licenseInfo.available;

        if (0 <= licenseInfo.available) {
          infoCardObj.licensesAvailable.count = licenseInfo.available;
        } else {
          infoCardObj.isLicensesOverage = true;
          infoCardObj.licensesAvailable.count = licenseInfo.available * -1;
        }
      }; // setInfoCardLicenseInfo();

      obj.isSiteSupportsIframe = function (siteUrl) {
        var deferredIsSiteSupportsIframe = $q.defer();

        getSessionTicket().then(
          function getSessionTicketSuccess(response) {
            $log.log("getSessionTicketSuccess(): siteUrl=" + siteUrl);

            webExXmlApiInfoObj.xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";
            webExXmlApiInfoObj.webexSiteName = obj.getSiteName(siteUrl);
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

                siteVersionJsonObj = obj.validateSiteVersionXmlData(response.siteVersionXml);
                isAdminReportEnabled = isAdminReportEnabledCheck(obj.validateSiteInfoXmlData(response.siteInfoXml));
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

                      enableT30UnifiedAdminJsonObj = obj.validateAdminPagesInfoXmlData(response.enableT30UnifiedAdminInfoXml);
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

        function getSessionTicket() {
          return WebExXmlApiFact.getSessionTicket(siteUrl);
        } // getSessionTicket()

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

          var trainReleaseOrder = obj.getSiteVersion(siteVersionJsonObj).trainReleaseOrder;
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

          var enableT30UnifiedAdmin = obj.getEnableT30UnifiedAdmin(enableT30UnifiedAdminJsonObj);
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

      obj.logoutSite = function () {
        var siteUrl = $rootScope.lastSite;

        var promise;
        if (!angular.isDefined(siteUrl)) {
          $log.log('No WebEx site visited.');
          var deferred = $q.defer();
          deferred.resolve('OK');
          promise = deferred.promise;
        } else {
          var siteName = obj.getSiteName(siteUrl);

          var logoutUrl = "https://" + $rootScope.nginxHost + "/wbxadmin/clearcookie.do?proxyfrom=atlas&siteurl=" + siteName;
          $log.log('Logout from WebEx site ' + siteName + ", " + logoutUrl);

          var jqpromise = $.ajax({
            type: 'POST',
            url: logoutUrl,
            data: $.param({
              ngxsiteurl: siteUrl
            }),
            xhrFields: {
              withCredentials: true
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 250
          });
          promise = $q.when(jqpromise); //convert into angularjs promise
        }
        return promise;
      };

      return obj;
    } // webexUtilsFact()
  ]);
})();
