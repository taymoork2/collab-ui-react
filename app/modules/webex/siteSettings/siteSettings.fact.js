(function () {
  'use strict';

  angular.module('WebExSiteSettings').factory('WebExSiteSettingsFact', [
    '$scope',
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'WebExSiteSettingsSvc',
    'Notification',
    function (
      $scope,
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      Authinfo,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfoObj,
      webExSiteSettingsObj,
      Notification
    ) {
      return {
        getSiteSettingsObj: function () {
          return webExSiteSettingsObj;
        }, // getSiteSettingsObj

        initSiteSettingsObj: function () {
          var funcName = "initSiteSettingsObj()";
          var logMsg = funcName;

          var _this = this;

          var siteUrl = (!$stateParams.siteUrl) ? '' : $stateParams.siteUrl;
          var siteName = siteUrl.slice(0, siteUrl.indexOf("."));

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "; " +
            "siteName=" + siteName;
          $log.log(logMsg);
          
          webExSiteSettingsObj.siteUrl = siteUrl;
          webExSiteSettingsObj.siteName = siteName;

          _this.getSessionTicket(siteUrl).then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
              var logMsg = "";

              _this.initXmlApiInfo(
                siteUrl,
                siteName,
                sessionTicket
              );

              _this.getSiteSettingsInfo();
            }, // getSessionTicketSuccess()

            function getSessionTicketError(errId) {
              var funcName = "initSiteSettingsModel().getSessionTicketError()";
              var logMsg = "";

              logMsg = funcName + ": " + "errId=" + errId;
              $log.log(logMsg);
            } // getSessionTicketError()
          ); // _this.getSessionTicket().then()

          return webExSiteSettingsObj;
        }, // initSiteSettingsObj

        getSessionTicket: function (webexSiteUrl) {
          return WebExXmlApiFact.getSessionTicket(webexSiteUrl);
        }, //getSessionTicket()

        initXmlApiInfo: function (
          siteUrl,
          siteName,
          sessionTicket
        ) {
          webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfoObj.webexSiteName = siteName;
          webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;
        }, // initXmlApiInfo()

        getSiteSettingsInfo: function () {
          var funcName = "getSiteSettingsInfo()";
          var logMsg = "";

          $log.log(funcName);

          var _this = this;

          webExSiteSettingsObj.sessionTicketError = false;

          _this.getSiteSettingsInfoXml().then(
            function getSiteSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);

              webExSiteSettingsObj.siteInfo = WebExUtilsFact.validateSiteInfoXmlData(getInfoResult.siteInfoXml);
              webExSiteSettingsObj.meetingTypesInfo = WebExUtilsFact.validateMeetingTypesInfoXmlData(getInfoResult.meetingTypesInfoXml);
              webExSiteSettingsObj.settingPagesInfo = WebExUtilsFact.validateSettingPagesInfoXmlData(getInfoResult.settingPagesInfoXml);

              _this.processSiteInfo();
              _this.processMeetingTypesInfo();
              _this.processSettingPagesInfo();

              webExSiteSettingsObj.viewReady = true;
            }, // getSiteSettingsInfoXmlSuccess()

            function getSiteSettingsInfoXmlError(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);
            } // getSiteSettingsInfoXmlError()
          ); // _this.getSiteSettingsInfoXml().then()
        }, // getSiteSettingsInfo()

        processSiteInfo: function () {
          var siteInfoJson = webExSiteSettingsObj.siteInfo.bodyJson;
          var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          siteServiceTypes.forEach(
            function chkSiteServiceType(siteServiceType) {
              if (siteServiceType == webExSiteSettingsObj.meetingCenter.label) {
                webExSiteSettingsObj.meetingCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExSiteSettingsObj.eventCenter.label) {
                webExSiteSettingsObj.eventCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExSiteSettingsObj.trainingCenter.label) {
                webExSiteSettingsObj.trainingCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExSiteSettingsObj.supportCenter.label) {
                webExSiteSettingsObj.supportCenter.isSiteEnabled = true;
              }
            } // chkSiteServiceType()
          ); // siteServiceTypes.forEach()
        }, // processSiteInfo()

        processMeetingTypesInfo: function () {
          var meetingTypesInfoJson = webExSiteSettingsObj.meetingTypesInfo.bodyJson;
          var sessionTypes = [];

          if (null != meetingTypesInfoJson.mtgtype_meetingType) { // non-empty meetingTypesInfoJson
            var siteMeetingTypes = [].concat(meetingTypesInfoJson.mtgtype_meetingType);

            siteMeetingTypes.forEach(
              function chkSiteMeetingType(siteMeetingType) {
                var siteMtgServiceTypeID = siteMeetingType.mtgtype_meetingTypeID;
                var siteMtgProductCodePrefix = siteMeetingType.mtgtype_productCodePrefix;
                var siteMtgDisplayName = siteMeetingType.mtgtype_displayName;
                var siteMtgServiceTypes = [].concat(siteMeetingType.mtgtype_serviceTypes.mtgtype_serviceType);

                var meetingCenterApplicable = false;
                var trainingCenterApplicable = false;
                var eventCenterApplicable = false;
                var supportCenterApplicable = false;

                siteMtgServiceTypes.forEach(
                  function chkSiteMtgServiceType(siteMtgServiceType) {
                    if (webExSiteSettingsObj.meetingCenter.serviceType == siteMtgServiceType) {
                      meetingCenterApplicable = true;
                    } else if (webExSiteSettingsObj.eventCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        eventCenterApplicable = true;
                      }
                    } else if (webExSiteSettingsObj.trainingCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        trainingCenterApplicable = true;
                      }
                    } else if (webExSiteSettingsObj.supportCenter.serviceType == siteMtgServiceType) {
                      if (
                        ("SMT" != siteMtgProductCodePrefix) &&
                        ("AUO" != siteMtgProductCodePrefix)
                      ) {
                        supportCenterApplicable = true;
                      }
                    }

                    if ("RAS" === siteMtgProductCodePrefix) {
                      meetingCenterApplicable = false;
                      trainingCenterApplicable = false;
                      eventCenterApplicable = false;
                      supportCenterApplicable = false;
                    } //filter out RAS
                  } // chkSiteMtgServiceType()
                ); // siteMtgServiceTypes.forEach()

                var sessionType = {
                  id: "sessionType-" + siteMtgServiceTypeID,
                  sessionTypeId: siteMtgServiceTypeID,
                  sessionName: siteMtgProductCodePrefix,
                  sessionDescription: siteMtgDisplayName,
                  meetingCenterApplicable: meetingCenterApplicable,
                  trainingCenterApplicable: trainingCenterApplicable,
                  eventCenterApplicable: eventCenterApplicable,
                  supportCenterApplicable: supportCenterApplicable,
                  sessionEnabled: false
                }; // sessionType

                sessionTypes.push(sessionType);
              } // chkSiteMeetingType()
            ); // siteMeetingTypes.forEach()
          } // // non-empty meetingTypesInfoJson()

          webExSiteSettingsObj.sessionTypes = sessionTypes;
        }, // processMeetingTypesInfo()

        processSettingPagesInfo: function () {
          var settingPagesInfoJson = null;

          setCommonSiteSettingPages();
          setCenterSpecificSettingPages();

          function setCommonSiteSettingPages() {
            webExSiteSettingsObj.commonSiteSettingPages = null;
          } // setCommonSiteSettingPages()

          function setCenterSpecificSettingPages() {
            webExSiteSettingsObj.centerSpecificSettingPages = null;
          } // setCenterSpecificSettingPages()
        }, // processSettingPagesInfo()

        getSiteSettingsInfoXml: function () {
          var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);
          var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfoObj);
          var settingPagesInfoXml = WebExXmlApiFact.getSettingPagesInfo(webExXmlApiInfoObj);

          return $q.all({
            siteInfoXml: siteInfoXml,
            meetingTypesInfoXml: meetingTypesInfoXml,
            settingPagesInfoXml: settingPagesInfoXml
          });
        }, // getSiteSettingsInfoXml()
      }; // return
    } // function()
  ]);
})();
