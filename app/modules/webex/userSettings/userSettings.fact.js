(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('WebExUserSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'XmlApiFact',
    'WebexUserSettingsSvc',
    'XmlApiInfoSvc',
    'Authinfo',
    'Notification',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      XmlApiFact,
      userSettingsModel,
      xmlApiInfo,
      Authinfo,
      Notification
    ) {
      return {
        /**
         * If user does not have first and last names, use the email address as the display name
         */
        getGivenName: function () {
          if ($stateParams.currentUser.displayName) {
            return $stateParams.currentUser.displayName;
          }

          if (!$stateParams.currentUser.name) {
            return $stateParams.currentUser.userName;
          }

          if (
            ($stateParams.currentUser.name.givenName === "") &&
            ($stateParams.currentUser.name.familyName === "")
          ) {
            return $stateParams.currentUser.userName;
          }

          return $stateParams.currentUser.name.givenName;
        }, // getGivenName()

        getFamilyName: function () {
          if (!$stateParams.currentUser.name || $stateParams.currentUser.displayName) {
            return "";
          }

          return $stateParams.currentUser.name.familyName;
        }, // getFamilyName()

        validateXmlData: function (
          commentText,
          infoXml,
          startOfBodyStr,
          endOfBodyStr
        ) {
          var funcName = "validateXmlData()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "commentText=" + commentText + "\n" +
            "infoXml=\n" + infoXml + "\n" +
            "startOfBodyStr=" + startOfBodyStr + "\n" +
            "endOfBodyStr=" + endOfBodyStr;
          // $log.log(logMsg);

          var headerJson = XmlApiFact.xml2JsonConvert(
            commentText + " Header",
            infoXml,
            "<serv:header>",
            "<serv:body>"
          ).body;

          var bodyJson = {};
          if ((null != startOfBodyStr) && (null != endOfBodyStr)) {
            bodyJson = XmlApiFact.xml2JsonConvert(
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

        getUserSettingsModel: function () {
          return userSettingsModel;
        }, // getUserSettingsModel()

        initUserSettingsModel: function () {
          userSettingsModel.viewReady = false;
          userSettingsModel.hasLoadError = false;
          userSettingsModel.allowRetry = false;
          userSettingsModel.sessionTicketErr = false;

          userSettingsModel.trainingCenter.handsOnLabAdmin.label = $translate.instant("webexUserSettingLabels.handsOnLabAdminLabel");

          userSettingsModel.eventCenter.optimizeBandwidthUsage.label = $translate.instant("webexUserSettingLabels.optimizeBandwidthUsageLabel");

          userSettingsModel.videoSettings.label = $translate.instant("webexUserSettingLabels.videoSettingsLabel");
          userSettingsModel.videoSettings.hiQualVideo.label = $translate.instant("webexUserSettingLabels.hiQualVideoLabel");
          userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.label = $translate.instant("webexUserSettingLabels.hiDefVideoLabel");

          userSettingsModel.telephonyPriviledge.label = $translate.instant("webexUserSettingLabels.telephonyPrivilegesLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.label = $translate.instant("webexUserSettingLabels.callInTeleconfLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].label = $translate.instant("webexUserSettingLabels.tollOnlyLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].label = $translate.instant("webexUserSettingLabels.tollAndTollFreeLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.label = $translate.instant("webexUserSettingLabels.teleconfViaGlobalCallinLabel");
          userSettingsModel.telephonyPriviledge.callBackTeleconf.label = $translate.instant("webexUserSettingLabels.callBackTeleconfLabel");
          userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.label = $translate.instant("webexUserSettingLabels.globalCallBackTeleconfLabel");
          userSettingsModel.telephonyPriviledge.integratedVoIP.label = $translate.instant("webexUserSettingLabels.integratedVoIPLaabel");

          return userSettingsModel;
        }, // initUserSettingsModel()

        initXmlApiInfo: function (
          webexSiteUrl,
          webexSiteName,
          webexAdminSessionTicket
        ) {
          xmlApiInfo.xmlServerURL = "https://" + webexSiteUrl + "/WBXService/XMLService";
          xmlApiInfo.webexSiteName = webexSiteName;
          xmlApiInfo.webexAdminID = Authinfo.getPrimaryEmail();
          xmlApiInfo.webexAdminSessionTicket = webexAdminSessionTicket;
          xmlApiInfo.webexUserId = $stateParams.currentUser.userName;
        }, // initXmlApiInfo()

        updateUserSettingsModelPart1: function () {
          var funcName = "updateUserSettingsModelPart1()";
          var logMsg = null;

          var userInfoJson = userSettingsModel.userInfo.bodyJson;
          var siteInfoJson = userSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = userSettingsModel.meetingTypesInfo.bodyJson;

          // Start of center status update
          var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          userSettingsModel.meetingCenter.isSiteEnabled = false;
          userSettingsModel.eventCenter.isSiteEnabled = false;
          userSettingsModel.trainingCenter.isSiteEnabled = false;
          userSettingsModel.supportCenter.isSiteEnabled = false;

          siteServiceTypes.forEach(function (siteServiceType) {
            if (siteServiceType == userSettingsModel.meetingCenter.label) {
              userSettingsModel.meetingCenter.isSiteEnabled = true;
            } else if (siteServiceType == userSettingsModel.eventCenter.label) {
              userSettingsModel.eventCenter.isSiteEnabled = true;
            } else if (siteServiceType == userSettingsModel.trainingCenter.label) {
              userSettingsModel.trainingCenter.isSiteEnabled = true;
            } else if (siteServiceType == userSettingsModel.supportCenter.label) {
              userSettingsModel.supportCenter.isSiteEnabled = true;
            }
          }); // siteServiceTypes.forEach()
          // End of center status update

          // Start of Session Types update
          var sessionTypes = [];
          if (null != meetingTypesInfoJson.mtgtype_meetingType) {
            var siteMeetingTypes = [].concat(meetingTypesInfoJson.mtgtype_meetingType);

            siteMeetingTypes.forEach(function (siteMeetingType) {
              var siteMtgServiceTypeID = siteMeetingType.mtgtype_meetingTypeID;
              var siteMtgProductCodePrefix = siteMeetingType.mtgtype_productCodePrefix;
              var siteMtgDisplayName = siteMeetingType.mtgtype_displayName;
              var siteMtgServiceTypes = [].concat(siteMeetingType.mtgtype_serviceTypes.mtgtype_serviceType);

              var meetingCenterApplicable = false;
              var trainingCenterApplicable = false;
              var eventCenterApplicable = false;
              var supportCenterApplicable = false;

              siteMtgServiceTypes.forEach(function (siteMtgServiceType) {
                if (userSettingsModel.meetingCenter.serviceType == siteMtgServiceType) {
                  meetingCenterApplicable = true;
                } else if (userSettingsModel.eventCenter.serviceType == siteMtgServiceType) {
                  if ("AUO" != siteMtgProductCodePrefix) {
                    eventCenterApplicable = true;
                  }
                } else if (userSettingsModel.trainingCenter.serviceType == siteMtgServiceType) {
                  if ("AUO" != siteMtgProductCodePrefix) {
                    trainingCenterApplicable = true;
                  }
                } else if (userSettingsModel.supportCenter.serviceType == siteMtgServiceType) {
                  if (
                    ("SMT" != siteMtgProductCodePrefix) &&
                    ("AUO" != siteMtgProductCodePrefix)
                  ) {
                    supportCenterApplicable = true;
                  }
                }
              }); // siteMtgServiceTypes.forEach()

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
            }); // siteMeetingTypes.forEach()
          }

          userSettingsModel.sessionTypes = sessionTypes;
          var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

          logMsg = funcName + ": " + "\n" +
            "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
          // $log.log(logMsg);

          enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
            userSettingsModel.sessionTypes.forEach(function (sessionType) {
              var sessionTypeId = sessionType.sessionTypeId;

              logMsg = funcName + ": " + "\n" +
                "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                "sessionTypeId=" + sessionTypeId;
              // $log.log(logMsg);

              if (sessionType.sessionTypeId == enabledSessionTypeID) {
                sessionType.sessionEnabled = true;
              }
            }); // userSettingsModel.sessionTypes.forEach()
          }); // enabledSessionTypesIDs.forEach()
          // End of Session Types update
        }, // updateUserSettingsModelPart1()

        updateUserSettingsModelPart2: function () {
          var funcName = "updateUserSettingsModelPart2()";
          var logMsg = null;

          var userInfoJson = userSettingsModel.userInfo.bodyJson;
          var siteInfoJson = userSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = userSettingsModel.meetingTypesInfo.bodyJson;

          // Start of Telephony privileges

          // Start of call-in teleconf
          userSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallIn
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = (
            "true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callInTeleconf.value = (
            (userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value) ||
            (userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value)
          ) ? true : false;

          if (userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 2;
          } else if (userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 1;
          } else {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 0;
          }

          userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_intlCallInTeleconferencing
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallInInternational
          ) ? true : false;

          logMsg = funcName + ": " + "\n" +
            "ns1_callInTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing + "\n" +
            "ns1_tollFreeCallinTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing + "\n" +
            "use_teleConfCallIn=" + userInfoJson.use_privilege.use_teleConfCallIn + "\n" +
            "use_teleConfTollFreeCallIn=" + userInfoJson.use_privilege.use_teleConfTollFreeCallIn + "\n" +
            "toll.isSiteEnabled=" + userSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled + "\n" +
            "toll.value=" + userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value + "\n" +
            "tollFree.isSiteEnabled=" + userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled + "\n" +
            "tollFree.value=" + userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value + "\n" +
            "callInTeleconf=" + userSettingsModel.telephonyPriviledge.callInTeleconf.value + "\n" +
            "callInTeleconf.selectedCallInTollType=" + userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType;
          $log.log(logMsg);
          // End of call-in teleconf

          userSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callBackTeleconf.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallOut
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_intlCallBackTeleconferencing
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallOutInternational
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_supportOtherTypeTeleconf
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.otherTeleconfServices.value = (
            "true" == userInfoJson.use_privilege.use_otherTelephony
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.otherTeleconfServices.label = siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_otherTeleServiceName;

          userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.integratedVoIP.value = (
            "true" == userInfoJson.use_privilege.use_voiceOverIp
          ) ? true : false;

          logMsg = funcName + ": " + "\n" +
            "integratedVoIP.isSiteEnabled=" + userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled + "\n" +
            "integratedVoIP.value=" + userSettingsModel.telephonyPriviledge.integratedVoIP.value;
          $log.log(logMsg);
          // End of Telephony privileges
        }, // updateUserSettingsModelPart2()

        updateUserSettingsModelPart3: function () {
          var funcName = "updateUserSettingsModelPart3()";
          var logMsg = null;

          var userInfoJson = userSettingsModel.userInfo.bodyJson;
          var siteInfoJson = userSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = userSettingsModel.meetingTypesInfo.bodyJson;

          // Start of Video privileges
          userSettingsModel.videoSettings.hiQualVideo.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_video.ns1_HQvideo
          ) ? true : false;

          userSettingsModel.videoSettings.hiQualVideo.value = (
            "true" == userInfoJson.use_privilege.use_HQvideo
          ) ? true : false;

          if (!userSettingsModel.videoSettings.hiQualVideo.isSiteEnabled) {
            userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled = false;
          } else {
            userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled = (
              "true" == siteInfoJson.ns1_siteInstance.ns1_video.ns1_HDvideo
            ) ? true : false;
          }

          userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value = (
            "true" == userInfoJson.use_privilege.use_HDvideo
          ) ? true : false;
          // End of Video privileges

          // Start of Event Center
          userSettingsModel.eventCenter.optimizeBandwidthUsage.isSiteEnabled = (
            ("true" == siteInfoJson.ns1_siteInstance.ns1_supportedServices.ns1_eventCenter.ns1_optimizeAttendeeBandwidthUsage)
          ) ? true : false;

          userSettingsModel.eventCenter.optimizeBandwidthUsage.value = (
            "true" == userInfoJson.use_eventCenter.use_optimizeAttendeeBandwidthUsage
          ) ? true : false;
          // End of Event Center

          // Start of Training Center privileges
          userSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = (
            ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab)
          ) ? true : false;

          userSettingsModel.trainingCenter.handsOnLabAdmin.value = (
            "true" == userInfoJson.use_privilege.use_labAdmin
          ) ? true : false;
          // End of Training Center privileges
        }, // updateUserSettingsModelPart3()

        getUserInfoXml: function () {
          var xmlData = XmlApiFact.getUserInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getUserInfoXml()

        getSiteInfoXml: function () {
          var xmlData = XmlApiFact.getSiteInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getSiteInfoXml()

        getMeetingTypeInfoXml: function () {
          var xmlData = XmlApiFact.getMeetingTypeInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getMeetingTypeInfoXml()

        getUserSettingsInfoXml: function () {
          var userInfoXml = XmlApiFact.getUserInfo(xmlApiInfo);
          var siteInfoXml = XmlApiFact.getSiteInfo(xmlApiInfo);
          var meetingTypesInfoXml = XmlApiFact.getMeetingTypeInfo(xmlApiInfo);

          return $q.all({
            userInfoXml: userInfoXml,
            siteInfoXml: siteInfoXml,
            meetingTypesInfoXml: meetingTypesInfoXml
          });
        }, // getUserSettingsInfoXml()

        initPanel: function () {
          var funcName = "initPanel()";
          var logMsg = "";

          logMsg = funcName + ": " +
            "START";
          $log.log(logMsg);

          var _self = this;
          var webexSiteUrl = this.getSiteUrl();
          var webexSiteName = this.getSiteName(webexSiteUrl);

          angular.element('#reloadBtn').button('loading');
          angular.element('#reloadBtn2').button('loading');

          this.getSessionTicket(webexSiteUrl).then(
            function getSessionTicketSuccess(webexAdminSessionTicket) {
              angular.element('#reloadBtn').button('reset'); //Reset "try again" button to normal state
              angular.element('#reloadBtn2').button('reset'); //Reset "try again" button to normal state

              _self.initXmlApiInfo(
                webexSiteUrl,
                webexSiteName,
                webexAdminSessionTicket
              );

              userSettingsModel.sessionTicketErr = false;

              _self.getUserSettingsInfo();
            }, // getSessionTicketSuccess()

            function getSessionTicketError(errId) {
              var funcName = "initPanel().getSessionTicketError()";
              var logMsg = "";

              logMsg = funcName + ": " + "failed to get session ticket" + "\n" +
                "errId=" + errId;
              $log.log(logMsg);

              _self.setLoadingErrorDisplay(
                errId,
                true,
                true
              );

              logMsg = funcName + ": " + "\n" +
                "hasLoadError=" + userSettingsModel.hasLoadError + "\n" +
                "errMsg=" + userSettingsModel.errMsg + "\n" +
                "allowRetry=" + userSettingsModel.allowRetry + "\n" +
                "sessionTicketErr=" + userSettingsModel.sessionTicketErr;
              $log.log(logMsg);
            } // getSessionTicketError
          ); // WebExUserSettingsFact.getSessionTicket().then()
        }, // initPanel()

        getUserSettingsInfo: function () {
          var funcName = "getUserSettingsInfo()";
          var logMsg = "";

          logMsg = funcName + ": " + "START";
          $log.log(logMsg);

          var _self = this;

          angular.element('#reloadBtn').button('loading');
          angular.element('#reloadBtn2').button('loading');

          this.getUserSettingsInfoXml().then(
            function getUserSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getUserSettingsInfo().getUserSettingsInfoSuccess()";
              var logMsg = "";

              userSettingsModel.userInfo = _self.validateXmlData(
                "User Data",
                getInfoResult.userInfoXml,
                "<use:",
                "</serv:bodyContent>"
              );

              userSettingsModel.siteInfo = _self.validateXmlData(
                "Site Info",
                getInfoResult.siteInfoXml,
                "<ns1:",
                "</serv:bodyContent>"
              );

              userSettingsModel.meetingTypesInfo = _self.validateXmlData(
                "Meeting Types Info",
                getInfoResult.meetingTypesInfoXml,
                "<mtgtype:",
                "</serv:bodyContent>"
              );

              if (
                ("" === userSettingsModel.userInfo.errId) &&
                ("" === userSettingsModel.siteInfo.errId) &&
                ("" === userSettingsModel.meetingTypesInfo.errId)
              ) {

                _self.updateUserSettingsModelPart1();
                _self.updateUserSettingsModelPart2();
                _self.updateUserSettingsModelPart3();

                userSettingsModel.hasLoadError = false;
                userSettingsModel.viewReady = true; // only set this after the model has finished being updated

                angular.element('#reloadBtn').button('reset');
                angular.element('#reloadBtn2').button('reset');
              } else { // has invalid xml data
                logMsg = funcName + ": " + "\n" +
                  "userInfo.errId=" + userSettingsModel.userInfo.errId + "\n" +
                  "userInfo.errReason=" + userSettingsModel.userInfo.errReason + "\n" +
                  "siteInfo.errId=" + userSettingsModel.siteInfo.errId + "\n" +
                  "siteInfo.errReason=" + userSettingsModel.siteInfo.errReason + "\n" +
                  "meetingTypesInfo.errId=" + userSettingsModel.meetingTypesInfo.errId + "\n" +
                  "meetingTypesInfo.errReason=" + userSettingsModel.meetingTypesInfo.errReason;
                $log.log(logMsg);

                var errId = "";
                if ("" !== userSettingsModel.userInfo.errId) {
                  errId = userSettingsModel.userInfo.errId;
                } else if ("" !== userSettingsModel.siteInfo.errId) {
                  errId = userSettingsModel.siteInfo.errId;
                } else {
                  errId = userSettingsModel.meetingTypesInfo.errId;
                }

                _self.setLoadingErrorDisplay(
                  errId,
                  false,
                  true
                );

                logMsg = funcName + ": " + "\n" +
                  "hasLoadError=" + userSettingsModel.hasLoadError + "\n" +
                  "errMsg=" + userSettingsModel.errMsg + "\n" +
                  "allowRetry=" + userSettingsModel.allowRetry + "\n" +
                  "sessionTicketErr=" + userSettingsModel.sessionTicketErr;
                $log.log(logMsg);
              } // has invalid xml data
            }, // getUserSettingsInfoXmlSuccess()

            function getUserSettingsInfoXmlError(getInfoResult) {
              var funcName = "getUserSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);

              _self.setLoadingErrorDisplay(
                null,
                false,
                true
              );
            } // getUserSettingsInfoXmlError()
          ); // WebExUserSettingsFact.getUserSettingsInfoXml()
        }, // getUserSettingsInfo()

        setLoadingErrorDisplay: function (
          errId,
          sessionTicketErr,
          allowRetry
        ) {

          userSettingsModel.errMsg = this.getErrMsg(errId);
          userSettingsModel.viewReady = false;
          userSettingsModel.hasLoadError = true;
          userSettingsModel.sessionTicketErr = sessionTicketErr;
          userSettingsModel.allowRetry = allowRetry;

          angular.element('#reloadBtn').button('reset');
          angular.element('#reloadBtn2').button('reset');
        }, // setLoadingErrorDisplay()

        updateUserSettings: function (form) {
          var funcName = "updateUserSettings()";
          var logMsg = "";

          angular.element('#saveBtn').button('loading');
          angular.element('#saveBtn2').button('loading');

          var _self = this;
          var useSupportedServices = userSettingsModel.userInfo.bodyJson.use_supportedServices;

          var userSettings = {
            meetingTypes: [],
            meetingCenter: "false",
            trainingCenter: "false",
            supportCenter: "false",
            eventCenter: "false",
            salesCenter: "false"
          };

          // go through the session types
          userSettingsModel.sessionTypes.forEach(function (sessionType) {
            if (sessionType.sessionEnabled) {
              userSettings.meetingTypes.push(sessionType.sessionTypeId);
              if (userSettings.meetingCenter === "false") userSettings.meetingCenter = sessionType.meetingCenterApplicable ? "true" : "false";
              if (userSettings.trainingCenter === "false") userSettings.trainingCenter = sessionType.trainingCenterApplicable ? "true" : "false";
              if (userSettings.supportCenter === "false") userSettings.supportCenter = sessionType.supportCenterApplicable ? "true" : "false";
              if (userSettings.eventCenter === "false") userSettings.eventCenter = sessionType.eventCenterApplicable ? "true" : "false";
              if (userSettings.salesCenter === "false") userSettings.salesCenter = sessionType.salesCenterApplicable ? "true" : "false";
            }
          }); // userSettingsModel.sessionTypes.forEach()

          XmlApiFact.updateUserSettings(xmlApiInfo, userSettings).then(
            function updateUserSettingsSuccess(result) {
              angular.element('#saveBtn').button('reset');
              angular.element('#saveBtn2').button('reset');

              form.$dirty = false;
              form.$setPristine();

              var successMsg = $translate.instant("webexUserSettings.sessionEnablementUpdateSuccess");
              _self.processUpdateSuccessResult(
                result,
                successMsg);

              //flush waf cache
              XmlApiFact.flushWafCache(xmlApiInfo).then(function (result) { //success
                  $log.log("Flush success");
                }, //success
                function () { //fail
                  $log.log("Flush error");
                }); //fail
            }, // updateUserSettingsSuccess()

            function updateUserSettingsError(result) {
              angular.element('#saveBtn').button('reset');
              angular.element('#saveBtn2').button('reset');

              _self.updateUserSettingsError(result);
            } // updateUserSettingsError()
          );
        }, // updateUserSettings()

        updateUserSettings2: function (form) {
          var funcName = "updateUserSettings2()";
          var logMsg = "";

          angular.element('#saveBtn2').button('loading');

          var _self = this;

          xmlApiInfo.tollSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled;
          xmlApiInfo.toll = userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value;

          xmlApiInfo.tollFreeSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled;
          xmlApiInfo.tollFree = userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value;

          xmlApiInfo.teleconfViaGlobalCallInSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled;
          xmlApiInfo.teleconfViaGlobalCallIn = userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value;

          xmlApiInfo.callBackTeleconfSiteEnabled = userSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled;
          xmlApiInfo.callBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.value;

          xmlApiInfo.globalCallBackTeleconfSiteEnabled = userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled;
          xmlApiInfo.globalCallBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value;

          xmlApiInfo.otherTelephonySiteEnabled = userSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled;
          xmlApiInfo.otherTelephony = userSettingsModel.telephonyPriviledge.otherTeleconfServices.value;

          xmlApiInfo.integratedVoIPSiteEnabled = userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled;
          xmlApiInfo.integratedVoIP = userSettingsModel.telephonyPriviledge.integratedVoIP.value;

          xmlApiInfo.hiQualVideoSitenEnabled = userSettingsModel.videoSettings.hiQualVideo.isSiteEnabled;
          xmlApiInfo.hiQualVideo = userSettingsModel.videoSettings.hiQualVideo.value;

          xmlApiInfo.hiDefVideoSiteEnabled = userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled;
          xmlApiInfo.hiDefVideo = userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value;

          xmlApiInfo.eventCenterSiteEnabled = userSettingsModel.eventCenter.isSiteEnabled;
          xmlApiInfo.optimizeBandwidthUsageSiteEnabled = userSettingsModel.eventCenter.optimizeBandwidthUsage.isSiteEnabled;
          xmlApiInfo.optimizeBandwidthUsage = userSettingsModel.eventCenter.optimizeBandwidthUsage.value;

          xmlApiInfo.trainingCenterSiteEnabled = userSettingsModel.trainingCenter.isSiteEnabled;
          xmlApiInfo.handsOnLabAdminSiteEnabled = userSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled;
          xmlApiInfo.handsOnLabAdmin = userSettingsModel.trainingCenter.handsOnLabAdmin.value;

          XmlApiFact.updateUserSettings2(xmlApiInfo).then(
            function updateUserSettings2Success(result) {
              angular.element('#saveBtn2').button('reset');
              form.$dirty = false;
              form.$setPristine();

              var successMsg = $translate.instant("webexUserSettings.privilegesUpdateSuccess");
              _self.processUpdateSuccessResult(
                result,
                successMsg);
            }, // updateUserSettings2Success()

            function updateUserSettings2Error(result) {
              angular.element('#saveBtn2').button('reset');

              _self.updateUserSettingsError(result);
            } // updateUserSettings2Error()
          );
        }, // updateUserSettings2()

        processUpdateSuccessResult: function (result, successMsg) {
          var funcName = "processUpdateSuccessResult()";
          var logMsg = "";

          logMsg = funcName + ": " + "result=" + "\n" +
            result;
          $log.log(logMsg);

          var resultJson = this.validateXmlData(
            "Update user settings2 result",
            result,
            null,
            null
          );

          logMsg = funcName + ": " + "resultJson=" + "\n" +
            JSON.stringify(resultJson);
          $log.log(logMsg);

          if ("" === resultJson.errId) {
            Notification.notify([successMsg], 'success');
          } else {
            var notificationMsg = this.getErrMsg(resultJson.errId);
            Notification.notify([notificationMsg], 'error');
          }
        }, // processUpdateSuccessResult()

        updateUserSettingsError: function (result) {
          var funcName = "updateUserSettingsError()";
          var logMsg = "";

          logMsg = funcName + ": " + "result=" + "\n" +
            result;
          $log.log(logMsg);

          var errMsg = this.getErrMsg(null);
          Notification.notify([errMsg], 'error');
        }, // updateUserSettingsError()

        getErrMsg: function (errId) {
          var updateErrMsg = "";

          if (
            (null == errId) ||
            ("" === errId)
          ) {
            updateErrMsg = $translate.instant('webexUserSettingsAccessErrors.defaultAccessError');
          } else if (
            ("000000" === errId) ||
            ("000035" === errId) ||
            ("999999" === errId)
          ) {
            updateErrMsg = $translate.instant('webexUserSettingsAccessErrors.defaultProcessError');
          } else if ("030048" == errId) {
            updateErrMsg = $translate.instant('webexUserSettingsAccessErrors.defaultNotWebExAdminError');
          } else if ("030001" == errId) {
            var familyName = this.getFamilyName();
            var givenName = this.getGivenName();

            updateErrMsg = $translate.instant(
              "webexUserSettingsAccessErrors.030001", {
                givenName: givenName,
                familyName: familyName
              }
            );
          } else {
            updateErrMsg = $translate.instant('webexUserSettingsAccessErrors.' + errId);
          }

          return updateErrMsg;
        }, // setUpdateErrMsg()

        getSessionTicket: function (webexSiteUrl) {
          return XmlApiFact.getSessionTicket(webexSiteUrl);
        }, //getSessionTicket()

        getSiteUrl: function () {
          if (!$stateParams.site) {
            return "";
          }
          return $stateParams.site;
        }, //getSiteUrl

        getSiteName: function (siteUrl) {
          var index = siteUrl.indexOf(".");
          return siteUrl.slice(0, index);
        }, //getSiteName

      }; // return
    } //WebExUserSettingsFact
  ]); // angular
})();
