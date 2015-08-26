(function () {
  'use strict';

  angular.module('WebExSiteSettings').factory('WebExSiteSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'Authinfo',
    'Notification',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'WebexSiteSettingsSvc',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      Authinfo,
      Notification,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfo,
      webExSiteSettingsModel
    ) {
      return {
        getSiteSettingsModel: function () {
          return webExSiteSettingsModel;
        }, // getSiteSettingsModel

        initSiteSettingsModel: function () {
          var _self = this;

          var siteUrl = (!$stateParams.site) ? '' : $stateParams.site;
          webExSiteSettingsModel.siteUrl = siteUrl;

          var siteName = siteUrl.slice(0, siteUrl.indexof("."));
          webExSiteSettingsModel.siteName = siteName;

          _self.getSessionTicket(siteUrl).then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
              var logMsg = "";

              _self.initXmlApiInfo(
                siteUrl,
                siteName,
                sessionTicket
              );

              webExSiteSettingsModel.sessionTicketError = false;
              _self.getSiteSettingPagesInfo();
            }, // getSessionTicketSuccess()

            function getSessionTicketError(errId) {
              var funcName = "initSiteSettingsModel().getSessionTicketError()";
              var logMsg = "";

              logMsg = funcName + ": " + "errId=" + errId;
              $log.log(logMsg);
            } // getSessionTicketError()
          ); // getSessionTicket(siteUrl).then()

          return webExSiteSettingsModel;
        }, // initSiteSettingsModel()

        getSessionTicket: function (webexSiteUrl) {
          return WebExXmlApiFact.getSessionTicket(webexSiteUrl);
        }, //getSessionTicket()

        initXmlApiInfo: function (
          siteUrl,
          siteName,
          sessionTicket
        ) {
          webExXmlApiInfo.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfo.webexSiteName = siteName;
          webExXmlApiInfo.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfo.webexAdminSessionTicket = sessionTicket;
        }, // initXmlApiInfo()

        getSiteSettingPagesInfo: function () {
          var funcName = "getSiteSettingPagesInfo()";
          var logMsg = "";

          $log.log(funcName);

          var _self = this;

          _self.getSiteSettingPagesInfoXml().then(
            function getSiteSettingPagesInfoXmlSuccess(getInfoResult) {
              var funcName = "getSiteSettingPagesInfoXmlSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);

              webExSiteSettingsModel.siteInfo = WebExUtilsFact.validateXmlData(
                "Site Info",
                getInfoResult.siteInfoXml,
                "<ns1:",
                "</serv:bodyContent>"
              );

              webExSiteSettingsModel.meetingTypesInfo = WebExUtilsFact.validateXmlData(
                "Meething Types Info",
                getInfoResult.meetingTypesInfoXml,
                "<mtgtype:",
                "</serv:bodyContent>"
              );

              webExSiteSettingsModel.viewReady = true;
            }, // getSiteSettingPagesInfoXmlSuccess()

            function getSiteSettingPagesInfoXmlError(getInfoResult) {
              var funcName = "getSiteSettingPagesInfoXml()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);
            } // getSiteSettingPagesInfoXmlError()
          ); // getSettingPagesInfoXml().then()
        }, // getSiteSettingPagesInfo()

        getSiteSettingPagesInfoXml: function () {
          var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfo);
          var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfo);

          return $q.all({
            siteInfoXml: siteInfoXml,
            meetingTypesInfoXml: meetingTypesInfoXml
          });
        },

        /*
        validateXmlData: function (
          commentText,
          infoXml,
          startOfBodyStr,
          endOfBodyStr
        ) {
          var funcName = "validateXmlData()";
          var logMsg = "";
                
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
        */
      }; // return
    } // function()
  ]);
})();
