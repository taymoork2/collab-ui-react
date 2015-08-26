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

        validateUserSettingsXmlData: function (userSettingsXmlData) {
          var userInfo = this.validateXmlData(
            "User Data",
            userSettingsXmlData,
            "<use:",
            "</serv:bodyContent>"
          );

          return userInfo;
        }, // validateUserSettingsXmlData()

        validateSiteSettingsXmlData: function (siteSettingsXmlData) {
          var siteInfo = this.validateXmlData(
            "Site Info",
            siteSettingsXmlData,
            "<ns1:",
            "</serv:bodyContent>"
          );

          return siteInfo;
        }, // validateSiteSettingsXmlData()

        validateMeetingTypesXmlData: function (meetingTypesXmlData) {
          var meetingTypesInfo = this.validateXmlData(
            "Meeting Types Info",
            meetingTypesXmlData,
            "<mtgtype:",
            "</serv:bodyContent>"
          );

          return meetingTypesInfo;
        },
      };
    }
  ]);
})();
