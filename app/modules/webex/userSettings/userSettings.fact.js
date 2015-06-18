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

          /*
          logMsg = funcName + ": " + "\n" +
            "commentText=" + commentText + "\n" +
            "infoXml=\n" + infoXml + "\n" +
            "startOfBodyStr=" + startOfBodyStr + "\n" +
            "endOfBodyStr=" + endOfBodyStr;
          $log.log(logMsg);
          */

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

        //pmrRequiresMeetingCenterPROorSTD

        getUserSettingsModel: function () {
          return userSettingsModel;
        }, // getUserSettingsModel()

        initUserSettingsModel: function () {
          userSettingsModel.viewReady = false;
          userSettingsModel.hasLoadError = false;
          userSettingsModel.allowRetry = false;
          userSettingsModel.sessionTicketErr = false;
          userSettingsModel.disableCancel = false;
          userSettingsModel.disableCancel2 = false;
          userSettingsModel.disableSave = false;
          userSettingsModel.disableSave2 = false;

          userSettingsModel.trainingCenter.handsOnLabAdmin.label = $translate.instant("webexUserSettingLabels.handsOnLabAdminLabel");

          userSettingsModel.eventCenter.optimizeBandwidthUsage.label = $translate.instant("webexUserSettingLabels.optimizeBandwidthUsageLabel");

          userSettingsModel.otherPrivilegesSection.label = $translate("webexUserSettingLabels.OtherPrivilegesLabel");
          userSettingsModel.pmr.label = $translate.instant("webexUserSettingLabels.pmrLabel");
          userSettingsModel.videoSettings.label = $translate.instant("webexUserSettingLabels.videoSettingsLabel");
          userSettingsModel.videoSettings.hiQualVideo.label = $translate.instant("webexUserSettingLabels.hiQualVideoLabel");
          userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.label = $translate.instant("webexUserSettingLabels.hiDefVideoLabel");

          userSettingsModel.telephonyPriviledge.label = $translate.instant("webexUserSettingLabels.telephonyPrivilegesLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.label = $translate.instant("webexUserSettingLabels.callInTeleconfLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].label = $translate.instant("webexUserSettingLabels.tollOnlyLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].label = $translate.instant("webexUserSettingLabels.tollAndTollFreeLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.label = $translate.instant("webexUserSettingLabels.teleconfViaGlobalCallinLabel");
          userSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.label = $translate.instant("webexUserSettingLabels.teleCLIAuthEnabledLabel");
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

        //returns true if pro or std meeting center or both are checked.
        //N.B. Purpose: If neither are checked, and PMR is on, 
        //then show error.  
        hasProOrStdMeetingCenter: function (sessionTypes) {
          $log.log("YURE sessionTypes=" + JSON.stringify(sessionTypes));
          var hasProOrStdMeetingCenter = false;
          sessionTypes.forEach(function (item) {
            var mca = item.meetingCenterApplicable;
            var sn = item.sessionName;
            var sessionNameisSTDorPRO =
              (sn === "PRO" ||
                sn === "STD");
            var sessionEnabled = item.sessionEnabled;
            $log.log("DESS sessionEnabled=" + sessionEnabled);
            $log.log("DESSN sessionName=" + sn + " mca=" + mca);
            if (sessionEnabled && sessionNameisSTDorPRO && mca) {
              hasProOrStdMeetingCenter = true;
            }
          });
          return hasProOrStdMeetingCenter;

        }, //hasProOrStdMeetingCenter

        isUserLevelPMREnabled: function () {
          var user = this.getUserSettingsModel();
          var hasPMR = user.pmr.value;
          return hasPMR;
        }, //isUserLevelPMREnabled.

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

          siteServiceTypes.forEach(
            function chkSiteServiceType(siteServiceType) {
              if (siteServiceType == userSettingsModel.meetingCenter.label) {
                userSettingsModel.meetingCenter.isSiteEnabled = true;
              } else if (siteServiceType == userSettingsModel.eventCenter.label) {
                userSettingsModel.eventCenter.isSiteEnabled = true;
              } else if (siteServiceType == userSettingsModel.trainingCenter.label) {
                userSettingsModel.trainingCenter.isSiteEnabled = true;
              } else if (siteServiceType == userSettingsModel.supportCenter.label) {
                userSettingsModel.supportCenter.isSiteEnabled = true;
              }
            } // chkSiteServiceType()
          ); // siteServiceTypes.forEach()
          // End of center status update

          // Start of Session Types update
          var sessionTypes = [];
          if (null != meetingTypesInfoJson.mtgtype_meetingType) {
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
          }

          userSettingsModel.sessionTypes = sessionTypes;
          var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

          /*
          logMsg = funcName + ": " + "\n" +
            "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
          $log.log(logMsg);
          */

          enabledSessionTypesIDs.forEach(
            function chkEnabledSessionTypeID(enabledSessionTypeID) { // loop through user's enabled session type
              userSettingsModel.sessionTypes.forEach(function (sessionType) {
                var sessionTypeId = sessionType.sessionTypeId;

                /*
                logMsg = funcName + ": " + "\n" +
                  "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                  "sessionTypeId=" + sessionTypeId;
                $log.log(logMsg);
                */

                if (sessionType.sessionTypeId == enabledSessionTypeID) {
                  sessionType.sessionEnabled = true;
                }
              }); // userSettingsModel.sessionTypes.forEach()
            } // chkEnabledSessionTypeID()
          ); // enabledSessionTypesIDs.forEach()
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

          userSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_teleCLIAuthEnabled
          ) ? true : false;

          userSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.value = (
            "true" == userInfoJson.use_privilege.use_teleCLIAuthEnabled
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

          //console.log("HERE -------");
          //var enablePMRSiteLevel = siteInfoJson.ns1_siteInstance.ns1_siteCommonOptions.ns1_enablePersonalMeetingRoom;
          //console.log("ENABLE PMR SITE LEVEL=" + enablePMRSiteLevel);
          userSettingsModel.pmr.isSiteEnabled = (
            //"true" == enablePMRSiteLevel
            true
          ) ? true : false;

          userSettingsModel.pmr.value = (
            "true" == userInfoJson.use_privilege.use_isEnablePMR
          ) ? true : false;
          $log.log("----> PMR = " + userSettingsModel.pmr.value);

          userSettingsModel.cmr.value = (
            "true" == userInfoJson.use_privilege.use_isEnableCET
          ) ? true : false;
          $log.log("----> CMR = " + userSettingsModel.cmr.value);

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

          /*
          logMsg = funcName + ": " +
            "START";
          $log.log(logMsg);
          */

          angular.element('#reloadBtn').button('loading');
          angular.element('#reloadBtn2').button('loading');

          var _self = this;
          var webexSiteUrl = this.getSiteUrl();
          var webexSiteName = this.getSiteName(webexSiteUrl);

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

              /*
              logMsg = funcName + ": " + "failed to get session ticket" + "\n" +
                "errId=" + errId;
              $log.log(logMsg);
              */

              _self.setLoadingErrorDisplay(
                errId,
                true,
                true,
                null
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

        getUserSettingsInfo: function (form) {
          var funcName = "getUserSettingsInfo()";
          var logMsg = "";

          logMsg = funcName + ": " + "START";
          $log.log(logMsg);

          userSettingsModel.disableSave = true;
          userSettingsModel.disableSave2 = true;

          angular.element('#reloadBtn').button('loading');
          angular.element('#reloadBtn2').button('loading');

          angular.element('#resetBtn').button('loading');
          angular.element('#resetBtn2').button('loading');

          var _self = this;

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

                if (null != form) {
                  form.$setPristine();
                  form.$setUntouched();
                }
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
                  true,
                  form
                );

                logMsg = funcName + ": " + "\n" +
                  "hasLoadError=" + userSettingsModel.hasLoadError + "\n" +
                  "errMsg=" + userSettingsModel.errMsg + "\n" +
                  "allowRetry=" + userSettingsModel.allowRetry + "\n" +
                  "sessionTicketErr=" + userSettingsModel.sessionTicketErr;
                $log.log(logMsg);
              } // has invalid xml data

              userSettingsModel.disableSave = false;
              userSettingsModel.disableSave2 = false;
            }, // getUserSettingsInfoXmlSuccess()

            function getUserSettingsInfoXmlError(getInfoResult) {
              var funcName = "getUserSettingsInfoXmlError()";
              var logMsg = "";

              logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
              $log.log(logMsg);

              _self.setLoadingErrorDisplay(
                null,
                false,
                true,
                form
              );

              userSettingsModel.disableSave = false;
              userSettingsModel.disableSave2 = false;
            } // getUserSettingsInfoXmlError()
          ); // WebExUserSettingsFact.getUserSettingsInfoXml()
        }, // getUserSettingsInfo()

        setLoadingErrorDisplay: function (
          errId,
          sessionTicketErr,
          allowRetry,
          form
        ) {
          userSettingsModel.errMsg = this.getErrMsg(errId, null);
          userSettingsModel.viewReady = false;
          userSettingsModel.hasLoadError = true;
          userSettingsModel.sessionTicketErr = sessionTicketErr;
          userSettingsModel.allowRetry = allowRetry;

          angular.element('#reloadBtn').button('reset');
          angular.element('#reloadBtn2').button('reset');

          if (null != form) {
            form.$setPristine();
            form.$setUntouched();
          }
        }, // setLoadingErrorDisplay()

        updateUserSettings: function (form) {
          var funcName = "updateUserSettings()";
          var logMsg = "";

          userSettingsModel.disableCancel = true;

          angular.element('#saveBtn').button('loading');

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
          userSettingsModel.sessionTypes.forEach(
            function chkSessionType(sessionType) {
              if (sessionType.sessionEnabled) {
                userSettings.meetingTypes.push(sessionType.sessionTypeId);
                if (userSettings.meetingCenter === "false") userSettings.meetingCenter = sessionType.meetingCenterApplicable ? "true" : "false";
                if (userSettings.trainingCenter === "false") userSettings.trainingCenter = sessionType.trainingCenterApplicable ? "true" : "false";
                if (userSettings.supportCenter === "false") userSettings.supportCenter = sessionType.supportCenterApplicable ? "true" : "false";
                if (userSettings.eventCenter === "false") userSettings.eventCenter = sessionType.eventCenterApplicable ? "true" : "false";
                if (userSettings.salesCenter === "false") userSettings.salesCenter = sessionType.salesCenterApplicable ? "true" : "false";
              }
            } // chkSessionType()
          ); // userSettingsModel.sessionTypes.forEach()

          //so this is true if he has PMR but does not have PRO or STD.
          var blockDueToPMR = _self.isUserLevelPMREnabled() &&
            !_self.hasProOrStdMeetingCenter(userSettingsModel.sessionTypes);
          $log.log("DURE blockDueToPMR=" + blockDueToPMR);
          if (blockDueToPMR) {

            angular.element('#saveBtn').button('reset');
            angular.element('#saveBtn2').button('reset');
            userSettingsModel.disableCancel = false;
            userSettingsModel.disableCancel2 = false;
            var errMessage = $translate.instant("webexUserSettings.mustHavePROorSTDifPMRenabled");
            Notification.notify([errMessage], 'error');
            return;
          }

          XmlApiFact.updateUserSettings(xmlApiInfo, userSettings).then(
            function updateUserSettingsSuccess(result) {
              _self.processUpdateResponse(
                form,
                result,
                true,
                "webexUserSettings.sessionEnablementUpdateSuccess"
              );
            }, // updateUserSettingsSuccess()

            function updateUserSettingsError(result) {
              _self.processNoUpdateResponse(result);
            } // updateUserSettingsError()
          );
        }, // updateUserSettings()

        updateUserSettings2: function (form) {
          var funcName = "updateUserSettings2()";
          var logMsg = "";

          userSettingsModel.disableCancel2 = true;

          angular.element('#saveBtn2').button('loading');

          switch (userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType) {
          case 1:
            userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = true;
            userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = false;
            break;

          case 2:
            userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = true;
            userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = true;
            break;

          default:
            userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = false;
            userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = false;
            break;
          } // switch()

          logMsg = funcName + ": " + "\n" +
            "selectedCallInTollType=" + userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType + "\n" +
            "toll.value=" + userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value + "\n" +
            "tollFree.value=" + userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value;

          var _self = this;

          xmlApiInfo.tollSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled;
          xmlApiInfo.toll = userSettingsModel.telephonyPriviledge.callInTeleconf.toll.value;

          xmlApiInfo.tollFreeSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled;
          xmlApiInfo.tollFree = userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value;

          xmlApiInfo.teleconfViaGlobalCallInSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled;
          xmlApiInfo.teleconfViaGlobalCallIn = userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value;

          xmlApiInfo.teleCLIAuthEnabledSiteEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.isSiteEnabled;
          xmlApiInfo.teleCLIAuthEnabled = userSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.value;

          xmlApiInfo.callBackTeleconfSiteEnabled = userSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled;
          xmlApiInfo.callBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.value;

          xmlApiInfo.globalCallBackTeleconfSiteEnabled = userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled;
          xmlApiInfo.globalCallBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value;

          xmlApiInfo.otherTelephonySiteEnabled = userSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled;
          xmlApiInfo.otherTelephony = userSettingsModel.telephonyPriviledge.otherTeleconfServices.value;

          xmlApiInfo.integratedVoIPSiteEnabled = userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled;
          xmlApiInfo.integratedVoIP = userSettingsModel.telephonyPriviledge.integratedVoIP.value;

          xmlApiInfo.isEnablePMRSiteEnabled = userSettingsModel.pmr.isSiteEnabled;
          xmlApiInfo.isEnablePMR = userSettingsModel.pmr.value;

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

          if ((userSettingsModel.pmr.value === true) && (userSettingsModel.cmr.value === true) && (userSettingsModel.telephonyPriviledge.callInTeleconf.value === false)) {
            var updateStatus = "error";
            var notificationMsg = $translate.instant("webexUserSettings.pmrErrorTelephonyPrivileges");
            Notification.notify([notificationMsg], updateStatus);
            angular.element('#saveBtn2').button('reset');
            userSettingsModel.disableCancel2 = false;
          } else {

            XmlApiFact.updateUserSettings2(xmlApiInfo).then(
              function updateUserSettings2Success(result) {
                _self.processUpdateResponse(
                  form,
                  result,
                  false,
                  "webexUserSettings.privilegesUpdateSuccess"
                );
              }, // updateUserSettings2Success()

              function updateUserSettings2Error(result) {
                _self.processNoUpdateResponse(result);
              } // updateUserSettings2Error()
            );
          }
        }, // updateUserSettings2()

        processUpdateResponse: function (
          form,
          result,
          flushWaf,
          successMsg
        ) {
          var funcName = "processUpdateResponse()";
          var logMsg = "";

          /*
          logMsg = funcName + ": " + "\n" +
            "flushWaf=" + flushWaf + "\n" +
            "result=" + "\n" + result;
          $log.log(logMsg);
          */

          var resultJson = this.validateXmlData(
            "Update user settings2 result",
            result,
            null,
            null
          );

          logMsg = funcName + ": " + "resultJson=" + "\n" +
            JSON.stringify(resultJson);
          $log.log(logMsg);

          var updateStatus = "success";
          var notificationMsg = $translate.instant(successMsg);

          // verify whether the update request completed without error
          if ("" === resultJson.errId) {
            if (flushWaf) {
              XmlApiFact.flushWafCache(xmlApiInfo).then(
                function flushWafCacheSuccess(result) { //success
                  $log.log("Flush success");
                }, // flushWafCacheSuccess()

                function flushWafCacheError() { //fail
                  $log.log("Flush error");
                } // flushWafCacheError()
              );
            }

            form.$dirty = false;
            form.$setPristine();
          } else {
            updateStatus = "error";
            notificationMsg = this.getErrMsg(
              resultJson.errId,
              resultJson.headerJson.serv_header.serv_response.serv_value
            );
          }

          angular.element('#saveBtn').button('reset');
          angular.element('#saveBtn2').button('reset');

          userSettingsModel.disableCancel = false;
          userSettingsModel.disableCancel2 = false;

          Notification.notify([notificationMsg], updateStatus);
        }, // processUpdateResponse()

        processNoUpdateResponse: function (result) {
          var funcName = "processNoUpdateResponse()";
          var logMsg = "";

          logMsg = funcName + ": " + "result=" + "\n" +
            result;
          $log.log(logMsg);

          angular.element('#saveBtn').button('reset');
          angular.element('#saveBtn2').button('reset');

          userSettingsModel.disableCancel = false;
          userSettingsModel.disableCancel2 = false;

          var errMsg = this.getErrMsg(null, null);
          Notification.notify([errMsg], 'error');
        }, // processNoUpdateResponse()

        getErrMsg: function (errId, errValue) {
          var funcName = "getErrMsg()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "errId=" + errId + "\n" +
            "errValue=" + errValue;
          $log.log(logMsg);

          var errMsg = "";

          if (
            (null == errId) ||
            ("" === errId)
          ) {
            errMsg = $translate.instant('webexUserSettingsAccessErrors.defaultAccessError');
          } else if (
            ("000000" === errId) ||
            ("000035" === errId) ||
            ("999999" === errId)
          ) {
            errMsg = $translate.instant('webexUserSettingsAccessErrors.defaultProcessError');
          } else if ("030048" == errId) {
            errMsg = $translate.instant('webexUserSettingsAccessErrors.defaultNotWebExAdminError');
          } else if ("030001" == errId) {
            var familyName = this.getFamilyName();
            var givenName = this.getGivenName();

            errMsg = $translate.instant(
              "webexUserSettingsAccessErrors.030001", {
                givenName: givenName,
                familyName: familyName
              }
            );
          } else if ("110055" == errId) {
            var sessionTypeName = "???";

            userSettingsModel.sessionTypes.forEach(
              function chkSessionType(sessionType) {
                logMsg = funcName + ": " + "\n" +
                  "sessionType=" + JSON.stringify(sessionType);
                $log.log(logMsg);

                if (sessionType.sessionTypeId == errValue) {
                  sessionTypeName = sessionType.sessionDescription;
                }
              } // chkSessionType()
            ); // userSettingsModel.sessionTypes.forEach()

            logMsg = funcName + ": " + "\n" +
              "errId=" + errId + "\n" +
              "errValue=" + errValue + "\n" +
              "sessionTypeName=" + sessionTypeName;
            $log.log(logMsg);

            errMsg = $translate.instant(
              "webexUserSettingsAccessErrors.110055", {
                sessionTypeName: sessionTypeName
              }
            );
          } else {
            errMsg = $translate.instant('webexUserSettingsAccessErrors.' + errId);
          }

          logMsg = funcName + ": " + "\n" +
            "errMsg=" + errMsg;
          $log.log(logMsg);

          return errMsg;
        }, // getErrMsg()

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
