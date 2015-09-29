(function () {
  'use strict';

  angular.module('WebExSiteSettings').factory('WebExSiteSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'Orgservice',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'WebExSiteSettingsSvc',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      Orgservice,
      Authinfo,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfoObj,
      webExSiteSettingsObj
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

          Orgservice.getValidLicenses().then(
            function getValidLicensesSuccess(licenses) {
              var funcName = "getValidLicensesSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "licenses=" + JSON.stringify(licenses);
              $log.log(logMsg);

              _this.updateLicenseInfo(licenses);
            },

            function getValidLicensesError(info) {
              var funcName = "getValidLicensesError()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "info=" + JSON.stringify(info);
              $log.log(logMsg);
            }
          ); // Orgservice.getValidLicenses().then()

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
            },

            function getSiteSettingsInfoXmlError(getInfoResult) {
              var funcName = "getSiteSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);
            } // getSiteSettingsInfoXmlError()
          ); // _this.getSiteSettingsInfoXml().then()
        }, // getSiteSettingsInfo()

        updateLicenseInfo: function (licenses) {
          var funcName = "updateLicenseInfo()";
          var logMsg = "";

          var updateDone = false;

          licenses.forEach(
            function checkLicense(license) {
              logMsg = funcName + ": " + "\n" +
                "license=" + JSON.stringify(license);
              $log.log(logMsg);

              if (
                (!updateDone) &&
                ("CONFERENCING" == license.licenseType) &&
                (0 <= license.licenseId.indexOf(webExSiteSettingsObj.siteUrl))
              ) {

                var licenseVolume = license.volume;
                var licenseUsage = license.usage;
                var licensesAvailable = licenseVolume - licenseUsage;

                webExSiteSettingsObj.siteInfoCardObj.licensesTotal.count = licenseVolume;
                webExSiteSettingsObj.siteInfoCardObj.licensesUsage.count = licenseUsage;
                webExSiteSettingsObj.siteInfoCardObj.licensesAvailable.count = licensesAvailable;

                updateDone = true;
              }
            } // checkLicense()
          ); // licenses.forEach()

          logMsg = funcName + ":" + "\n" +
            "siteInfoCardObj=" + JSON.stringify(webExSiteSettingsObj.siteInfoCardObj);
          $log.log(logMsg);
        }, // updateLicenseInfo()

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
              $log.log("processSettingPagesInfo(): categoryObj=" + "\n" + JSON.stringify(categoryObj));
            } // checkCategoryObj()
          );

          function updateSettingTable() {
            addPage(
              "emailAllHosts",
              "emailAllHosts",
              "/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage"
            );

            // common settings
            addPage(
              "common",
              "cmr",
              "/common_cmr"
            );

            addPage(
              "common",
              "companyAddress",
              "/common_companyAddress"
            );

            addPage(
              "common",
              "disclaimers",
              "/common_disclaimer"
            );

            addPage(
              "common",
              "emailTemplates",
              "/common_emailTemplate"
            );

            addPage(
              "common",
              "mobile",
              "/common_mobile"
            );

            addPage(
              "common",
              "navigationCustomization",
              "/common_navigationCustomization"
            );

            addPage(
              "common",
              "productivityTools",
              "/common_productivityTools"
            );

            addPage(
              "common",
              "scheduler",
              "/common_scheduler"
            );

            addPage(
              "common",
              "security",
              "/common_security"
            );

            addPage(
              "common",
              "options",
              "/adm3100/siteSettingCommon.do?siteurl=sjsite14"
            );

            addPage(
              "common",
              "teleconfPrivileges",
              "/common_teleconfPrivileges"
            );

            // meeting center
            addPage(
              "meetingCenter",
              "navigationCustomization",
              "/meetingCenter_navigationCustomization"
            );

            addPage(
              "meetingCenter",
              "schedTemplates",
              "/common_schedTemplates"
            );

            addPage(
              "meetingCenter",
              "options",
              "/meetingCenter_options"
            );

            // event center
            addPage(
              "eventCenter",
              "defaultOptions",
              "/eventCenter_defaultOptions"
            );

            addPage(
              "eventCenter",
              "navigationCustomization",
              "/eventCenter_navigationCustomization"
            );

            addPage(
              "eventCenter",
              "reassignment",
              "/eventCenter_reassignment"
            );

            addPage(
              "eventCenter",
              "registrationForm",
              "/eventCenter_registrationForm"
            );

            addPage(
              "eventCenter",
              "options",
              "/eventCenter_options"
            );

            addPage(
              "eventCenter",
              "schedTemplates",
              "/eventCenter_schedTemplates"
            );
            // event center
            addPage(
              "eventCenter",
              "defaultOptions",
              "/eventCenter_defaultOptions"
            );

            addPage(
              "eventCenter",
              "navigationCustomization",
              "/eventCenter_navigationCustomization"
            );

            addPage(
              "eventCenter",
              "reassignment",
              "/eventCenter_reassignment"
            );

            addPage(
              "eventCenter",
              "registrationForm",
              "/eventCenter_registrationForm"
            );

            addPage(
              "eventCenter",
              "options",
              "/eventCenter_options"
            );

            addPage(
              "eventCenter",
              "schedTemplates",
              "/eventCenter_schedTemplates"
            );

            // training center
            addPage(
              "trainingCenter",
              "navigationCustomization",
              "/trainingCenter_navigationCustomization"
            );

            addPage(
              "trainingCenter",
              "schedTemplates",
              "/trainingCenter_schedTemplates"
            );

            addPage(
              "trainingCenter",
              "options",
              "/trainingCenter_options"
            );

            // support center
            addPage(
              "supportCenter",
              "branding",
              "/supportCenter_branding"
            );

            addPage(
              "supportCenter",
              "csrPref",
              "/supportCenter_csrPref"
            );

            addPage(
              "supportCenter",
              "customerPref",
              "/supportCenter_customerPref"
            );

            addPage(
              "supportCenter",
              "forms",
              "/supportCenter_forms"
            );

            addPage(
              "supportCenter",
              "navigationCustomization",
              "/supportCenter_navigationCustomization"
            );

            addPage(
              "supportCenter",
              "promotion",
              "/supportCenter_promotion"
            );

            // webacd
            addPage(
              "webACD",
              "forms",
              "/webACD_forms"
            );

            addPage(
              "webACD",
              "queues",
              "/webACD_settingss"
            );

            addPage(
              "webACD",
              "options",
              "/webACD_options"
            );

            // remote accedss
            addPage(
              "remoteAccess",
              "groups",
              "/remoteAccess_groups"
            );

            addPage(
              "remoteAccess",
              "settings",
              "/remoteAccess_settings"
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

            logMsg = funcName + ": " + "\n" +
              "categoryId=" + categoryId + "\n" +
              "pageId=" + pageId + "\n" +
              "iframeUrl=" + iframeUrl + "\n" +
              "pageLabel=" + pageLabel;
            $log.log(logMsg);

            var newPageObj = {
              id: categoryId + "_" + pageId,
              label: pageLabel,
              pageId: pageId,
              iframeUrl: iframeUrl,
              uiSref: null
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
            webExSiteSettingsObj.emailAllHostsBtnObj.label = $translate.instant("webexSiteSettingsLabels.emailAllHostsTitle");

            var categoryObj = getCategoryObj("emailAllHosts");
            setUiSref(
              categoryObj.pageObjs,
              "",
              ""
            );

            webExSiteSettingsObj.emailAllHostsBtnObj.pageObj = categoryObj.pageObjs[0];
          } // updateEmailAllHostsBtnObj()

          function updateSiteInfoCardObj() {
            webExSiteSettingsObj.siteInfoCardObj.label = webExSiteSettingsObj.siteUrl;

            var categoryObj = getCategoryObj("siteInfo");
            setUiSref(
              categoryObj.pageObjs,
              "",
              ""
            );

            categoryObj.pageObjs.forEach(
              function checkPageObj(pageObj) {
                if (pageObj.pageId == "siteInfo") {
                  webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj = pageObj;
                } else if (pageObj.pageId == "siteFeatures") {
                  webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj = pageObj;
                }
              } // checkPageObj()
            ); // categoryObj.pageObjs.forEach()
          } // updateSiteInfoCardObj()

          function updateSettingCardObjs() {
            var funcName = "updateSettingCardObjs()";
            var logMsg = "";

            webExSiteSettingsObj.settingCardObjs.forEach(
              function updateSettingCardObj(settingCardObj) {
                var cardId = settingCardObj.id;

                if ("common" == settingCardObj.id) {
                  settingCardObj.label = $translate.instant("webexSiteSettingsLabels.commonSettingsTitle");
                } else if ("supportCenter" == settingCardObj.id) {
                  var webACDCategoryObj = getCategoryObj(settingCardObj.webACDObj.id);
                  setUiSref(
                    webACDCategoryObj.pageObjs,
                    settingCardObj.id,
                    settingCardObj.label
                  );

                  var remoteAccessCategoryObj = getCategoryObj(settingCardObj.remoteAccessObj.id);
                  setUiSref(
                    remoteAccessCategoryObj.pageObjs,
                    settingCardObj.id,
                    settingCardObj.label
                  );

                  settingCardObj.webACDObj.pageObjs = webACDCategoryObj.pageObjs;
                  settingCardObj.remoteAccessObj.pageObjs = remoteAccessCategoryObj.pageObjs;
                }

                var categoryObj = getCategoryObj(cardId);
                setUiSref(
                  categoryObj.pageObjs,
                  settingCardObj.id,
                  settingCardObj.label
                );

                settingCardObj.pageObjs = categoryObj.pageObjs;

                logMsg = funcName + ": " + "\n" +
                  "settingCardObj=" + JSON.stringify(settingCardObj);
                $log.log(logMsg);
              } // updateSettingCardObj()
            ); // webExSiteSettingsObj.settingCardObjs.forEach()
          } // updateSettingCardObjs()

          function setUiSref(
            pageObjs,
            cardId,
            cardLabel
          ) {

            pageObjs.forEach(
              function updatePageObj(pageObj) {
                var uiSref =
                  "site-setting({" +
                  "  cardId:" + "'" + cardId + "'" + "," +
                  "  cardLabel:" + "'" + cardLabel + "'" + "," +
                  "  webexPageId:" + "'" + pageObj.pageId + "'" + "," +
                  "  webexPageLabel:" + "'" + pageObj.label + "'" + "," +
                  "  siteUrl:" + "'" + webExSiteSettingsObj.siteUrl + "'" + "," +
                  "  settingPageIframeUrl:" + "'" + "https://" + webExSiteSettingsObj.siteUrl + pageObj.iframeUrl + "'" +
                  "})";

                pageObj.uiSref = uiSref;
              } // updatePageObj()
            ); // pageObjs.forEach()
          } // updatePageObjsUiSref()

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
