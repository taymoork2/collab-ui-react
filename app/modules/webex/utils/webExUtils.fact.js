(function () {
  'use strict';

  angular.module('WebExUtils').factory('WebExUtilsFact', [
    '$q',
    '$log',
    'Authinfo',
    'Orgservice',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    function (
      $q,
      $log,
      Authinfo,
      Orgservice,
      WebExXmlApiFact,
      webExXmlApiInfoObj
    ) {
      var obj = {};

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

      obj.getSiteName = function (siteUrl) {
        var index = siteUrl.indexOf(".");
        var siteName = siteUrl.slice(0, index);

        return siteName;
      }; // getSiteName()

      obj.getSiteVersion = function (siteVersionJsonObj) {
        var funcName = "getSiteVersion()";
        var logMsg = "";

        var siteVersionJson = null;
        var trainReleaseJson = {
          trainReleaseVersion: null,
          trainReleaseOrder: null
        };

        var trainReleaseVersion = null;
        var trainReleaseOrder = null;

        if ("" === siteVersionJsonObj.errId) { // got a good response
          siteVersionJson = siteVersionJsonObj.bodyJson;
          trainReleaseJson.trainReleaseVersion = siteVersionJson.ep_trainReleaseVersion;
          trainReleaseJson.trainReleaseOrder = siteVersionJson.ep_trainReleaseOrder;

          logMsg = funcName + ": " + "\n" +
            "trainReleaseVersion=" + trainReleaseVersion + "\n" +
            "trainReleaseOrder=" + trainReleaseOrder;
          $log.log(logMsg);
        }

        return trainReleaseJson;
      }; // getSiteVersion()

      obj.getWebexLicenseInfo = function (siteUrl) {
        var deferredGetWebexLicenseInfo = $q.defer();

        Orgservice.getValidLicenses().then(
          function getValidLicensesSuccess(licenses) {
            var funcName = "getValidLicensesSuccess()";
            var logMsg = "";

            logMsg = funcName + ": " + "\n" +
              "licenses=" + JSON.stringify(licenses);
            $log.log(logMsg);

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

      obj.isSiteSupportsIframe = function (siteUrl) {
        var deferredIsSiteSupportsIframe = $q.defer();

        getSessionTicket().then(
          function getSessionTicketSuccess(response) {
            $log.log("getSessionTicketSuccess(): siteUrl=" + siteUrl);

            webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
            webExXmlApiInfoObj.webexSiteName = obj.getSiteName(siteUrl);
            webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
            webExXmlApiInfoObj.webexAdminSessionTicket = response;

            getSiteData().then(
              function getSiteDataSuccess(response) {
                var funcName = "getSiteDataSuccess()";
                var logMsg = "";

                var result = {
                  siteUrl: siteUrl,
                  isIframeSupported: iframeSupportedSiteVersionCheck(response),
                  isAdminReportEnabled: isAdminReportEnabledCheck(response)
                };

                logMsg = funcName + ": " + "\n" +
                  "siteUrl=" + siteUrl + "\n" +
                  "result=" + JSON.stringify(result);
                $log.log(logMsg);

                deferredIsSiteSupportsIframe.resolve(result);
              }, // getSiteDataSuccess()

              function getSiteDataError(response) {
                var funcName = "getSiteDataError()";
                var logMsg = "";

                var result = {
                  siteUrl: siteUrl,
                  error: "getSiteDataError",
                  response: response
                };

                logMsg = funcName + ": " + "\n" +
                  "siteUrl=" + siteUrl + "\n" +
                  "result=" + JSON.stringify(result);
                $log.log(logMsg);

                deferredIsSiteSupportsIframe.reject(result);
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

        function iframeSupportedSiteVersionCheck(getInfoResult) {
          var funcName = "iframeSupportedSiteVersionCheck()";
          var logMsg = "";

          var siteVersionJsonObj = obj.validateSiteVersionXmlData(getInfoResult.siteVersionXml);
          var trainReleaseJsonObj = obj.getSiteVersion(siteVersionJsonObj);

          var trainReleaseVersion = trainReleaseJsonObj.trainReleaseVersion;
          var trainReleaseOrder = trainReleaseJsonObj.trainReleaseOrder;
          var iframeSupportedSiteVersion = (
            (null != trainReleaseOrder) &&
            (400 <= +trainReleaseOrder)
          ) ? true : false;

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "trainReleaseVersion=" + trainReleaseVersion + "\n" +
            "trainReleaseOrder=" + trainReleaseOrder + "\n" +
            "iframeSupportedSiteVersion=" + iframeSupportedSiteVersion;
          $log.log(logMsg);

          return iframeSupportedSiteVersion;
        } // iframeSupportedSiteVersionCheck()

        function isAdminReportEnabledCheck(getInfoResult) {
          var isAdminReportEnabled = false;
          var siteInfoJsonObj = obj.validateSiteInfoXmlData(getInfoResult.siteInfoXml);

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

      return obj;
    }
  ]);
})();
