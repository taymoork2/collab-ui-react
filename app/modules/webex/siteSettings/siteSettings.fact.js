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
          var pageTitle = $translate.instant("webexSiteSettingsLabels.siteSettingsIndexPageTitle");
          var pageTitleFull = $translate.instant(
            "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
              siteUrl: siteUrl
            }
          );

          logMsg = funcName + ": " + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "siteName=" + siteName + "\n" +
            "pageTitle=" + pageTitle + "\n" +
            "pageTitleFull=" + pageTitleFull;
          $log.log(logMsg);

          webExSiteSettingsObj.siteUrl = siteUrl;
          webExSiteSettingsObj.siteName = siteName;
          webExSiteSettingsObj.pageTitle = pageTitle;
          webExSiteSettingsObj.pageTitleFull = pageTitleFull;

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

              _this.updateDisplayInfo();

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
              if (siteServiceType == webExSiteSettingsObj.siteStatus.meetingCenter.label) {
                webExSiteSettingsObj.siteStatus.meetingCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExSiteSettingsObj.siteStatus.eventCenter.label) {
                webExSiteSettingsObj.siteStatus.eventCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExSiteSettingsObj.siteStatus.trainingCenter.label) {
                webExSiteSettingsObj.siteStatus.trainingCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExSiteSettingsObj.siteStatus.supportCenter.label) {
                webExSiteSettingsObj.siteStatus.supportCenter.isSiteEnabled = true;
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
                    if (webExSiteSettingsObj.siteStatus.meetingCenter.serviceType == siteMtgServiceType) {
                      meetingCenterApplicable = true;
                    } else if (webExSiteSettingsObj.siteStatus.eventCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        eventCenterApplicable = true;
                      }
                    } else if (webExSiteSettingsObj.siteStatus.trainingCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        trainingCenterApplicable = true;
                      }
                    } else if (webExSiteSettingsObj.siteStatus.supportCenter.serviceType == siteMtgServiceType) {
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

        processSettingPagesInfo: function () {
          var funcName = "processSettingPagesInfo()";
          var logMsg = "";

          var _this = this;
          var settingPagesInfoJson = null;

          updateSettingTable();

          webExSiteSettingsObj.categoryObjs.forEach(
            function checkCategoryObj(categoryObj) {
              $log.log("updateSettingTable(): categoryObj=" + "\n" + JSON.stringify(categoryObj));
            } // checkCategoryObj()
          );

          function updateSettingTable() {
            addPage(
              "emailAllHosts",
              "emailAllHosts",
              "/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage"
            );

            addPage(
              "common",
              "options",
              "/adm3100/siteSettingCommon.do?siteurl=sjsite14"
            );

            addPage(
              "common",
              "siteInformation",
              "/common_siteInformation"
            );

            addPage(
              "meetingCenter",
              "options",
              "/meetingCenter_options"
            );

            addPage(
              "eventCenter",
              "options",
              "/eventCenter_options"
            );

            addPage(
              "eventCenter",
              "forms",
              "/eventCenter_forms"
            );

            addPage(
              "trainingCenter",
              "options",
              "/trainingCenter_options"
            );

            addPage(
              "supportCenter",
              "options",
              "/supportCenter_options"
            );

            addPage(
              "supportCenter",
              "forms",
              "/supportCenter_forms"
            );

            addPage(
              "remoteAccess",
              "options",
              "/remoteAccess_options"
            );

            addPage(
              "webACD",
              "options",
              "/webACD_options"
            );

            addPage(
              "webACD",
              "forms",
              "/webACD_forms"
            );
          } // updateSettingTable()

          function addPage(
            categoryId,
            pageId,
            iframeUrl
          ) {

            var funcName = "processSettingPagesInfo().addPage()";
            var logMsg = "";

            var pageLabel = $translate.instant("webexSiteSettingsLabels.pageId_" + pageId);
            var uiSref =
              "site-setting({" +
              "  siteUrl:" + "'" + webExSiteSettingsObj.siteUrl + "'" + "," +
              "  settingPageLabel:" + "'" + pageLabel + "'" + "," +
              "  settingPageIframeUrl:" + "'" + "https://" + webExSiteSettingsObj.siteUrl + iframeUrl + "'" +
              "})";

            logMsg = funcName + ": " + "\n" +
              "categoryId=" + categoryId + "\n" +
              "pageId=" + pageId + "\n" +
              "iframeUrl=" + iframeUrl + "\n" +
              "pageLabel=" + pageLabel + "\n" +
              "uiSref" + uiSref;
            $log.log(logMsg);

            var newPageObj = {
              id: categoryId + "_" + pageId,
              label: pageLabel,
              uiSref: uiSref,
            };

            webExSiteSettingsObj.categoryObjs.forEach(
              function checkCategoryObj(categoryObj) {
                if (categoryId == categoryObj.id) {
                  var okToAdd = true;
                  var pageObjs = categoryObj.pageObjs;

                  pageObjs.forEach(
                    function checkPageObj(pageObj) {
                      if (newPageObj.id == pageObj.id) {
                        okToAdd = false;
                      }
                    } // checkPageObj()
                  );

                  logMsg = funcName + ": " +
                    "okToAdd=" + okToAdd;
                  $log.log(logMsg);

                  if (okToAdd) {
                    pageObjs.push(newPageObj);
                  }
                }
              } // checkCategoryObj()
            ); // categoryObj.pageObjs.forEach()
          } // addPage()
        }, // processSettingPagesInfo()

        updateDisplayInfo: function () {
          var funcName = "updateDisplayInfo()";
          var logMsg = "";

          var _this = this;

          updateEmailAllHostsBtnObj();
          updateSiteInfoCardObj();
          updateSettingCardObjs();

          function updateEmailAllHostsBtnObj() {
            var categoryObj = getCategoryObj("emailAllHosts");

            webExSiteSettingsObj.emailAllHostsBtnObj.label = $translate.instant("webexSiteSettingsLabels.emailAllHostsTitle");
            webExSiteSettingsObj.emailAllHostsBtnObj.pageObj = categoryObj.pageObjs[0];
          } // updateEmailAllHostsBtnObj()

          function updateSiteInfoCardObj() {
            var categoryObj = getCategoryObj("siteInfo");

            webExSiteSettingsObj.siteInfoCardObj.label = webExSiteSettingsObj.siteUrl;
          } // updateSiteInfoCardObj()

          function updateSettingCardObjs() {
            var funcName = "updateSettingCardObjs()";
            var logMsg = "";

            webExSiteSettingsObj.settingCardObjs.forEach(
              function updateSettingCardObj(settingCardObj) {
                var cardId = settingCardObj.id;
                var categoryObj = getCategoryObj(cardId);

                settingCardObj.pageObjs = categoryObj.pageObjs;

                if ("common" == settingCardObj.id) {
                  settingCardObj.label = $translate.instant("webexSiteSettingsLabels.commonSettingsTitle");
                } else if ("supportCenter" == settingCardObj.id) {
                  // TODO
                  var webACDCardId = settingCardObj.webACDObj.id;
                  var webACDCategoryObj = getCategoryObj(webACDCardId);
                  settingCardObj.webACDObj.pageObjs = webACDCategoryObj.pageObjs;

                  var remoteAccessCardId = settingCardObj.remoteAccessObj.id;
                  var remoteAccessCategoryObj = getCategoryObj(remoteAccessCardId);
                  settingCardObj.remoteAccessObj.pageObjs = remoteAccessCategoryObj.pageObjs;
                }

                logMsg = funcName + ": " + "\n" +
                  "settingCardObj=" + JSON.stringify(settingCardObj);
                $log.log(logMsg);
              } // updateSettingCardObj()
            ); // webExSiteSettingsObj.settingCardObjs.forEach()
          } // updateSettingCardObjs()

          function getCategoryObj(categoryId) {
            var funcName = "updateDisplayInfo().getCategoryObj()";
            var logMsg = "";

            var result = null;

            webExSiteSettingsObj.categoryObjs.forEach(
              function checkCardObj(categoryObj) {
                if (categoryId == categoryObj.id) {
                  result = categoryObj;
                }
              } // checkPageObj()
            );

            logMsg = funcName + ": " + "\n" +
              "categoryId=" + categoryId + "\n" +
              "categoryObj=" + JSON.stringify(result);
            $log.log(logMsg);

            return result;
          } // getCategoryObj()
        }, // updateDisplayInfo()

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
