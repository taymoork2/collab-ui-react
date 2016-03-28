(function () {
  'use strict';

  angular.module('WebExApp').factory('WebExUserSettingsFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'Authinfo',
    'Notification',
    'Orgservice',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebexUserSettingsSvc',
    'WebExXmlApiInfoSvc',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      Authinfo,
      Notification,
      Orgservice,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExUserSettingsModel,
      webExXmlApiInfo
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

        //pmrRequiresMeetingCenterPROorSTD

        getUserSettingsModel: function () {
          return webExUserSettingsModel;
        }, // getUserSettingsModel()

        initUserSettingsModel: function () {
          var funcName = "initUserSettingsModel()";
          var logMsg = "";

          webExUserSettingsModel.meetingCenter.isEntitledOnAtlas = false;
          webExUserSettingsModel.trainingCenter.isEntitledOnAtlas = false;
          webExUserSettingsModel.eventCenter.isEntitledOnAtlas = false;
          webExUserSettingsModel.supportCenter.isEntitledOnAtlas = false;

          webExUserSettingsModel.meetingCenter.isEntitledOnWebEx = false;
          webExUserSettingsModel.trainingCenter.isEntitledOnWebEx = false;
          webExUserSettingsModel.eventCenter.isEntitledOnWebEx = false;
          webExUserSettingsModel.supportCenter.isEntitledOnWebEx = false;

          webExUserSettingsModel.siteInfo = null;
          webExUserSettingsModel.meetingTypesInfo = null;
          webExUserSettingsModel.siteVersionInfo = null;

          webExUserSettingsModel.viewReady = false;
          webExUserSettingsModel.hasLoadError = false;
          webExUserSettingsModel.allowRetry = false;
          webExUserSettingsModel.sessionTicketErr = false;
          webExUserSettingsModel.disableCancel = false;
          webExUserSettingsModel.disableCancel2 = false;
          webExUserSettingsModel.disableSave = false;
          webExUserSettingsModel.disableSave2 = false;
          webExUserSettingsModel.isT31Site = false;

          webExUserSettingsModel.trainingCenter.handsOnLabAdmin.label = $translate.instant("webexUserSettingLabels.handsOnLabAdminLabel");
          webExUserSettingsModel.eventCenter.optimizeBandwidthUsage.label = $translate.instant("webexUserSettingLabels.optimizeBandwidthUsageLabel");
          webExUserSettingsModel.otherPrivilegesSection.label = $translate("webexUserSettingLabels.OtherPrivilegesLabel");
          webExUserSettingsModel.pmr.label = $translate.instant("webexUserSettingLabels.pmrLabel");

          webExUserSettingsModel.videoSettings.label = $translate.instant("webexUserSettingLabels.videoSettingsLabel");
          webExUserSettingsModel.videoSettings.hiQualVideo.label = $translate.instant("webexUserSettingLabels.hiQualVideoLabel");
          webExUserSettingsModel.videoSettings.hiQualVideo.hiDefVideo.label = $translate.instant("webexUserSettingLabels.hiDefVideoLabel");

          webExUserSettingsModel.telephonyPriviledge.label = $translate.instant("webexUserSettingLabels.telephonyPrivilegesLabel");
          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.label = $translate.instant("webexUserSettingLabels.callInTeleconfLabel");
          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[0].label = $translate.instant("webexUserSettingLabels.tollOnlyLabel");
          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.callInTollTypes[1].label = $translate.instant("webexUserSettingLabels.tollAndTollFreeLabel");
          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.label = $translate.instant("webexUserSettingLabels.teleconfViaGlobalCallinLabel");
          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.label = $translate.instant("webexUserSettingLabels.teleCLIAuthEnabledLabel");
          webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.label = $translate.instant("webexUserSettingLabels.callBackTeleconfLabel");
          webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.label = $translate.instant("webexUserSettingLabels.globalCallBackTeleconfLabel");
          webExUserSettingsModel.telephonyPriviledge.integratedVoIP.label = $translate.instant("webexUserSettingLabels.integratedVoIPLaabel");

          return webExUserSettingsModel;
        }, // initUserSettingsModel()

        initXmlApiInfo: function (
          webexSiteUrl,
          webexSiteName,
          webexAdminSessionTicket
        ) {
          webExXmlApiInfo.xmlApiUrl = "https://" + webexSiteUrl + "/WBXService/XMLService";
          webExXmlApiInfo.webexSiteName = webexSiteName;
          webExXmlApiInfo.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfo.webexAdminSessionTicket = webexAdminSessionTicket;
          webExXmlApiInfo.webexUserId = $stateParams.currentUser.userName;
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
        }, //isUserLevelPMREnabled

        updateCenterLicenseEntitlements: function () {
          var funcName = "updateCenterLicenseEntitlements()";
          var logMsg = null;

          var userInfoJson = webExUserSettingsModel.userInfo.bodyJson;

          webExUserSettingsModel.meetingCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_meetingCenter) ? true : false;
          webExUserSettingsModel.trainingCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_trainingCenter) ? true : false;
          webExUserSettingsModel.eventCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_eventCenter) ? true : false;
          webExUserSettingsModel.supportCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_supportCenter) ? true : false;

          logMsg = funcName + "\n" +
            "meetingCenter.isEntitledOnWebEx=" + webExUserSettingsModel.meetingCenter.isEntitledOnWebEx + "\n" +
            "trainingCenter.isEntitledOnWebEx=" + webExUserSettingsModel.trainingCenter.isEntitledOnWebEx + "\n" +
            "eventCenter.isEntitledOnWebEx=" + webExUserSettingsModel.eventCenter.isEntitledOnWebEx + "\n" +
            "supportCenter.isEntitledOnWebEx=" + webExUserSettingsModel.supportCenter.isEntitledOnWebEx + "\n" +
            "\n" +
            "meetingCenter.isEntitledOnAtlas=" + webExUserSettingsModel.meetingCenter.isEntitledOnAtlas + "\n" +
            "trainingCenter.isEntitledOnAtlas=" + webExUserSettingsModel.trainingCenter.isEntitledOnAtlas + "\n" +
            "eventCenter.isEntitledOnAtlas=" + webExUserSettingsModel.eventCenter.isEntitledOnAtlas + "\n" +
            "supportCenter.isEntitledOnAtlas=" + webExUserSettingsModel.supportCenter.isEntitledOnAtlas;
          $log.log(logMsg);
        }, // updateCenterLicenseEntitlements()

        updateUserSettingsModelPart1: function () {
          var funcName = "updateUserSettingsModelPart1()";
          var logMsg = null;

          var userInfoJson = webExUserSettingsModel.userInfo.bodyJson;
          var siteInfoJson = webExUserSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = webExUserSettingsModel.meetingTypesInfo.bodyJson;
          var siteVersionInfoJson = webExUserSettingsModel.siteVersionInfo.bodyJson;

          webExUserSettingsModel.meetingCenter.isSiteEnabled = false;
          webExUserSettingsModel.eventCenter.isSiteEnabled = false;
          webExUserSettingsModel.trainingCenter.isSiteEnabled = false;
          webExUserSettingsModel.supportCenter.isSiteEnabled = false;

          // Start of center status update
          var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          siteServiceTypes.forEach(
            function chkSiteServiceType(siteServiceType) {
              if (siteServiceType == webExUserSettingsModel.meetingCenter.label) {
                webExUserSettingsModel.meetingCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExUserSettingsModel.eventCenter.label) {
                webExUserSettingsModel.eventCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExUserSettingsModel.trainingCenter.label) {
                webExUserSettingsModel.trainingCenter.isSiteEnabled = true;
              } else if (siteServiceType == webExUserSettingsModel.supportCenter.label) {
                webExUserSettingsModel.supportCenter.isSiteEnabled = true;
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
                    if (webExUserSettingsModel.meetingCenter.serviceType == siteMtgServiceType) {
                      meetingCenterApplicable = true;
                    } else if (webExUserSettingsModel.eventCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        eventCenterApplicable = true;
                      }
                    } else if (webExUserSettingsModel.trainingCenter.serviceType == siteMtgServiceType) {
                      if ("AUO" != siteMtgProductCodePrefix) {
                        trainingCenterApplicable = true;
                      }
                    } else if (webExUserSettingsModel.supportCenter.serviceType == siteMtgServiceType) {
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
          }

          webExUserSettingsModel.sessionTypes = sessionTypes;
          var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

          /*
          logMsg = funcName + ": " + "\n" +
            "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
          $log.log(logMsg);
          */

          enabledSessionTypesIDs.forEach(
            function chkEnabledSessionTypeID(enabledSessionTypeID) { // loop through user's enabled session type
              webExUserSettingsModel.sessionTypes.forEach(function (sessionType) {
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
              }); // webExUserSettingsModel.sessionTypes.forEach()
            } // chkEnabledSessionTypeID()
          ); // enabledSessionTypesIDs.forEach()
          // End of Session Types update
        }, // updateUserSettingsModelPart1()

        updateUserSettingsModelPart2: function () {
          var funcName = "updateUserSettingsModelPart2()";
          var logMsg = null;

          var userInfoJson = webExUserSettingsModel.userInfo.bodyJson;
          var siteInfoJson = webExUserSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = webExUserSettingsModel.meetingTypesInfo.bodyJson;
          var siteVersionInfoJson = webExUserSettingsModel.siteVersionInfo.bodyJson;

          // Start of Telephony privileges
          webExUserSettingsModel.telephonyPriviledge.hybridVoipOnly.isSiteEnabled = ("true" === siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridVoipOnly);

          webExUserSettingsModel.telephonyPriviledge.hybridAudio.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.telephonyType.isWebExAudio = (siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_isTSPUsingTelephonyAPI == "false" && //not TSP audio
            siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_meetingPlace.ns1_persistentTSP == "false") ? true : false; // not MP audio

          webExUserSettingsModel.telephonyPriviledge.telephonyType.isTspAudio = (siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_isTSPUsingTelephonyAPI == "true") ? true : false;

          logMsg = funcName + ": " + "\n" +
            "Hybrid audio=" + webExUserSettingsModel.telephonyPriviledge.hybridAudio.isSiteEnabled + "\n" +
            "WebEx audio=" + webExUserSettingsModel.telephonyPriviledge.telephonyType.isWebExAudio + "\n" +
            "TSP audio=" + webExUserSettingsModel.telephonyPriviledge.telephonyType.isTspAudio;
          $log.log(logMsg);

          // Start of call-in teleconf
          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallIn
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = (
            "true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.value = (
            (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value) ||
            (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value)
          ) ? true : false;

          if (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value) {
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 2;
          } else if (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value) {
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 1;
          } else {
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 0;
          }

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_intlCallInTeleconferencing
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallInInternational
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_teleCLIAuthEnabled
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.value = (
            "true" == userInfoJson.use_privilege.use_teleCLIAuthEnabled
          ) ? true : false;

          logMsg = funcName + ": " + "\n" +
            "ns1_callInTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing + "\n" +
            "ns1_tollFreeCallinTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing + "\n" +
            "use_teleConfCallIn=" + userInfoJson.use_privilege.use_teleConfCallIn + "\n" +
            "use_teleConfTollFreeCallIn=" + userInfoJson.use_privilege.use_teleConfTollFreeCallIn + "\n" +
            "toll.isSiteEnabled=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled + "\n" +
            "toll.value=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value + "\n" +
            "tollFree.isSiteEnabled=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled + "\n" +
            "tollFree.value=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value + "\n" +
            "callInTeleconf=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.value + "\n" +
            "callInTeleconf.selectedCallInTollType=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType;
          $log.log(logMsg);
          // End of call-in teleconf

          webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallOut
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_intlCallBackTeleconferencing
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = (
            "true" == userInfoJson.use_privilege.use_teleConfCallOutInternational
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_supportOtherTypeTeleconf
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.otherTeleconfServices.value = (
            "true" == userInfoJson.use_privilege.use_otherTelephony
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.otherTeleconfServices.label = siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_otherTeleServiceName;

          webExUserSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone
          ) ? true : false;

          webExUserSettingsModel.telephonyPriviledge.integratedVoIP.value = (
            "true" == userInfoJson.use_privilege.use_voiceOverIp
          ) ? true : false;

          logMsg = funcName + ": " + "\n" +
            "integratedVoIP.isSiteEnabled=" + webExUserSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled + "\n" +
            "integratedVoIP.value=" + webExUserSettingsModel.telephonyPriviledge.integratedVoIP.value;
          $log.log(logMsg);
          // End of Telephony privileges
        }, // updateUserSettingsModelPart2()

        updateUserSettingsModelPart3: function () {
          var funcName = "updateUserSettingsModelPart3()";
          var logMsg = null;

          var userInfoJson = webExUserSettingsModel.userInfo.bodyJson;
          var siteInfoJson = webExUserSettingsModel.siteInfo.bodyJson;
          var meetingTypesInfoJson = webExUserSettingsModel.meetingTypesInfo.bodyJson;
          var siteVersionInfoJson = webExUserSettingsModel.siteVersionInfo.bodyJson;

          var enablePMRSiteLevel = siteInfoJson.ns1_siteInstance.ns1_siteCommonOptions.ns1_enablePersonalMeetingRoom;
          webExUserSettingsModel.pmr.isSiteEnabled = (
            "true" == enablePMRSiteLevel
          ) ? true : false;

          webExUserSettingsModel.pmr.value = (
            "true" == userInfoJson.use_privilege.use_isEnablePMR
          ) ? true : false;
          $log.log("PMR = " + webExUserSettingsModel.pmr.value);

          webExUserSettingsModel.cmr.value = (
            "true" == userInfoJson.use_privilege.use_isEnableCET
          ) ? true : false;
          $log.log("CMR = " + webExUserSettingsModel.cmr.value);

          // Start of Video privileges
          webExUserSettingsModel.videoSettings.hiQualVideo.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_video.ns1_HQvideo
          ) ? true : false;

          webExUserSettingsModel.videoSettings.hiQualVideo.value = (
            "true" == userInfoJson.use_privilege.use_HQvideo
          ) ? true : false;

          if (!webExUserSettingsModel.videoSettings.hiQualVideo.isSiteEnabled) {
            webExUserSettingsModel.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled = false;
          } else {
            webExUserSettingsModel.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled = (
              "true" == siteInfoJson.ns1_siteInstance.ns1_video.ns1_HDvideo
            ) ? true : false;
          }

          webExUserSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value = (
            "true" == userInfoJson.use_privilege.use_HDvideo
          ) ? true : false;
          // End of Video privileges

          // Start of Event Center
          webExUserSettingsModel.eventCenter.optimizeBandwidthUsage.isSiteEnabled = (
            ("true" == siteInfoJson.ns1_siteInstance.ns1_supportedServices.ns1_eventCenter.ns1_optimizeAttendeeBandwidthUsage)
          ) ? true : false;

          webExUserSettingsModel.eventCenter.optimizeBandwidthUsage.value = (
            "true" == userInfoJson.use_eventCenter.use_optimizeAttendeeBandwidthUsage
          ) ? true : false;
          // End of Event Center

          // Start of Training Center privileges
          webExUserSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = (
            ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab)
          ) ? true : false;

          webExUserSettingsModel.trainingCenter.handsOnLabAdmin.value = (
            "true" == userInfoJson.use_privilege.use_labAdmin
          ) ? true : false;
          // End of Training Center privileges
        }, // updateUserSettingsModelPart3()

        getUserInfoXml: function () {
          var xmlData = WebExXmlApiFact.getUserInfo(webExXmlApiInfo);

          return $q.all(xmlData);
        }, // getUserInfoXml()

        getSiteInfoXml: function () {
          var xmlData = WebExXmlApiFact.getSiteInfo(webExXmlApiInfo);

          return $q.all(xmlData);
        }, // getSiteInfoXml()

        getMeetingTypeInfoXml: function () {
          var xmlData = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfo);

          return $q.all(xmlData);
        }, // getMeetingTypeInfoXml()

        getSiteVersionInfoXml: function () {
          var siteVersionInfoXml = WebExXmlApiFact.getSiteVersion(webExXmlApiInfo);

          return siteVersionInfoXml;
        }, // getSiteVersionInfoXml()

        getUserSettingsInfoXml: function () {
          var userInfoXml = WebExXmlApiFact.getUserInfo(webExXmlApiInfo);
          var siteInfoXml = WebExXmlApiFact.getSiteInfo(webExXmlApiInfo);
          var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(webExXmlApiInfo);

          return $q.all({
            userInfoXml: userInfoXml,
            siteInfoXml: siteInfoXml,
            meetingTypesInfoXml: meetingTypesInfoXml
          });
        }, // getUserSettingsInfoXml()

        getUserWebExEntitlementFromAtlas: function () {
          var funcName = "getUserWebExEntitlementFromAtlas";
          var logMsg = "";

          Orgservice.getValidLicenses().then(
            function getOrgLicensesSuccess(orgLicenses) {
              var funcName = "getOrgLicensesSuccess()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "orgLicenses=" + JSON.stringify(orgLicenses);
              // $log.log(logMsg);

              var currSite = $stateParams.site;
              var userName = $stateParams.currentUser.userName;
              var userLicenses = $stateParams.currentUser.licenseID;

              logMsg = funcName + "\n" +
                "userLicenses=" + JSON.stringify(userLicenses);
              // $log.log(logMsg);

              userLicenses.forEach(
                function checkLicense(userLicense) {
                  var funcName = "checkLicense()";
                  var logMsg = "";

                  var userLicenseItems = userLicense.split("_");
                  var userLicenseType = userLicenseItems[0];

                  // only check for webex center type of license
                  if (
                    ("EE" == userLicenseType) ||
                    ("MC" == userLicenseType) ||
                    ("EC" == userLicenseType) ||
                    ("SC" == userLicenseType) ||
                    ("TC" == userLicenseType) ||
                    ("CMR" == userLicenseType)
                  ) {

                    var userLicenseSiteUrl = userLicenseItems[userLicenseItems.length - 1];

                    logMsg = funcName + "\n" +
                      "currSite=" + currSite + "\n" +
                      "userName=" + userName + "\n" +
                      "userLicense=" + userLicense;
                    // $log.log(logMsg);

                    // check that the license is for the current site
                    if (userLicenseSiteUrl == currSite) {
                      // verify that the user's webex center license is valid for the org
                      orgLicenses.forEach(
                        function compareOrgLicense(orgLicense) {
                          var funcName = "";
                          var logMsg = "";

                          logMsg = funcName + "\n" +
                            "orgLicense=" + JSON.stringify(orgLicense) + "\n" +
                            "userLicense=" + JSON.stringify(userLicense);
                          // $log.log(logMsg);

                          if (userLicense == orgLicense.licenseId) {
                            if ("EE" == userLicenseType) {
                              webExUserSettingsModel.meetingCenter.isEntitledOnAtlas = true;
                              webExUserSettingsModel.trainingCenter.isEntitledOnAtlas = true;
                              webExUserSettingsModel.eventCenter.isEntitledOnAtlas = true;
                              webExUserSettingsModel.supportCenter.isEntitledOnAtlas = true;
                            } else {
                              if (webExUserSettingsModel.meetingCenter.id == userLicenseType) {
                                webExUserSettingsModel.meetingCenter.isEntitledOnAtlas = true;
                              } else if (webExUserSettingsModel.trainingCenter.id == userLicenseType) {
                                webExUserSettingsModel.trainingCenter.isEntitledOnAtlas = true;
                              } else if (webExUserSettingsModel.eventCenter.id == userLicenseType) {
                                webExUserSettingsModel.eventCenter.isEntitledOnAtlas = true;
                              } else if (webExUserSettingsModel.supportCenter.id == userLicenseType) {
                                webExUserSettingsModel.supportCenter.isEntitledOnAtlas = true;
                              }
                            }
                          }
                        } // compareOrgLicense()
                      ); // orgLicenses.forEach()
                    }
                  }
                } // checkLicense()
              ); // userLicenses.forEach(()
            }, // getOrgLicensesSuccess()

            function getOrgLicensesError(response) {
              var funcName = "getOrgLicensesError()";
              var logMsg = "";

              logMsg = funcName + ": " + "\n" +
                "response=" + JSON.stringify(response);
              $log.log(logMsg);
            } // getOrgLicensesError()
          ); // Orgservice.getValidLicenses().then()
        }, // getUserWebExEntitlementFromAtlas()

        getUserSettingsFromWebEx: function () {
          var funcName = "getUserSettingsFromWebEx()";
          var logMsg = "";

          angular.element('#reloadBtn').button('loading');
          angular.element('#reloadBtn2').button('loading');

          var _self = this;
          var webexSiteUrl = this.getSiteUrl();
          var webexSiteName = WebExUtilsFact.getSiteName(webexSiteUrl);

          this.getSessionTicket(webexSiteUrl).then(
            function getSessionTicketSuccess(webexAdminSessionTicket) {
              angular.element('#reloadBtn').button('reset'); //Reset "try again" button to normal state
              angular.element('#reloadBtn2').button('reset'); //Reset "try again" button to normal state

              _self.initXmlApiInfo(
                webexSiteUrl,
                webexSiteName,
                webexAdminSessionTicket
              );

              webExUserSettingsModel.sessionTicketErr = false;

              _self.getSiteVersionInfoXml().then(
                function getSiteVersionInfoXmlSuccess(siteVersionInfoXml) {
                  var funcName = "getSiteVersionInfoXmlSuccess()";
                  var logMsg = "";

                  var siteVersionInfo = WebExUtilsFact.validateSiteVersionXmlData(siteVersionInfoXml);
                  var trainReleaseJsonObj = WebExUtilsFact.getSiteVersion(siteVersionInfo);
                  var trainReleaseVersion = trainReleaseJsonObj.trainReleaseVersion;
                  var trainReleaseOrder = trainReleaseJsonObj.trainReleaseOrder;

                  webExUserSettingsModel.isT31Site = (
                    (null != trainReleaseOrder) &&
                    (400 <= +trainReleaseOrder)
                  ) ? true : false;

                  logMsg = funcName + ": " + "\n" +
                    "trainReleaseVersion=" + trainReleaseVersion + "\n" +
                    "trainReleaseOrder=" + trainReleaseOrder;
                  $log.log(logMsg);

                  webExUserSettingsModel.siteVersionInfo = siteVersionInfo;

                  _self.getUserSettingsInfo();
                }, // getSiteVersionInfoXmlSuccess()

                function getSiteVersionInfoXmlError(info) {
                  var funcName = "getSiteVersionInfoXmlError()";
                  var logMsg = "";

                  $log.log(funcName);

                  _self.getUserSettingsInfo();
                } // getSiteVersionInfoXmlError()
              );
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
                "hasLoadError=" + webExUserSettingsModel.hasLoadError + "\n" +
                "errMsg=" + webExUserSettingsModel.errMsg + "\n" +
                "allowRetry=" + webExUserSettingsModel.allowRetry + "\n" +
                "sessionTicketErr=" + webExUserSettingsModel.sessionTicketErr;
              $log.log(logMsg);
            } // getSessionTicketError
          ); // WebExUserSettingsFact.getSessionTicket().then()
        }, // getUserSettingsFromWebEx()

        getUserSettingsInfo: function (form) {
          var funcName = "getUserSettingsInfo()";
          var logMsg = "";

          logMsg = funcName + ":" + "\n" +
            "webExUserSettingsModel.isT31Site=" + webExUserSettingsModel.isT31Site;
          // $log.log(logMsg);

          webExUserSettingsModel.disableSave = true;
          webExUserSettingsModel.disableSave2 = true;

          angular.element('#reloadBtn').button('loading');
          angular.element('#reloadBtn2').button('loading');

          angular.element('#resetBtn').button('loading');
          angular.element('#resetBtn2').button('loading');

          var _self = this;

          _self.getUserSettingsInfoXml().then(
            function getUserSettingsInfoXmlSuccess(getInfoResult) {
              var funcName = "getUserSettingsInfoSuccess()";
              var logMsg = "";

              webExUserSettingsModel.userInfo = WebExUtilsFact.validateUserInfoXmlData(getInfoResult.userInfoXml);
              webExUserSettingsModel.siteInfo = WebExUtilsFact.validateSiteInfoXmlData(getInfoResult.siteInfoXml);
              webExUserSettingsModel.meetingTypesInfo = WebExUtilsFact.validateMeetingTypesInfoXmlData(getInfoResult.meetingTypesInfoXml);

              if (
                ("" === webExUserSettingsModel.userInfo.errId) &&
                ("" === webExUserSettingsModel.siteInfo.errId) &&
                ("" === webExUserSettingsModel.meetingTypesInfo.errId)
              ) {

                _self.updateCenterLicenseEntitlements();

                // var validLicenseEntitlements = true;
                var isValidLicenseEntitlement = (
                  (webExUserSettingsModel.meetingCenter.isEntitledOnWebEx == webExUserSettingsModel.meetingCenter.isEntitledOnAtlas) &&
                  (webExUserSettingsModel.trainingCenter.isEntitledOnWebEx == webExUserSettingsModel.trainingCenter.isEntitledOnAtlas) &&
                  (webExUserSettingsModel.eventCenter.isEntitledOnWebEx == webExUserSettingsModel.eventCenter.isEntitledOnAtlas) &&
                  (webExUserSettingsModel.supportCenter.isEntitledOnWebEx == webExUserSettingsModel.supportCenter.isEntitledOnAtlas)
                ) ? true : false;

                if (!isValidLicenseEntitlement) {
                  _self.setLoadingErrorDisplay(
                    "defaultDbMismatchError",
                    false,
                    true,
                    form
                  );
                } else {
                  _self.updateUserSettingsModelPart1();
                  _self.updateUserSettingsModelPart2();
                  _self.updateUserSettingsModelPart3();

                  webExUserSettingsModel.hasLoadError = false;
                  webExUserSettingsModel.viewReady = true; // only set this after the model has finished being updated

                  angular.element('#reloadBtn').button('reset');
                  angular.element('#reloadBtn2').button('reset');

                  if (null != form) {
                    form.$setPristine();
                    form.$setUntouched();
                  }
                }
              } else { // has invalid xml data
                logMsg = funcName + ": " + "\n" +
                  "userInfo.errId=" + webExUserSettingsModel.userInfo.errId + "\n" +
                  "userInfo.errReason=" + webExUserSettingsModel.userInfo.errReason + "\n" +
                  "siteInfo.errId=" + webExUserSettingsModel.siteInfo.errId + "\n" +
                  "siteInfo.errReason=" + webExUserSettingsModel.siteInfo.errReason + "\n" +
                  "meetingTypesInfo.errId=" + webExUserSettingsModel.meetingTypesInfo.errId + "\n" +
                  "meetingTypesInfo.errReason=" + webExUserSettingsModel.meetingTypesInfo.errReason;
                $log.log(logMsg);

                var errId = "";
                if ("" !== webExUserSettingsModel.userInfo.errId) {
                  errId = webExUserSettingsModel.userInfo.errId;
                } else if ("" !== webExUserSettingsModel.siteInfo.errId) {
                  errId = webExUserSettingsModel.siteInfo.errId;
                } else {
                  errId = webExUserSettingsModel.meetingTypesInfo.errId;
                }

                _self.setLoadingErrorDisplay(
                  errId,
                  false,
                  true,
                  form
                );

                logMsg = funcName + ": " + "\n" +
                  "hasLoadError=" + webExUserSettingsModel.hasLoadError + "\n" +
                  "errMsg=" + webExUserSettingsModel.errMsg + "\n" +
                  "allowRetry=" + webExUserSettingsModel.allowRetry + "\n" +
                  "sessionTicketErr=" + webExUserSettingsModel.sessionTicketErr;
                $log.log(logMsg);
              } // has invalid xml data

              webExUserSettingsModel.disableSave = false;
              webExUserSettingsModel.disableSave2 = false;
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

              webExUserSettingsModel.disableSave = false;
              webExUserSettingsModel.disableSave2 = false;
            } // getUserSettingsInfoXmlError()
          ); // WebExUserSettingsFact.getUserSettingsInfoXml()
        }, // getUserSettingsInfo()

        setLoadingErrorDisplay: function (
          errId,
          sessionTicketErr,
          allowRetry,
          form
        ) {
          webExUserSettingsModel.errMsg = this.getErrMsg(errId, null);
          webExUserSettingsModel.viewReady = false;
          webExUserSettingsModel.hasLoadError = true;
          webExUserSettingsModel.sessionTicketErr = sessionTicketErr;
          webExUserSettingsModel.allowRetry = allowRetry;

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
          var errMessage = null;

          webExUserSettingsModel.disableCancel = true;

          angular.element('#saveBtn').button('loading');

          var _self = this;
          var useSupportedServices = webExUserSettingsModel.userInfo.bodyJson.use_supportedServices;

          var userSettings = {
            meetingTypes: [],
            meetingCenter: "false",
            trainingCenter: "false",
            supportCenter: "false",
            eventCenter: "false",
            salesCenter: "false"
          };

          // go through the session types
          webExUserSettingsModel.sessionTypes.forEach(
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
          ); // webExUserSettingsModel.sessionTypes.forEach()

          // block user from saving changes if any entitled WebEx Center does not have at least one session types selected
          // once block save flag has been set to true, skip checking other centers and go straight to block save
          var blockDueToNoSession = false;
          if (
            (webExUserSettingsModel.meetingCenter.isEntitledOnWebEx) &&
            (userSettings.meetingCenter != "true")
          ) {
            blockDueToNoSession = true;
          } else if (
            (webExUserSettingsModel.trainingCenter.isEntitledOnWebEx) &&
            (userSettings.trainingCenter != "true")
          ) {
            blockDueToNoSession = true;
          } else if (
            (webExUserSettingsModel.eventCenter.isEntitledOnWebEx) &&
            (userSettings.eventCenter != "true")
          ) {
            blockDueToNoSession = true;
          } else if (
            (webExUserSettingsModel.supportCenter.isEntitledOnWebEx) &&
            (userSettings.supportCenter != "true")
          ) {
            blockDueToNoSession = true;
          }

          $log.log("DURE blockDueToNoSession=" + blockDueToNoSession);

          if (blockDueToNoSession) {
            angular.element('#saveBtn').button('reset');
            angular.element('#saveBtn2').button('reset');
            webExUserSettingsModel.disableCancel = false;
            webExUserSettingsModel.disableCancel2 = false;
            errMessage = $translate.instant("webexUserSettings.mustHaveAtLeastOneSessionTypeEnabled");
            Notification.notify([errMessage], 'error');
            return;
          }

          //so this is true if he has PMR but does not have PRO or STD.
          var blockDueToPMR = _self.isUserLevelPMREnabled() &&
            !_self.hasProOrStdMeetingCenter(webExUserSettingsModel.sessionTypes);
          $log.log("DURE blockDueToPMR=" + blockDueToPMR);

          if (blockDueToPMR) {
            angular.element('#saveBtn').button('reset');
            angular.element('#saveBtn2').button('reset');
            webExUserSettingsModel.disableCancel = false;
            webExUserSettingsModel.disableCancel2 = false;
            errMessage = $translate.instant("webexUserSettings.mustHavePROorSTDifPMRenabled");
            Notification.notify([errMessage], 'error');
            return;
          }

          WebExXmlApiFact.updateUserSettings(webExXmlApiInfo, userSettings).then(
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

          webExUserSettingsModel.disableCancel2 = true;

          angular.element('#saveBtn2').button('loading');

          switch (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType) {
          case 1:
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = true;
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = false;
            break;

          case 2:
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = true;
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = true;
            break;

          default:
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value = false;
            webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value = false;
            break;
          } // switch()

          logMsg = funcName + ": " + "\n" +
            "selectedCallInTollType=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType + "\n" +
            "toll.value=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value + "\n" +
            "tollFree.value=" + webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value;

          var _self = this;

          webExXmlApiInfo.tollSiteEnabled = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled;
          webExXmlApiInfo.toll = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.toll.value;

          webExXmlApiInfo.tollFreeSiteEnabled = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled;
          webExXmlApiInfo.tollFree = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.value;

          webExXmlApiInfo.teleconfViaGlobalCallInSiteEnabled = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled;
          webExXmlApiInfo.teleconfViaGlobalCallIn = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value;

          webExXmlApiInfo.teleCLIAuthEnabledSiteEnabled = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.isSiteEnabled;
          webExXmlApiInfo.teleCLIAuthEnabled = webExUserSettingsModel.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.value;

          webExXmlApiInfo.callBackTeleconfSiteEnabled = webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled;
          webExXmlApiInfo.callBackTeleconf = webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.value;

          webExXmlApiInfo.globalCallBackTeleconfSiteEnabled = webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled;
          webExXmlApiInfo.globalCallBackTeleconf = webExUserSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value;

          webExXmlApiInfo.otherTelephonySiteEnabled = webExUserSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled;
          webExXmlApiInfo.otherTelephony = webExUserSettingsModel.telephonyPriviledge.otherTeleconfServices.value;

          webExXmlApiInfo.integratedVoIPSiteEnabled = webExUserSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled;
          webExXmlApiInfo.integratedVoIP = webExUserSettingsModel.telephonyPriviledge.integratedVoIP.value;

          webExXmlApiInfo.isEnablePMRSiteEnabled = webExUserSettingsModel.pmr.isSiteEnabled;
          webExXmlApiInfo.isEnablePMR = webExUserSettingsModel.pmr.value;

          webExXmlApiInfo.hiQualVideoSitenEnabled = webExUserSettingsModel.videoSettings.hiQualVideo.isSiteEnabled;
          webExXmlApiInfo.hiQualVideo = webExUserSettingsModel.videoSettings.hiQualVideo.value;

          webExXmlApiInfo.hiDefVideoSiteEnabled = webExUserSettingsModel.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled;
          webExXmlApiInfo.hiDefVideo = webExUserSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value;

          webExXmlApiInfo.eventCenterSiteEnabled = webExUserSettingsModel.eventCenter.isSiteEnabled;
          webExXmlApiInfo.optimizeBandwidthUsageSiteEnabled = webExUserSettingsModel.eventCenter.optimizeBandwidthUsage.isSiteEnabled;
          webExXmlApiInfo.optimizeBandwidthUsage = webExUserSettingsModel.eventCenter.optimizeBandwidthUsage.value;

          webExXmlApiInfo.trainingCenterSiteEnabled = webExUserSettingsModel.trainingCenter.isSiteEnabled;
          webExXmlApiInfo.handsOnLabAdminSiteEnabled = webExUserSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled;
          webExXmlApiInfo.handsOnLabAdmin = webExUserSettingsModel.trainingCenter.handsOnLabAdmin.value;

          var okToUpdate = true;
          var notificationMsg;

          if ((webExUserSettingsModel.pmr.value === true) && (webExUserSettingsModel.cmr.value === true) && //if enabling both PM and CMR
            webExUserSettingsModel.telephonyPriviledge.telephonyType.isWebExAudio && //and site is WebEx audio
            !webExUserSettingsModel.telephonyPriviledge.hybridAudio.isSiteEnabled) { //but does not support hybrid audio
            notificationMsg = $translate.instant("webexUserSettings.pmrErrorHybridAudio"); //show an error
            webExUserSettingsModel.pmr.value = false; //un-check the PMR option
            _self.notifyError(notificationMsg);
            okToUpdate = false;
          }

          if (okToUpdate) {
            if (webExUserSettingsModel.isT31Site) {
              if ((webExUserSettingsModel.pmr.value === true) && (webExUserSettingsModel.cmr.value === true) && //if enabling PMR and CMR
                (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.value === false && webExUserSettingsModel.telephonyPriviledge.integratedVoIP.value === false)) { //require both hybrid audio and integrated voip
                notificationMsg = $translate.instant("webexUserSettings.pmrErrorTelephonyPrivilegesHybridVOIP");
                _self.notifyError(notificationMsg);
                okToUpdate = false;
              }
            } else {
              if ((webExUserSettingsModel.pmr.value === true) && (webExUserSettingsModel.cmr.value === true) && //if enabling both PMR and CMR
                (webExUserSettingsModel.telephonyPriviledge.callInTeleconf.value === false)) { //and if call in is disabled
                notificationMsg = $translate.instant("webexUserSettings.pmrErrorTelephonyPrivileges"); //show error
                _self.notifyError(notificationMsg);
                okToUpdate = false;
              }
            }
          }

          if (okToUpdate) {
            WebExXmlApiFact.updateUserSettings2(webExXmlApiInfo).then(
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

        notifyError: function (notificationMsg) {
          var updateStatus = "error";
          Notification.notify([notificationMsg], updateStatus);
          angular.element('#saveBtn2').button('reset');
          webExUserSettingsModel.disableCancel2 = false;
        },

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

          var resultJson = WebExUtilsFact.validateXmlData(
            "Update user settings2 result",
            result,
            null,
            null
          );

          logMsg = funcName + ": " + "resultJson=" + "\n" +
            JSON.stringify(resultJson);
          // $log.log(logMsg);

          var updateStatus = "success";
          var notificationMsg = $translate.instant(successMsg);

          // verify whether the update request completed without error
          if ("" === resultJson.errId) {
            if (flushWaf) {
              WebExXmlApiFact.flushWafCache(webExXmlApiInfo).then(
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

          webExUserSettingsModel.disableCancel = false;
          webExUserSettingsModel.disableCancel2 = false;

          Notification.notify([notificationMsg], updateStatus);
        }, // processUpdateResponse()

        processNoUpdateResponse: function (result) {
          var funcName = "processNoUpdateResponse()";
          var logMsg = "";

          logMsg = funcName + ": " + "result=" + "\n" +
            result;
          // $log.log(logMsg);

          angular.element('#saveBtn').button('reset');
          angular.element('#saveBtn2').button('reset');

          webExUserSettingsModel.disableCancel = false;
          webExUserSettingsModel.disableCancel2 = false;

          var errMsg = this.getErrMsg(null, null);
          Notification.notify([errMsg], 'error');
        }, // processNoUpdateResponse()

        getErrMsg: function (errId, errValue) {
          var funcName = "getErrMsg()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "errId=" + errId + "\n" +
            "errValue=" + errValue;
          // $log.log(logMsg);

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

            webExUserSettingsModel.sessionTypes.forEach(
              function chkSessionType(sessionType) {
                logMsg = funcName + ": " + "\n" +
                  "sessionType=" + JSON.stringify(sessionType);
                // $log.log(logMsg);

                if (sessionType.sessionTypeId == errValue) {
                  sessionTypeName = sessionType.sessionDescription;
                }
              } // chkSessionType()
            ); // webExUserSettingsModel.sessionTypes.forEach()

            logMsg = funcName + ": " + "\n" +
              "errId=" + errId + "\n" +
              "errValue=" + errValue + "\n" +
              "sessionTypeName=" + sessionTypeName;
            // $log.log(logMsg);

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
          // $log.log(logMsg);

          return errMsg;
        }, // getErrMsg()

        getSessionTicket: function (webexSiteUrl) {
          var siteName = WebExUtilsFact.getSiteName(webexSiteUrl);
          return WebExXmlApiFact.getSessionTicket(webexSiteUrl, siteName);
        }, //getSessionTicket()

        getSiteUrl: function () {
          if (!$stateParams.site) {
            return "";
          }
          return $stateParams.site;
        }, //getSiteUrl

        getSiteName: function (siteUrl) {
          return WebExUtilsFact.getSiteName(siteUrl);
        }, //getSiteName()
      }; // return
    } //WebExUserSettingsFact
  ]); // angular
})();
