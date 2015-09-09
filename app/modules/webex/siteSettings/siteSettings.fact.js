(function () {
  'use strict';

  angular.module('WebExSiteSettings').factory('WebExSiteSettingsFact', [
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
          var displayLabel = null;

          var siteUrl = (!$stateParams.siteUrl) ? '' : $stateParams.siteUrl;
          var siteName = WebExUtilsFact.getSiteName(siteUrl);

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "; " +
            "siteName=" + siteName;
          $log.log(logMsg);

          webExSiteSettingsObj.siteUrl = siteUrl;
          webExSiteSettingsObj.siteName = siteName;

          displayLabel = $translate.instant("webexSiteSettingsLabels.column_settings");
          webExSiteSettingsObj.siteSettingsTableColumnLabel.settings = displayLabel;

          displayLabel = $translate.instant("webexSiteSettingsLabels.column_common");
          webExSiteSettingsObj.siteSettingsTableColumnLabel.common = displayLabel;

          displayLabel = $translate.instant("webexSiteSettingsLabels.column_remoteAccess");
          webExSiteSettingsObj.siteSettingsTableColumnLabel.remoteAccess = displayLabel;

          displayLabel = $translate.instant("webexSiteSettingsLabels.column_webACD");
          webExSiteSettingsObj.siteSettingsTableColumnLabel.webACD = displayLabel;

          webExSiteSettingsObj.siteSettingsTableColumnLabel.meetingCenter = "Meeting Center";
          webExSiteSettingsObj.siteSettingsTableColumnLabel.eventCenter = "Event Center";
          webExSiteSettingsObj.siteSettingsTableColumnLabel.trainingCenter = "Training Center";
          webExSiteSettingsObj.siteSettingsTableColumnLabel.supportCenter = "Support Center";

          displayLabel = $translate.instant("webexSiteSettingsLabels.centerSpecificSettings");
          webExSiteSettingsObj.additionalSiteSettingsLabel = displayLabel;

          _this.getSessionTicket(siteUrl).then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
              var logMsg = "";

              webExSiteSettingsObj.sessionTicketError = false;

              webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
              webExXmlApiInfoObj.webexSiteName = siteName;
              webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
              webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;

              _this.getSiteSettingsInfo();
            }, // getSessionTicketSuccess()

            function getSessionTicketError(errId) {
              var funcName = "initSiteSettingsModel().getSessionTicketError()";
              var logMsg = "";

              logMsg = funcName + ": " + "errId=" + errId;
              $log.log(logMsg);

              webExSiteSettingsObj.sessionTicketError = true;
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

          _this.getSiteSettingsInfoXml().then(
            function getSiteSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);

              webExSiteSettingsObj.siteInfo = WebExUtilsFact.validateSiteInfoXmlData(getInfoResult.siteInfoXml);
              // webExSiteSettingsObj.meetingTypesInfo = WebExUtilsFact.validateMeetingTypesInfoXmlData(getInfoResult.meetingTypesInfoXml);
              webExSiteSettingsObj.settingPagesInfo = WebExUtilsFact.validateSettingPagesInfoXmlData(getInfoResult.settingPagesInfoXml);

              _this.processSiteInfo();
              // _this.processMeetingTypesInfo();
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

        /*
        processMeetingTypesInfo: function () {
          var meetingTypesInfoJson = webExSiteSettingsObj.meetingTypesInfo.bodyJson;
          var sessionTypesInfo = [];

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

                sessionTypesInfo.push(sessionType);
              } // chkSiteMeetingType()
            ); // siteMeetingTypes.forEach()
          } // // non-empty meetingTypesInfoJson()

          webExSiteSettingsObj.sessionTypesInfo = sessionTypesInfo;
        }, // processMeetingTypesInfo()
        */

        updateSettingsPageObjs: function (
          settingPageId,
          category,
          settingPageUrl
        ) {

          var settingPageTypeObj = null;
          var tmpId = "pageId_" + settingPageId;

          webExSiteSettingsObj.settingPageTypeObjs.forEach(
            function checkSettingPageTypeObj(tmpSettingPageTypeObj) {
              if (tmpId == tmpSettingPageTypeObj.id) {
                settingPageTypeObj = tmpSettingPageTypeObj;
              }
            } // checkSettingPageTypeObj()  
          );

          if (null == settingPageTypeObj) {
            var labelId = "webexSiteSettingsLabels" + "." + tmpId;
            var displayLabel = $translate.instant(labelId);

            settingPageTypeObj = {
              id: tmpId,
              label: displayLabel,

              commonSettingPage: {
                id: settingPageId + "_common",
                sref: null,
              },

              remoteAccessSettingPage: {
                id: settingPageId + "_remoteAccess",
                sref: null,
              },

              webACDSettingPage: {
                id: settingPageId + "_webACD",
                sref: null,
              },

              emailAllHostsSettingPage: {
                id: settingPageId + "_emailAllHosts",
                sref: null,
              },

              meetingCenterSettingPage: {
                id: settingPageId + "_meetingCenter",
                sref: null,
              },

              eventCenterSettingPage: {
                id: settingPageId + "_eventCenter",
                sref: null,
              },

              trainingCenterSettingPage: {
                id: settingPageId + "_trainingCenter",
                sref: null,
              },

              supportCenterSettingPage: {
                id: settingPageId + "_supportCenter",
                sref: null,
              },
            };

            if (settingPageId == "emailAllHosts") {
              webExSiteSettingsObj.emailAllHostsObj = settingPageTypeObj;
            } else {
              webExSiteSettingsObj.settingPageTypeObjs.push(settingPageTypeObj);
            }
          }

          var settingPageObj = null;

          if ("common" == category) {
            settingPageObj = settingPageTypeObj.commonSettingPage;
          } else if ("remoteAccess" == category) {
            settingPageObj = settingPageTypeObj.remoteAccessSettingPage;
          } else if ("webACD" == category) {
            settingPageObj = settingPageTypeObj.webACDSettingPage;
          } else if ("meetingCenter" == category) {
            settingPageObj = settingPageTypeObj.meetingCenterSettingPage;
          } else if ("trainingCenter" == category) {
            settingPageObj = settingPageTypeObj.trainingCenterSettingPage;
          } else if ("eventCenter" == category) {
            settingPageObj = settingPageTypeObj.eventCenterSettingPage;
          } else if ("supportCenter" == category) {
            settingPageObj = settingPageTypeObj.supportCenterSettingPage;
          }

          var iframeSref =
            "site-setting-iframe({" +
            "siteUrl:" + "'" + webExSiteSettingsObj.siteUrl + "'" + "," +
            "settingPageId:" + "'" + settingPageTypeObj.id + "'" + "," +
            "settingPageIframeUrl:" + "'" + settingPageUrl + "'" +
            "})";

          settingPageObj.sref = iframeSref;
        }, // updateSettingsPageObjs()

        processSettingPagesInfo: function () {
          var _this = this;
          var settingPagesInfoJson = null;

          setCommonSiteSettingPages();
          setCenterSpecificSettingPages();
          updateSettingTable();

          function updateSettingTable() {
            _this.updateSettingsPageObjs(
              "emailAllHosts",
              "common",
              "/emailAllHosts"
            );

            _this.updateSettingsPageObjs(
              "options",
              "common",
              "/options_common"
            );

            _this.updateSettingsPageObjs(
              "options",
              "remoteAccess",
              "/options_remoteAccess"
            );

            _this.updateSettingsPageObjs(
              "options",
              "webACD",
              "/options_webACD"
            );

            _this.updateSettingsPageObjs(
              "options",
              "meetingCenter",
              "/options_meetingCenter"
            );

            _this.updateSettingsPageObjs(
              "options",
              "eventCenter",
              "/options_eventCenter"
            );

            _this.updateSettingsPageObjs(
              "options",
              "trainingCenter",
              "/options_trainingCenter"
            );

            _this.updateSettingsPageObjs(
              "options",
              "supportCenter",
              "/options_supportCenter"
            );

            _this.updateSettingsPageObjs(
              "forms",
              "eventCenter",
              "/forms_eventCenter"
            );

            _this.updateSettingsPageObjs(
              "forms",
              "supportCenter",
              "/forms_supportCenter"
            );

            _this.updateSettingsPageObjs(
              "forms",
              "webACD",
              "/forms_webACD"
            );

            webExSiteSettingsObj.settingPageTypeObjs.forEach(
              function checkSettingPageTypeObj(tmpSettingPageTypeObj) {
                $log.log("updateSettingTable(): " + JSON.stringify(tmpSettingPageTypeObj) + "\n");
              }
            );
          } // updateSettingTable()

          function setCommonSiteSettingPages() {
            $log.log("setCommonSiteSettingPages START");
            var siteName = webExSiteSettingsObj.siteName;
            var siteUrl = webExSiteSettingsObj.siteUrl;
            var commonSiteSettings = [];

            //TODO: parse XML to get links
            var commonSiteSetting = {
              id: "cmr",
              label: 'webexSiteSettingsLabels.pageId_cmr',
              link: "https://" + siteUrl + "/admin",
              enabled: true
            };
            commonSiteSettings.push(commonSiteSetting);

            var commonSiteSetting2 = {
              id: "address",
              label: "webexSiteSettingsLabels.pageId_address",
              link: "https://" + siteUrl + "/admin",
              enabled: false
            };
            commonSiteSettings.push(commonSiteSetting2);

            commonSiteSetting2 = {
              id: "misc",
              label: "webexSiteSettingsLabels.pageId_" + "misc",
              link: "https://" + siteName + ".webex.com/adm3100/siteSettingCommon.do?siteurl=" + siteName,
              enabled: true
            };
            commonSiteSettings.push(commonSiteSetting2);

            webExSiteSettingsObj.commonSiteSettingPages = commonSiteSettings;
            $log.log("setCommonSiteSettingPages END");
          } // setCommonSiteSettingPages()

          function setCenterSpecificSettingPages() {
            var centerSpecificSettings = [];
            var centerSpecificSetting = null;
            var pageId = null;
            var displayLabel = null;

            pageId = "0017";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: true,
              eventCenterApplicable: false,
              trainingCenterApplicable: true,
              supportCenterApplicable: false
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0018";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: true,
              trainingCenterApplicable: false,
              supportCenterApplicable: true
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0019";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: true,
              trainingCenterApplicable: true,
              supportCenterApplicable: false
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0020";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: true,
              trainingCenterApplicable: true,
              supportCenterApplicable: true
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0021";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: true,
              eventCenterApplicable: false,
              trainingCenterApplicable: false,
              supportCenterApplicable: false
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0021";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: true,
              eventCenterApplicable: true,
              trainingCenterApplicable: true,
              supportCenterApplicable: true
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0022";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: true,
              trainingCenterApplicable: false,
              supportCenterApplicable: false
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0023";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: true,
              eventCenterApplicable: true,
              trainingCenterApplicable: false,
              supportCenterApplicable: true
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0024";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: true,
              trainingCenterApplicable: false,
              supportCenterApplicable: false
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0025";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: true,
              trainingCenterApplicable: true,
              supportCenterApplicable: true
            };
            centerSpecificSettings.push(centerSpecificSetting);

            pageId = "0026";
            displayLabel = "webexSiteSettingsLabels" + "." + "pageId_" + pageId;
            centerSpecificSetting = {
              id: "pageId_" + pageId,
              label: $translate.instant(displayLabel),
              iframeUrl: null,
              meetingCenterApplicable: false,
              eventCenterApplicable: false,
              trainingCenterApplicable: false,
              supportCenterApplicable: true
            };
            centerSpecificSettings.push(centerSpecificSetting);

            webExSiteSettingsObj.centerSpecificSettingPages = centerSpecificSettings;
          } // setCenterSpecificSettingPages()
        }, // processSettingPagesInfo()

        getSiteSettingsInfoXml: function () {
          var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);
          // var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfoObj);
          var settingPagesInfoXml = WebExXmlApiFact.getSettingPagesInfo(webExXmlApiInfoObj);

          return $q.all({
            siteInfoXml: siteInfoXml,
            // meetingTypesInfoXml: meetingTypesInfoXml,
            settingPagesInfoXml: settingPagesInfoXml
          });
        }, // getSiteSettingsInfoXml()
      }; // return
    } // function()
  ]);
})();
