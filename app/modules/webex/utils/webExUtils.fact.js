(function () {
  'use strict';

  angular.module('WebExUtils').factory('WebExUtilsFact', [
    '$log',
    'WebExXmlApiFact',
    function (
      $log,
      WebExXmlApiFact
    ) {

      return {
        validateXmlData: function (
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
        }, // validateXmlData()

        validateUserInfoXmlData: function (userInfoXml) {
          var userInfo = this.validateXmlData(
            "User Data",
            userInfoXml,
            "<use:",
            "</serv:bodyContent>"
          );

          return userInfo;
        }, // validateUserInfoXmlData()

        validateSiteInfoXmlData: function (siteInfoXml) {
          var siteInfo = this.validateXmlData(
            "Site Info",
            siteInfoXml,
            "<ns1:",
            "</serv:bodyContent>"
          );

          return siteInfo;
        }, // validateSiteInfoXmlData()

        validateMeetingTypesInfoXmlData: function (meetingTypesInfoXml) {
          var meetingTypesInfo = this.validateXmlData(
            "Meeting Types Info",
            meetingTypesInfoXml,
            "<mtgtype:",
            "</serv:bodyContent>"
          );

          return meetingTypesInfo;
        }, // validateMeetingTypesInfoXmlData()

        validateSettingPagesInfoXmlData: function (settingPagesInfoXml) {
          return null;
        }, // validateSettingPagesInfoXmlData()

        getSiteName: function (siteUrl) {
          var index = siteUrl.indexOf(".");
          var siteName = siteUrl.slice(0, index);

          return siteName;
        }, //getSiteName()
      };
    }
  ]);
})();
