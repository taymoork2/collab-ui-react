(function () {
  'use strict';

  angular.module('WebExUtils').factory('WebExUtilsFact', [
    '$q',
    '$log',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'Authinfo',
    function (
      $q,
      $log,
      WebExXmlApiFact,
      webExXmlApiInfoObj,
      Authinfo
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

        /*
        logMsg = funcName + ": " + "\n" +
          "commentText=" + commentText + "\n" +
          "infoXml=\n" + infoXml + "\n" +
          "startOfBodyStr=" + startOfBodyStr + "\n" +
          "endOfBodyStr=" + endOfBodyStr;
        $log.log(logMsg);
        */

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

      obj.validateSettingPagesInfoXmlData = function (settingPagesInfoXml) {
        return null;
      }; // validateSettingPagesInfoXmlData()

      obj.getSiteName = function (siteUrl) {
        var index = siteUrl.indexOf(".");
        var siteName = siteUrl.slice(0, index);

        return siteName;
      }; //getSiteName()

      obj.isSiteSupportsIframe = function (siteUrl) {
        var isIframe = false;
        var deferred = $q.defer();

        getSessionTicket().then(
          function getSessionTicketSuccess(sessionTicket) {
            $log.log("getSessionTicketSuccess()");

            webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
            webExXmlApiInfoObj.webexSiteName = obj.getSiteName(siteUrl);
            webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
            webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;

            getSiteVersionXml().then(
              function getSiteVersionInfoXmlSuccess(getInfoResult) {
                $log.log("getSiteVersionInfoXmlSuccess");

                isIframe = iframeSupportedSiteVersionCheck(getInfoResult);
                $log.log("Site [" + siteUrl + "], isIframe [" + isIframe + "]");

                deferred.resolve(isIframe);
              }, // getSiteVersionInfoXmlSuccess()

              function getSiteVersionInfoXmlError(getInfoResult) {
                $log.log("getSiteVersionInfoXmlError()");
                deferred.reject("getSiteVersionInfoXmlError");
              } // getSiteVersionInfoXmlError()
            ); // vm.getSessionTicket(siteUrl).then()
          }, // getSessionTicketSuccess()

          function getSessionTicketError(errId) {
            $log.log("getSessionTicketError");
            deferred.reject("getSessionTicketError");

          } // getSessionTicketError()
        ); // vm.getSessionTicket(siteUrl).then()

        function getSessionTicket() {
          return WebExXmlApiFact.getSessionTicket(siteUrl);
        } // getSessionTicket()

        function getSiteVersionXml() {
          var siteVersionXml = WebExXmlApiFact.getSiteVersion(webExXmlApiInfoObj);

          return $q.all({
            siteVersionXml: siteVersionXml
          });
        } // getSiteVersionXml()

        function iframeSupportedSiteVersionCheck(getInfoResult) {
          var funcName = "iframeSupportedSiteVersionCheck";
          var iframeSupportedSiteVersion = false;

          var siteVersionJsonObj = obj.validateSiteVersionXmlData(getInfoResult.siteVersionXml);

          if ("" === siteVersionJsonObj.errId) { // got a good response
            var siteVersionJson = siteVersionJsonObj.bodyJson;
            var trainReleaseVersion = siteVersionJson.ep_trainReleaseVersion;
            var trainReleaseOrder = siteVersionJson.ep_trainReleaseOrder;

            var logMsg = funcName + ": " + "\n" +
              "trainReleaseVersion=" + trainReleaseVersion + "\n" +
              "trainReleaseOrder=" + trainReleaseOrder;
            $log.log(logMsg);

            if ((null != trainReleaseOrder) && (400 <= +trainReleaseOrder)) {
              iframeSupportedSiteVersion = true;
            }
          }

          $log.log(funcName + ": iframeSupportedSiteVersion=" + iframeSupportedSiteVersion);

          return iframeSupportedSiteVersion;
        } // iframeSupportedSiteVersionCheck()

        return deferred.promise;
      };
      return obj;
    }
  ]);
})();
