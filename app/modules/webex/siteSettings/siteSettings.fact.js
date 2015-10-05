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
          // $log.log(logMsg);

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

          var _this = this;

          Orgservice.getValidLicenses().then(
            function getValidLicensesSuccess(licenses) {
              var funcName = "getValidLicensesSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "licenses=" + JSON.stringify(licenses);
              // $log.log(logMsg);

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
              // $log.log(logMsg);

              // webExSiteSettingsObj.siteInfo = WebExUtilsFact.validateSiteInfoXmlData(getInfoResult.siteInfoXml);
              // webExSiteSettingsObj.meetingTypesInfo = WebExUtilsFact.validateMeetingTypesInfoXmlData(getInfoResult.meetingTypesInfoXml);
              webExSiteSettingsObj.settingPagesInfo = WebExUtilsFact.validateAdminPagesInfoXmlData(getInfoResult.settingPagesInfoXml);

              // _this.processSiteInfo();
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
              // $log.log(logMsg);

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
          // $log.log(logMsg);
        }, // updateLicenseInfo()

        /*
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
        */

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
          var siteAdminNavUrls = webExSiteSettingsObj.settingPagesInfo.bodyJson.ns1_siteAdminNavUrl;

          logMsg = funcName + ": " + "\n" +
            "siteAdminNavUrls.length=" + siteAdminNavUrls.length;
          $log.log(logMsg);

          siteAdminNavUrls.forEach(
            function processSiteAdminNavUrl(siteAdminNavUrl) {
              logMsg = funcName + ": " +
                "siteAdminNavUrl=" + "\n" +
                JSON.stringify(siteAdminNavUrl);
              // $log.log(logMsg);

              var category = siteAdminNavUrl.ns1_category;
              var pageId = siteAdminNavUrl.ns1_navItemId;
              var iframeUrl = siteAdminNavUrl.ns1_url;

              logMsg = funcName + ": " + "\n" +
                "category=" + category + "\n" +
                "pageId=" + pageId + "\n" +
                "iframeUrl=" + iframeUrl;
              // $log.log(logMsg);

              addPage(
                category,
                pageId,
                iframeUrl
              );
            } // processSiteAdminNavUrl()
          ); // siteAdminNavUrls.forEach()

          updateSettingTable();

          /*
          webExSiteSettingsObj.categoryObjs.forEach(
            function checkCategoryObj(categoryObj) {
              $log.log("processSettingPagesInfo(): categoryObj=" + "\n" + JSON.stringify(categoryObj));
            } // checkCategoryObj()
          );
          */

          function updateSettingTable() {
            addPage(
              "siteInfo",
              "siteInformation",
              ""
            );

            addPage(
              "siteInfo",
              "siteFeatures",
              ""
            );
          } // updateSettingTable()

          function addPage(
            categoryId,
            pageId,
            iframeUrl
          ) {

            var funcName = "addPage()";
            var logMsg = "";

            var webexPageId = categoryId + "_" + pageId;
            var indexPageLabelId = "webexSiteSettingsLabels.indexPageLabel_" + webexPageId;
            var indexPageLabel = $translate.instant(indexPageLabelId);

            var iframePageLabelId = "webexSiteSettingsLabels.iframePageLabel_" + webexPageId;
            var iframePageLabel = $translate.instant(iframePageLabelId);

            iframeUrl = iframeUrl.replace('wbxadmin', 'adm3100');
            var uiSref =
              "site-setting({" +
              "  siteUrl: " + "'" + webExSiteSettingsObj.siteUrl + "'" + "," +
              "  webexPageId: " + "'" + webexPageId + "'" + "," +
              "  settingPageIframeUrl: " + "'" + iframeUrl + "'" +
              "})";

            var newPageObj = {
              id: webexPageId,
              pageId: pageId,
              label: indexPageLabel,
              iframeUrl: iframeUrl,
              uiSref: uiSref
            };

            logMsg = funcName + ": " + "\n" +
              "newPageObj=" + JSON.stringify(newPageObj);
            $log.log(logMsg);

            var categoryFound = false;
            webExSiteSettingsObj.categoryObjs.forEach(
              function checkCategoryObj(categoryObj) {
                if (
                  (!categoryFound) &&
                  (categoryId == categoryObj.id)
                ) {

                  categoryFound = true;

                  var currPageObj = null;
                  var pageObjs = categoryObj.pageObjs;

                  pageObjs.forEach(
                    function checkPageObj(pageObj) {
                      if (newPageObj.id == pageObj.id) {
                        currPageObj = pageObj;
                      }
                    } // checkPageObj()
                  ); // pageObjs.forEach()

                  if (null == currPageObj) {
                    pageObjs.push(newPageObj);

                    logMsg = funcName + ": " +
                      "New page obj added";
                    $log.log(logMsg);
                  } else {
                    currPageObj.id = newPageObj.id;
                    currPageObj.pageId = newPageObj.pageId;
                    currPageObj.label = newPageObj.label;
                    currPageObj.iframeUrl = newPageObj.iframeUrl;
                    currPageObj.uiSref = newPageObj.uiSref;

                    logMsg = funcName + ": " +
                      "Existing page obj updated";
                    $log.log(logMsg);
                  }
                }
              } // checkCategoryObj()
            ); // categoryObjs.forEach()

            if (!categoryFound) {
              logMsg = funcName + ": " +
                categoryId + " cannot be processed!!!";
              $log.log(logMsg);
            }
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
            webExSiteSettingsObj.emailAllHostsBtnObj.label = $translate.instant("webexSiteSettingsLabels.emailAllHostsBtnTitle");
            webExSiteSettingsObj.emailAllHostsBtnObj.pageObj = getCategoryObj("EMAIL").pageObjs[0];
          } // updateEmailAllHostsBtnObj()

          function updateSiteInfoCardObj() {
            var funcName = "updateSiteInfoCardObj()";
            var logMsg = "";

            webExSiteSettingsObj.siteInfoCardObj.label = webExSiteSettingsObj.siteUrl;

            getCategoryObj("siteInfo").pageObjs.forEach(
              function checkPageObj(pageObj) {
                if (pageObj.pageId == "siteInformation") {
                  webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj = pageObj;
                } else if (pageObj.pageId == "siteFeatures") {
                  webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj = pageObj;
                }
              } // checkPageObj()
            ); // getCategoryObj("siteInfo").pageObjs.forEach()

            logMsg = funcName + ": " + "\n" +
              "siteInfoPageObj=" + JSON.stringify(webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj);
            $log.log(logMsg);

            logMsg = funcName + ": " + "\n" +
              "siteFeaturePageObj=" + JSON.stringify(webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj);
            $log.log(logMsg);
          } // updateSiteInfoCardObj()

          function updateSettingCardObjs() {
            var funcName = "updateSettingCardObjs()";
            var logMsg = "";

            webExSiteSettingsObj.settingCardObjs.forEach(
              function updateSettingCardObj(settingCardObj) {
                var cardId = settingCardObj.id;

                if ("CommonSettings" == settingCardObj.id) {
                  settingCardObj.label = $translate.instant("webexSiteSettingsLabels.commonSettingsCardTitle");
                } else if ("SC" == settingCardObj.id) {
                  settingCardObj.webACDObj.pageObjs = getCategoryObj(settingCardObj.webACDObj.id).pageObjs;
                  settingCardObj.remoteAccessObj.pageObjs = getCategoryObj(settingCardObj.remoteAccessObj.id).pageObjs;
                }

                settingCardObj.pageObjs = getCategoryObj(cardId).pageObjs;

                logMsg = funcName + ": " + "\n" +
                  "settingCardObj=" + JSON.stringify(settingCardObj);
                // $log.log(logMsg);
              } // updateSettingCardObj()
            ); // webExSiteSettingsObj.settingCardObjs.forEach()
          } // updateSettingCardObjs()

          function getCategoryObj(categoryId) {
            var funcName = "updateDisplayInfo().getCategoryObj()";
            var logMsg = "";

            var result = null;

            webExSiteSettingsObj.categoryObjs.forEach(
              function checkCategoryObj(categoryObj) {
                if (categoryId == categoryObj.id) {
                  result = categoryObj;
                }
              } // checkCategoryObj()
            ); // webExSiteSettingsObj.categoryObjs.forEach()

            logMsg = funcName + ": " + "\n" +
              "categoryId=" + categoryId + "\n" +
              "categoryObj=" + JSON.stringify(result);
            // $log.log(logMsg);

            return result;
          } // getCategoryObj()
        }, // updateDisplayInfo()

        getSiteSettingsInfoXml: function () {
          // var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);
          // var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfoObj);
          var settingPagesInfoXml = WebExXmlApiFact.getAdminPagesInfo(
            true,
            webExXmlApiInfoObj
          );

          return $q.all({
            // siteInfoXml: siteInfoXml,
            // meetingTypesInfoXml: meetingTypesInfoXml,
            settingPagesInfoXml: settingPagesInfoXml
          });
        }, // getSiteSettingsInfoXml()
      }; // return
    } // function()
  ]);
})();
