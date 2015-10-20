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
      webExXmlApiInfoObj
    ) {
      return {
        getSiteSettingsObj: function () {
          return this.webExSiteSettingsObj;
        }, // getSiteSettingsObj

        initSiteSettingsObj: function () {
          var funcName = "initSiteSettingsObj()";
          var logMsg = funcName;

          var _this = this;

          _this.locale = $translate.use().replace("_", "-");
          _this.webExSiteSettingsObj = createWebExSiteSettingsObj();

          var siteUrl = (!$stateParams.siteUrl) ? '' : $stateParams.siteUrl;
          var siteName = WebExUtilsFact.getSiteName(siteUrl);
          var pageTitle = $translate.instant("webexSiteSettingsLabels.siteSettingsIndexPageTitle");
          var pageTitleFull = $translate.instant(
            "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
              siteUrl: siteUrl
            }
          );

          logMsg = funcName + ": " + "\n" +
            "locale=" + _this.locale + "\n" +
            "siteUrl=" + siteUrl + "\n" +
            "siteName=" + siteName + "\n" +
            "pageTitle=" + pageTitle + "\n" +
            "pageTitleFull=" + pageTitleFull;
          $log.log(logMsg);

          _this.webExSiteSettingsObj.siteUrl = siteUrl;
          _this.webExSiteSettingsObj.siteName = siteName;
          _this.webExSiteSettingsObj.pageTitle = pageTitle;
          _this.webExSiteSettingsObj.pageTitleFull = pageTitleFull;

          _this.getSessionTicket(siteUrl).then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
              var logMsg = "";

              _this.webExSiteSettingsObj.sessionTicketError = false;

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

              _this.webExSiteSettingsObj.sessionTicketError = true;
            } // getSessionTicketError()
          ); // _this.getSessionTicket().then()

          return _this.webExSiteSettingsObj;

          function createWebExSiteSettingsObj() {
            var webExSiteSettingsObj = {
              viewReady: false,
              hasLoadError: false,
              sessionTicketError: false,
              allowRetry: false,
              errMsg: "",
              pageTitle: null,
              pageTitleFull: null,

              siteUrl: null,
              siteName: null,

              // siteInfo: null,
              // meetingTypesInfo: null,
              // sessionTypesInfo: null,
              settingPagesInfo: null,

              /*
              siteStatus: {
                meetingCenter: {
                  id: "MC",
                  label: "Meeting Center",
                  serviceType: "MeetingCenter",
                  isSiteEnabled: false
                }, // meetingCenter

                trainingCenter: {
                  id: "TC",
                  label: "Training Center",
                  serviceType: "TrainingCenter",
                  isSiteEnabled: false,
                }, // trainingCenter

                eventCenter: {
                  id: "EC",
                  label: "Event Center",
                  serviceType: "EventCenter",
                  isSiteEnabled: false,
                }, // eventCenter

                supportCenter: {
                  id: "SC",
                  label: "Support Center",
                  serviceType: "SupportCenter",
                  isSiteEnabled: false
                }, // supportCenter
              }, // siteStatus
              */

              emailAllHostsBtnObj: {
                id: "emailAllHostsBtn",
                label: null,
                pageObj: null,
              }, // emailAllHostsBtnObj

              siteInfoCardObj: {
                id: "SiteInfo",
                label: null,

                licensesTotal: {
                  id: "licensesTotal",
                  count: 0
                },

                licensesUsage: {
                  id: "licensesUsage",
                  count: null
                },

                licensesAvailable: {
                  id: "licensesAvailable",
                  count: null
                },

                siteInfoPageObj: null,
                siteFeaturesPageObj: null
              }, // siteInfoCardObj

              commonSettingsCardObj: {
                id: "CommonSettings",
                label: null,
                pageObjs: null
              }, // commonSettingsCardObj

              meetingCenterSettingsCardObj: {
                id: "MC",
                label: "Meeting Center",
                pageObjs: null
              },

              trainingCenterSettingsCardObj: {
                id: "TC",
                label: "Training Center",
                pageObjs: null
              },

              supportCenterSettingsCardObj: {
                id: "SC",
                label: "Support Center",
                pageObjs: null,

                webACDSettingsObj: {
                  id: "WebACD",
                  label: "WebACD",
                  pageObjs: null
                },

                remoteAccessSettingsObj: {
                  id: "RA",
                  label: "Remote Access",
                  pageObjs: null
                },
              },

              eventCenterSettingsCardObj: {
                id: "EC",
                label: "Event Center",
                pageObjs: null
              },

              categoryObjs: [{
                id: "EMAIL",
                pageObjs: []
              }, {
                id: "SiteInfo",
                pageObjs: []
              }, {
                id: "CommonSettings",
                pageObjs: []
              }, {
                id: "MC",
                pageObjs: []
              }, {
                id: "EC",
                pageObjs: []
              }, {
                id: "SC",
                pageObjs: []
              }, {
                id: "TC",
                pageObjs: []
              }, {
                id: "RA",
                pageObjs: []
              }, {
                id: "WebACD",
                pageObjs: []
              }], // categoryObjs
            }; // webExSiteSettingsObj

            return webExSiteSettingsObj;
          } // createWebExSiteSettingsObj()
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

              // _this.webExSiteSettingsObj.siteInfo = WebExUtilsFact.validateSiteInfoXmlData(getInfoResult.siteInfoXml);
              // _this.webExSiteSettingsObj.meetingTypesInfo = WebExUtilsFact.validateMeetingTypesInfoXmlData(getInfoResult.meetingTypesInfoXml);
              _this.webExSiteSettingsObj.settingPagesInfo = WebExUtilsFact.validateAdminPagesInfoXmlData(getInfoResult.settingPagesInfoXml);

              // _this.processSiteInfo();
              // _this.processMeetingTypesInfo();
              _this.processSettingPagesInfo();

              _this.updateDisplayInfo();

              _this.webExSiteSettingsObj.viewReady = true;
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

          var _this = this;
          var updateDone = false;

          licenses.forEach(
            function checkLicense(license) {
              logMsg = funcName + ": " + "\n" +
                "license=" + JSON.stringify(license);
              // $log.log(logMsg);

              if (
                (!updateDone) &&
                ("CONFERENCING" == license.licenseType) &&
                (0 <= license.licenseId.indexOf(_this.webExSiteSettingsObj.siteUrl))
              ) {

                var licenseVolume = license.volume;
                var licenseUsage = license.usage;
                var licensesAvailable = licenseVolume - licenseUsage;

                _this.webExSiteSettingsObj.siteInfoCardObj.licensesTotal.count = licenseVolume;
                _this.webExSiteSettingsObj.siteInfoCardObj.licensesUsage.count = licenseUsage;
                _this.webExSiteSettingsObj.siteInfoCardObj.licensesAvailable.count = licensesAvailable;

                updateDone = true;
              }
            } // checkLicense()
          ); // licenses.forEach()

          logMsg = funcName + ":" + "\n" +
            "siteInfoCardObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj);
          // $log.log(logMsg);
        }, // updateLicenseInfo()

        /*
        processSiteInfo: function () {
          var siteInfoJson = _this.webExSiteSettingsObj.siteInfo.bodyJson;
          var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          siteServiceTypes.forEach(
            function chkSiteServiceType(siteServiceType) {
              if (siteServiceType == _this.webExSiteSettingsObj.siteStatus.meetingCenter.label) {
                _this.webExSiteSettingsObj.siteStatus.meetingCenter.isSiteEnabled = true;
              } else if (siteServiceType == _this.webExSiteSettingsObj.siteStatus.eventCenter.label) {
                _this.webExSiteSettingsObj.siteStatus.eventCenter.isSiteEnabled = true;
              } else if (siteServiceType == _this.webExSiteSettingsObj.siteStatus.trainingCenter.label) {
                _this.webExSiteSettingsObj.siteStatus.trainingCenter.isSiteEnabled = true;
              } else if (siteServiceType == _this.webExSiteSettingsObj.siteStatus.supportCenter.label) {
                _this.webExSiteSettingsObj.siteStatus.supportCenter.isSiteEnabled = true;
              }
            } // chkSiteServiceType()
          ); // siteServiceTypes.forEach()
        }, // processSiteInfo()
        */

        /*
        processMeetingTypesInfo: function () {
          var meetingTypesInfoJson = _this.webExSiteSettingsObj.meetingTypesInfo.bodyJson;
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
                    if (_this.webExSiteSettingsObj.siteStatus.meetingCenter.serviceType == siteMtgServiceType) {
                      meetingCenterApplicable = true;
                    } else if (_this.webExSiteSettingsObj.siteStatus.eventCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        eventCenterApplicable = true;
                      }
                    } else if (_this.webExSiteSettingsObj.siteStatus.trainingCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        trainingCenterApplicable = true;
                      }
                    } else if (_this.webExSiteSettingsObj.siteStatus.supportCenter.serviceType == siteMtgServiceType) {
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

          _this.webExSiteSettingsObj.sessionTypesInfo = sessionTypesInfo;
        }, // processMeetingTypesInfo()
        */

        processSettingPagesInfo: function () {
          var funcName = "processSettingPagesInfo()";
          var logMsg = "";

          var _this = this;
          var siteAdminNavUrls = _this.webExSiteSettingsObj.settingPagesInfo.bodyJson.ns1_siteAdminNavUrl;

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

          var emailCategoryObj = _this.getCategoryObj("EMAIL");
          var siteInfoCategoryObj = _this.getCategoryObj("SiteInfo");

          if (0 === emailCategoryObj.pageObjs.length) {
            logMsg = funcName + ": " +
              "Missing Email All Hosts page!";
            $log.log(logMsg);

            addPage(
              "EMAIL",
              "send_email_to_all",
              null
            );
          }

          var hasSiteInfoPage = false;
          var hasSiteFeaturesPage = false;

          siteInfoCategoryObj.pageObjs.forEach(
            function checkPageObj(pageObj) {
              if ("site_info" == pageObj.pageId) {
                hasSiteInfoPage = true;
              } else if ("site_features" == pageObj.pageId) {
                hasSiteFeaturesPage = true;
              }
            } // checkPageObj()
          ); // getCategoryObj().pageObjs.forEach()

          if (!hasSiteInfoPage) {
            logMsg = funcName + ": " +
              "Missing Site Information page!";
            $log.log(logMsg);

            addPage(
              "SiteInfo",
              "site_info",
              null
            );
          }

          if (!hasSiteFeaturesPage) {
            logMsg = funcName + ": " +
              "Missing Site Features page!";
            $log.log(logMsg);

            addPage(
              "SiteInfo",
              "site_features",
              null
            );
          }

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

            if (null == iframeUrl) {
              iframeUrl = "https://" + _this.webExSiteSettingsObj.siteUrl + "/igotnuthin";
            }

            var uiSref =
              "site-settings.site-setting({" +
              "  siteUrl: " + "'" + _this.webExSiteSettingsObj.siteUrl + "'" + "," +
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
            // $log.log(logMsg);

            var categoryObj = _this.getCategoryObj(categoryId);
            if (null == categoryObj) {
              logMsg = funcName + ": " +
                categoryId + " cannot be processed!!!";
              $log.log(logMsg);
            } else {
              var pageInsertionDone = false;
              var pageIndex = 0;

              categoryObj.pageObjs.forEach(
                function checkPageObj(pageObj) {
                  if (!pageInsertionDone) {
                    var localeCompareResult = newPageObj.label.localeCompare(
                      pageObj.label,
                      _this.locale
                    );

                    logMsg = funcName + ": " +
                      "pageObj.label=" + pageObj.label + "\n" +
                      "newPageObj.label=" + newPageObj.label + "\n" +
                      "localeCompareResult=" + localeCompareResult;
                    // $log.log(logMsg);

                    if (localeCompareResult < 0) {
                      logMsg = funcName + ": " +
                        "Page obj inserted" + "\n" +
                        "newPageObj=" + JSON.stringify(newPageObj);
                      // $log.log(logMsg);

                      categoryObj.pageObjs.splice(pageIndex, 0, newPageObj);

                      pageInsertionDone = true;
                    } else if (localeCompareResult === 0) {
                      logMsg = funcName + ": " +
                        "Page obj updated" + "\n" +
                        "pageObj=" + JSON.stringify(pageObj) + "\n" +
                        "newPageObj=" + JSON.stringify(newPageObj);
                      $log.log(logMsg);

                      pageObj.id = newPageObj.id;
                      pageObj.pageId = newPageObj.pageId;
                      pageObj.label = newPageObj.label;
                      pageObj.iframeUrl = newPageObj.iframeUrl;
                      pageObj.uiSref = newPageObj.uiSref;

                      pageInsertionDone = true;
                    }
                  }

                  ++pageIndex;
                } // checkPageObj()
              ); // categoryObj.pageObjs.forEach()

              if (!pageInsertionDone) {
                logMsg = funcName + ": " +
                  "Page obj pushed" + "\n" +
                  "newPageObj=" + JSON.stringify(newPageObj);
                // $log.log(logMsg);

                categoryObj.pageObjs.push(newPageObj);
              }
            }
          } // addPage()
        }, // processSettingPagesInfo()

        updateDisplayInfo: function () {
          var funcName = "updateDisplayInfo()";
          var logMsg = "";

          var _this = this;

          updateEmailAllHostsBtnObj();
          updateSiteInfoCardObj();
          updateCommonSettingsCardObj();
          updateMeetingCenterCardObj();
          updateEventCenterCardObj();
          updateTrainingCenterCardObj();
          updateSupportCenterCardObj();

          function updateEmailAllHostsBtnObj() {
            var btnLabel = $translate.instant("webexSiteSettingsLabels.emailAllHostsBtnTitle").replace(" ", "&nbsp;");

            _this.webExSiteSettingsObj.emailAllHostsBtnObj.label = btnLabel;
            _this.webExSiteSettingsObj.emailAllHostsBtnObj.pageObj = _this.getCategoryObj("EMAIL").pageObjs[0];
          } // updateEmailAllHostsBtnObj()

          function updateSiteInfoCardObj() {
            var funcName = "updateSiteInfoCardObj()";
            var logMsg = "";

            _this.webExSiteSettingsObj.siteInfoCardObj.label = _this.webExSiteSettingsObj.siteUrl;

            _this.getCategoryObj(_this.webExSiteSettingsObj.siteInfoCardObj.id).pageObjs.forEach(
              function checkPageObj(pageObj) {
                if (pageObj.pageId == "site_info") {
                  _this.webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj = pageObj;
                } else if (pageObj.pageId == "site_features") {
                  _this.webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj = pageObj;
                }
              } // checkPageObj()
            ); // getCategoryObj("siteInfo").pageObjs.forEach()

            logMsg = funcName + ": " + "\n" +
              "siteInfoPageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.siteInfoPageObj);
            // $log.log(logMsg);

            logMsg = funcName + ": " + "\n" +
              "siteFeaturePageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.siteFeaturePageObj);
            // $log.log(logMsg);
          } // updateSiteInfoCardObj()

          function updateCommonSettingsCardObj() {
            var funcName = "updateCommonSettingsCardObj()";
            var logMsg = "";

            var cardObj = _this.webExSiteSettingsObj.commonSettingsCardObj;
            var categoryObj = _this.getCategoryObj(cardObj.id);

            cardObj.label = $translate.instant("webexSiteSettingsLabels.commonSettingsCardTitle");
            cardObj.pageObjs = categoryObj.pageObjs;

            logMsg = funcName + ": " + "\n" +
              "cardObj=" + JSON.stringify(cardObj);
            // $log.log(logMsg);
          } // updateCommonSettingsCardObj()

          function updateMeetingCenterCardObj() {
            var funcName = "updateMeetingCenterCardObj()";
            var logMsg = "";

            var cardObj = _this.webExSiteSettingsObj.meetingCenterSettingsCardObj;
            var categoryObj = _this.getCategoryObj(cardObj.id);

            cardObj.pageObjs = categoryObj.pageObjs;

            logMsg = funcName + ": " + "\n" +
              "cardObj=" + JSON.stringify(cardObj);
            // $log.log(logMsg);
          } // updateMeetingCenterCardObj

          function updateEventCenterCardObj() {
            var funcName = "updateEventCenterCardObj()";
            var logMsg = "";

            var cardObj = _this.webExSiteSettingsObj.eventCenterSettingsCardObj;
            var categoryObj = _this.getCategoryObj(cardObj.id);

            cardObj.pageObjs = categoryObj.pageObjs;

            logMsg = funcName + ": " + "\n" +
              "cardObj=" + JSON.stringify(cardObj);
            $log.log(logMsg);
          } // updateEventCenterCardObj()

          function updateTrainingCenterCardObj() {
            var funcName = "updateTrainingCenterCardObj()";
            var logMsg = "";

            var cardObj = _this.webExSiteSettingsObj.trainingCenterSettingsCardObj;
            var categoryObj = _this.getCategoryObj(cardObj.id);

            cardObj.pageObjs = categoryObj.pageObjs;

            logMsg = funcName + ": " + "\n" +
              "cardObj=" + JSON.stringify(cardObj);
            // $log.log(logMsg);
          } // updateTrainingCenterCardObj()

          function updateSupportCenterCardObj() {
            var funcName = "updateSupportCenterCardObj()";
            var logMsg = "";

            var cardObj = _this.webExSiteSettingsObj.supportCenterSettingsCardObj;
            var categoryObj = _this.getCategoryObj(cardObj.id);
            var webACDCategoryObj = _this.getCategoryObj(cardObj.webACDSettingsObj.id);
            var remoteAccessCategoryObj = _this.getCategoryObj(cardObj.remoteAccessSettingsObj.id);

            cardObj.webACDSettingsObj.pageObjs = webACDCategoryObj.pageObjs;
            cardObj.remoteAccessSettingsObj.pageObjs = remoteAccessCategoryObj.pageObjs;

            cardObj.pageObjs = categoryObj.pageObjs;

            logMsg = funcName + ": " + "\n" +
              "cardObj=" + JSON.stringify(cardObj);
            // $log.log(logMsg);
          } // updateSupportCenterCardObj()
        }, // updateDisplayInfo()

        getCategoryObj: function (categoryId) {
          var funcName = "getCategoryObj()";
          var logMsg = "";

          var result = null;

          this.webExSiteSettingsObj.categoryObjs.forEach(
            function checkCategoryObj(categoryObj) {
              if (categoryId == categoryObj.id) {
                result = categoryObj;
              }
            } // checkCategoryObj()
          ); // _this.webExSiteSettingsObj.categoryObjs.forEach()

          logMsg = funcName + ": " + "\n" +
            "categoryId=" + categoryId + "\n" +
            "categoryObj=" + JSON.stringify(result);
          // $log.log(logMsg);

          return result;
        }, // getCategoryObj()

        getSiteSettingsInfoXml: function () {
          var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfoObj);
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
