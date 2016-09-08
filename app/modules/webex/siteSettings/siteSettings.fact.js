(function () {
  'use strict';

  angular.module('WebExApp').factory('WebExSiteSettingsFact', WebExSiteSettingsFact);

  /* @ngInject */
  function WebExSiteSettingsFact(
    $log,
    $q,
    $stateParams,
    $translate,
    Log,
    Authinfo,
    WebExUtilsFact,
    WebExXmlApiFact,
    WebExXmlApiInfoSvc
  ) {
    return {
      newWebExSiteSettingsObj: function (
        siteUrl,
        siteName,
        pageTitle,
        pageTitleFull
      ) {
        var infoCardObj = WebExUtilsFact.getNewInfoCardObj(
          siteUrl,
          "icon icon-circle-webex",
          "icon icon-circle-star"
        );

        var webExSiteSettingsObj = {
          viewReady: false,
          hasLoadError: false,
          invalidNavUrls: false,
          sessionTicketError: false,
          errMsg: "",
          pageTitle: pageTitle,
          pageTitleFull: pageTitleFull,

          siteUrl: siteUrl,
          siteName: siteName,
          cardsSectionId: siteUrl + "-" + "cardsSection",

          // siteInfo: null,
          // meetingTypesInfo: null,
          // sessionTypesInfo: null,
          settingPagesInfo: null,

          emailAllHostsBtnObj: {
            id: "emailAllHostsBtn",
            pageObj: null,
          }, // emailAllHostsBtnObj

          siteInfoCardObj: infoCardObj,

          siteSettingCardObjs: [],
          categoryObjs: [],
        }; // webExSiteSettingsObj

        webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("CommonSettings", null));
        webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("MC", "Meeting Center"));
        webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("TC", "Training Center"));
        webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("SC", "Support Center"));
        webExSiteSettingsObj.siteSettingCardObjs.push(newCardObj("EC", "Event Center"));

        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("EMAIL", ""));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("SiteInfo", ""));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("CommonSettings", "common_options"));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("MC", "mc_options"));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("EC", "ec_options"));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("SC", "sc_options"));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("TC", "tc_options"));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("RA", "remote_options"));
        webExSiteSettingsObj.categoryObjs.push(newCategoryObj("WebACD", "webacd_settings"));

        return webExSiteSettingsObj;

        function newCardObj(
          cardId,
          cardLabel
        ) {
          var cardObj = {
            id: cardId,
            label: cardLabel,
            comment: null,
            pageObjs: null,
            lang: null,

            subSectionObjs: []
          };

          if ("SC" == cardId) {
            cardObj.subSectionObjs.push({
              id: "WebACD",
              label: "WebACD",
              lang: null,
              pageObjs: null
            });

            cardObj.subSectionObjs.push({
              id: "RA",
              label: "Remote Access",
              lang: null,
              pageObjs: null
            });
          }

          return cardObj;
        } // newCardObj()

        function newCategoryObj(
          categoryId,
          categoryPinPageId
        ) {

          var categoryObj = {
            id: categoryId,
            pinPageId: categoryPinPageId,
            pinPageObj: null,
            pageObjs: []
          };

          return categoryObj;
        } // newCategoryObj()
      }, // newWebExSiteSettingsObj()

      initSiteSettingsObj: function () {
        var funcName = "initSiteSettingsObj()";
        var logMsg = funcName;

        var _this = this;

        var siteUrl = $stateParams.siteUrl || "";
        var siteName = WebExUtilsFact.getSiteName(siteUrl);
        var pageTitle = $translate.instant("webexSiteSettingsLabels.siteSettingsIndexPageTitle");
        var pageTitleFull = $translate.instant("webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: siteUrl
        });

        logMsg = funcName + ": " + "\n" +
          "siteUrl=" + siteUrl + "\n" +
          "siteName=" + siteName + "\n" +
          "pageTitle=" + pageTitle + "\n" +
          "pageTitleFull=" + pageTitleFull;
        Log.debug(logMsg);

        _this.webExSiteSettingsObj = _this.newWebExSiteSettingsObj(
          siteUrl,
          siteName,
          pageTitle,
          pageTitleFull
        );

        _this.webExSiteSettingsObj.pageTitle = pageTitle;
        _this.webExSiteSettingsObj.pageTitleFull = pageTitleFull;

        WebExXmlApiFact.getSessionTicket(siteUrl, siteName).then(
          function getSessionTicketSuccess(sessionTicket) {
            // var funcName = "initSiteSettingsModel().getSessionTicketSuccess()";
            // var logMsg = "";

            WebExXmlApiInfoSvc.xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";
            WebExXmlApiInfoSvc.webexSiteName = WebExUtilsFact.getSiteName(siteUrl);
            WebExXmlApiInfoSvc.webexAdminID = Authinfo.getPrimaryEmail();
            WebExXmlApiInfoSvc.webexAdminSessionTicket = sessionTicket;

            _this.getSiteSettingsInfo();
          }, // getSessionTicketSuccess()

          function getSessionTicketError(errId) {
            var funcName = "initSiteSettingsModel().getSessionTicketError()";
            var logMsg = "";

            logMsg = funcName + ": " + "errId=" + errId;
            Log.debug(logMsg);

            _this.webExSiteSettingsObj.sessionTicketError = true;
            _this.webExSiteSettingsObj.hasLoadError = true;
          } // getSessionTicketError()
        ); // _this.getSessionTicket().then()

        return _this.webExSiteSettingsObj;
      }, // initSiteSettingsObj

      getSiteSettingsInfo: function () {
        // var funcName = "getSiteSettingsInfo()";
        // var logMsg = "";

        var _this = this;

        _this.getSiteSettingsInfoXml().then(
          function getSiteSettingsInfoXmlSuccess(getInfoResult) {
            var funcName = "getSiteSettingsInfoXmlSuccess()";
            var logMsg = "";

            // start of replacing "result" with something we want to test
            /*
            var settingPagesInfoXml = '';

            settingPagesInfoXml = settingPagesInfoXml + '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteAdminNavUrlResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>EMAIL</ns1:category><ns1:navItemId>send_email_to_all</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sendemailtoall.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>address</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/address/addressbook.do?proxyfrom=atlas&amp;siteurl=sjsite04&amp;actionFlag=first&amp;currentPageNum=1&amp;index=ALL</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>cmr</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_cmr</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>common_options</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_site_option</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>disclaimer</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/disclaimer.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>mobile</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_mobile</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>navigation</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_navigation</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>productivity</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/ptools.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>scheduler</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_scheduler</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>security</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_security</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>session_type</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/SessionTypeList.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>CommonSettings</ns1:category><ns1:navItemId>user_priv</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/userPrivilege.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>MC</ns1:category><ns1:navItemId>mc_default_options</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/meetingcenter/site/mcoption.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_mc_default_options</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>MC</ns1:category><ns1:navItemId>mc_navigation_customization</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/meetingcenter/site/mcoption.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_mc_navigation_customization</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>MC</ns1:category><ns1:navItemId>mc_options</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/meetingcenter/site/mcoption.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_mc_options</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>MC</ns1:category><ns1:navItemId>mc_scheduling_templates</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/meetingcenter/site/mcoption.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_mc_scheduling_templates</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>SiteInfo</ns1:category><ns1:navItemId>site_features</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/homepage.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_features</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>SiteConfig</ns1:type><ns1:category>SiteInfo</ns1:category><ns1:navItemId>site_info</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/homepage.do?proxyfrom=atlas&amp;siteurl=sjsite04#anchor_info</ns1:url></ns1:siteAdminNavUrl>';
            settingPagesInfoXml = settingPagesInfoXml + '</serv:bodyContent></serv:body></serv:message>';

            getInfoResult = {
              'settingPagesInfoXml': settingPagesInfoXml
            };
            */
            // end of replace

            var settingPagesInfo = WebExUtilsFact.validateAdminPagesInfoXmlData(getInfoResult.settingPagesInfoXml);
            _this.webExSiteSettingsObj.settingPagesInfo = settingPagesInfo;

            if (
              ("" !== settingPagesInfo.errId) ||
              ("" !== settingPagesInfo.errReason)
            ) {

              _this.webExSiteSettingsObj.hasLoadError = true;
            } else if (angular.isUndefined(settingPagesInfo.bodyJson.ns1_siteAdminNavUrl)) {
              logMsg = funcName + "\n" +
                "ERROR: ns1_siteAdminNavUrl is undefined" + "\n" +
                "siteUrl=" + _this.webExSiteSettingsObj.siteUrl;
              Log.error(logMsg);

              _this.webExSiteSettingsObj.hasLoadError = true;
              _this.webExSiteSettingsObj.invalidNavUrls = true;
            } else {
              var ns1_siteAdminNavUrl = settingPagesInfo.bodyJson.ns1_siteAdminNavUrl;

              logMsg = funcName + ": " + "ns1_siteAdminNavUrl=" + "\n" +
                JSON.stringify(ns1_siteAdminNavUrl);
              $log.log(logMsg);

              _this.processSettingPagesInfo(ns1_siteAdminNavUrl);
              _this.copyFromInfoCategoryToCommonCategory();
              _this.pinPageInCategory();
              _this.updateDisplayInfo();
              _this.webExSiteSettingsObj.viewReady = true;
            }
          },

          function getSiteSettingsInfoXmlError(getInfoResult) {
            var funcName = "getSiteSettingsInfoXmlError()";
            var logMsg = "";

            logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
            Log.debug(logMsg);

            _this.webExSiteSettingsObj.hasLoadError = true;
          } // getSiteSettingsInfoXmlError()
        ); // _this.getSiteSettingsInfoXml().then()
      }, // getSiteSettingsInfo()

      processSettingPagesInfo: function (ns1_siteAdminNavUrl) {
        var funcName = "processSettingPagesInfo()";
        var logMsg = "";

        var _this = this;

        ns1_siteAdminNavUrl.forEach(function (siteAdminNavUrl) {
          logMsg = funcName + ": " +
            "siteAdminNavUrl=" + "\n" +
            JSON.stringify(siteAdminNavUrl);
          Log.debug(logMsg);

          var category = siteAdminNavUrl.ns1_category;
          var pageId = siteAdminNavUrl.ns1_navItemId;
          var iframeUrl = siteAdminNavUrl.ns1_url;

          logMsg = funcName + ": " + "\n" +
            "category=" + category + "\n" +
            "pageId=" + pageId + "\n" +
            "iframeUrl=" + iframeUrl;
          Log.debug(logMsg);

          _this.addPage(
            category,
            pageId,
            iframeUrl
          );
        }); // siteAdminNavUrls.forEach()
      }, // processSettingPagesInfo()

      copyFromInfoCategoryToCommonCategory: function () {
        // var funcName = "copyFromInfoCategoryToCommonCategory()";
        // var logMsg = "";

        var _this = this;

        var infoCategoryObj = _this.getCategoryObj(_this.webExSiteSettingsObj.siteInfoCardObj.id);
        // logMsg = funcName + "\n" +
        //   "infoCategoryObj.pageObjs=" + JSON.stringify(infoCategoryObj.pageObjs);
        // $log.log(logMsg);

        infoCategoryObj.pageObjs.forEach(
          function checkPageObj(pageObj) {
            // var funcName = "copyFromInfoCategoryToCommonCategory().checkPageObj()";
            // var logMsg = "";

            // logMsg = funcName + "\n" +
            //   "pageObj=" + JSON.stringify(pageObj);
            // $log.log(logMsg);

            if (pageObj.pageId == "site_info") {
              var pageId = pageObj.pageId;
              var iframeUrl = pageObj.iframeUrl;

              // logMsg = funcName + "\n" +
              //   "pageId=" + pageId + "\n" +
              //   "iframeUrl=" + iframeUrl;
              // $log.log(logMsg);

              _this.addPage(
                "CommonSettings",
                pageId,
                iframeUrl);
            }
          } // checkPageObj()
        ); // infoCategoryObj.pageObjs.forEach()
      }, // copyFromInfoCategoryToCommonCategory()

      addPage: function (
        categoryId,
        pageId,
        iframeUrl
      ) {

        var funcName = "addPage()";
        var logMsg = "";

        var _this = this;

        var locale = $translate.use().replace("_", "-");
        var webexPageId = categoryId + "_" + pageId;
        var indexPageLabelId = "webexSiteSettingsLabels.indexPageLabel_" + webexPageId;
        var indexPageLabel = $translate.instant(indexPageLabelId);

        // var iframePageLabelId = "webexSiteSettingsLabels.iframePageLabel_" + webexPageId;
        // var iframePageLabel = $translate.instant(iframePageLabelId);

        var uiSref =
          "site-list.site-setting({" +
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
          Log.error(logMsg);
        } else {
          var pinPageId = categoryObj.pinPageId;

          if (
            (null != pinPageId) &&
            (pinPageId == newPageObj.pageId)
          ) {

            categoryObj.pinPageObj = newPageObj;
          } else {
            var pageInsertionDone = false;
            var pageIndex = 0;

            categoryObj.pageObjs.forEach(
              function checkPageObj(pageObj) {
                if (!pageInsertionDone) {
                  var localeCompareResult = newPageObj.label.localeCompare(
                    pageObj.label,
                    locale
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
                    // $log.log(logMsg);

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
        }
      }, // addPage()

      pinPageInCategory: function () {
        // var funcName = "pinPageInCategory()";
        // var logMsg = "";

        this.webExSiteSettingsObj.categoryObjs.forEach(
          function checkCategoryObj(categoryObj) {
            // var funcName = "pinPageInCategory().checkCategoryObj()";
            // var logMsg = "";

            if (null != categoryObj.pinPageObj) {
              categoryObj.pageObjs.splice(0, 0, categoryObj.pinPageObj);
            }
          } // checkCategoryObj()
        ); // this.webExSiteSettingsObj.categoryObjs.forEach()
      }, // pinPageInCategory()

      updateDisplayInfo: function () {
        // var funcName = "updateDisplayInfo()";
        // var logMsg = "";

        var _this = this;

        updateEmailAllHostsBtnObj();
        updateSiteInfoCardObj();
        updateSiteSettingCardObjs();

        function updateEmailAllHostsBtnObj() {
          // var btnLabel = $translate.instant("webexSiteSettingsLabels.emailAllHostsBtnTitle");

          _this.webExSiteSettingsObj.emailAllHostsBtnObj.pageObj = _this.getCategoryObj("EMAIL").pageObjs[0];
        } // updateEmailAllHostsBtnObj()

        function updateSiteInfoCardObj() {
          // var funcName = "updateSiteInfoCardObj()";
          // var logMsg = "";

          _this.getCategoryObj(_this.webExSiteSettingsObj.siteInfoCardObj.id).pageObjs.forEach(
            function checkPageObj(pageObj) {
              if (pageObj.pageId == "site_info") {
                _this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj1.iframePageObj = pageObj;
              } else if (pageObj.pageId == "site_features") {
                _this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj2.iframePageObj = pageObj;
              }
            } // checkPageObj()
          ); // getCategoryObj("siteInfo").pageObjs.forEach()

          // logMsg = funcName + ": " + "\n" +
          //   "iframeLinkObj1.iframePageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj1.iframePageObj);
          // $log.log(logMsg);

          // logMsg = funcName + ": " + "\n" +
          //   "iframeLinkObj2.iframePageObj=" + JSON.stringify(_this.webExSiteSettingsObj.siteInfoCardObj.iframeLinkObj2.iframePageObj);
          // $log.log(logMsg);
        } // updateSiteInfoCardObj()

        function updateSiteSettingCardObjs() {
          // var funcName = "updateSiteSettingCardObjs()";
          // var logMsg = "";

          _this.webExSiteSettingsObj.siteSettingCardObjs.forEach(
            function updateCenterSettingsCardObj(siteSettingCardObj) {
              // var funcName = "updateCenterSettingsCardObj()";
              // var logMsg = "";

              var siteSettingCardObjId = siteSettingCardObj.id;

              if ("CommonSettings" == siteSettingCardObjId) {
                siteSettingCardObj.label = $translate.instant("webexSiteSettingsLabels.commonSettingsCardTitle");
                siteSettingCardObj.comment = $translate.instant("webexSiteSettingsLabels.commonSettingsCardNote");
              } else {
                siteSettingCardObj.lang = "en"; //Centre names are in English
              }

              var categoryObj = _this.getCategoryObj(siteSettingCardObjId);
              siteSettingCardObj.pageObjs = categoryObj.pageObjs;

              siteSettingCardObj.subSectionObjs.forEach(
                function updateSubSectionObj(subSectionObj) {
                  categoryObj = _this.getCategoryObj(subSectionObj.id);
                  subSectionObj.pageObjs = categoryObj.pageObjs;
                  subSectionObj.lang = "en"; //WebACD, Remote Acces are in English
                }
              ); // subSectionObjs.forEach()

              // logMsg = funcName + ": " + "\n" +
              //   "siteSettingCardObjs=" + JSON.stringify(siteSettingCardObj);
              // $log.log(logMsg);
            } // updateCenterSettingsCardObj()
          ); // siteSettingCardObjs.forEach()
        } // updateSiteSettingCardObjs()
      }, // updateDisplayInfo()

      getCategoryObj: function (targetCategoryId) {
        // var funcName = "getCategoryObj()";
        // var logMsg = "";

        var result = null;

        this.webExSiteSettingsObj.categoryObjs.forEach(
          function checkCategoryObj(categoryObj) {
            if (targetCategoryId == categoryObj.id) {
              result = categoryObj;
            }
          } // checkCategoryObj()
        ); // categoryObjs.forEach()

        // logMsg = funcName + ": " + "\n" +
        //   "targetCategoryId=" + targetCategoryId + "\n" +
        //   "categoryObj=" + JSON.stringify(result);
        // $log.log(logMsg);

        return result;
      }, // getCategoryObj()

      getSiteSettingsInfoXml: function () {
        // var siteInfoXml = WebExXmlApiFact.getSiteInfo(WebExXmlApiInfoSvc);
        // var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(WebExXmlApiInfoSvc);
        var settingPagesInfoXml = WebExXmlApiFact.getSettingPagesInfo(WebExXmlApiInfoSvc);

        return $q.all({
          // siteInfoXml: siteInfoXml,
          // meetingTypesInfoXml: meetingTypesInfoXml,
          settingPagesInfoXml: settingPagesInfoXml
        });
      }, // getSiteSettingsInfoXml()
    }; // return
  } // function()
})();
