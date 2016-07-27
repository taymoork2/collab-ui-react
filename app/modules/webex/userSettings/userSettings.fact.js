(function () {
  'use strict';

  angular.module('WebExApp').factory('WebExUserSettingsFact', WebExUserSettingsFact);

  /* @ngInject */
  function WebExUserSettingsFact(
    $q,
    $log,
    $stateParams,
    $translate,
    Authinfo,
    Notification,
    Orgservice,
    WebExUtilsFact,
    WebExXmlApiFact,
    WebexUserSettingsSvc,
    WebExXmlApiInfoSvc
  ) {

    var loading = {
      reloadBtn: false,
      reloadBtn2: false,
      resetBtn: false,
      resetBtn2: false,
      saveBtn: false,
      saveBtn2: false
    };

    var allowSessionMismatch = false;

    return {
      loading: loading,
      allowSessionMismatch: allowSessionMismatch,
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
        return WebexUserSettingsSvc;
      }, // getUserSettingsModel()

      initUserSettingsModel: function () {
        var funcName = "initUserSettingsModel()";
        var logMsg = "";

        WebexUserSettingsSvc.meetingCenter.isEntitledOnAtlas = false;
        WebexUserSettingsSvc.trainingCenter.isEntitledOnAtlas = false;
        WebexUserSettingsSvc.eventCenter.isEntitledOnAtlas = false;
        WebexUserSettingsSvc.supportCenter.isEntitledOnAtlas = false;

        WebexUserSettingsSvc.meetingCenter.isEntitledOnWebEx = false;
        WebexUserSettingsSvc.trainingCenter.isEntitledOnWebEx = false;
        WebexUserSettingsSvc.eventCenter.isEntitledOnWebEx = false;
        WebexUserSettingsSvc.supportCenter.isEntitledOnWebEx = false;

        WebexUserSettingsSvc.siteInfo = null;
        WebexUserSettingsSvc.meetingTypesInfo = null;
        WebexUserSettingsSvc.siteVersionInfo = null;

        WebexUserSettingsSvc.viewReady = false;
        WebexUserSettingsSvc.hasLoadError = false;
        WebexUserSettingsSvc.allowRetry = false;
        WebexUserSettingsSvc.sessionTicketErr = false;
        WebexUserSettingsSvc.disableCancel = false;
        WebexUserSettingsSvc.disableCancel2 = false;
        WebexUserSettingsSvc.disableSave = false;
        WebexUserSettingsSvc.disableSave2 = false;
        WebexUserSettingsSvc.isT31Site = false;

        WebexUserSettingsSvc.trainingCenter.handsOnLabAdmin.label = $translate.instant("webexUserSettingLabels.handsOnLabAdminLabel");
        WebexUserSettingsSvc.eventCenter.optimizeBandwidthUsage.label = $translate.instant("webexUserSettingLabels.optimizeBandwidthUsageLabel");
        WebexUserSettingsSvc.otherPrivilegesSection.label = $translate("webexUserSettingLabels.OtherPrivilegesLabel");
        WebexUserSettingsSvc.pmr.label = $translate.instant("webexUserSettingLabels.pmrLabel");

        WebexUserSettingsSvc.videoSettings.label = $translate.instant("webexUserSettingLabels.videoSettingsLabel");
        WebexUserSettingsSvc.videoSettings.hiQualVideo.label = $translate.instant("webexUserSettingLabels.hiQualVideoLabel");
        WebexUserSettingsSvc.videoSettings.hiQualVideo.hiDefVideo.label = $translate.instant("webexUserSettingLabels.hiDefVideoLabel");

        WebexUserSettingsSvc.telephonyPriviledge.label = $translate.instant("webexUserSettingLabels.telephonyPrivilegesLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.label = $translate.instant("webexUserSettingLabels.callInTeleconfLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.callInTollTypes[0].label = $translate.instant("webexUserSettingLabels.tollOnlyLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.callInTollTypes[1].label = $translate.instant("webexUserSettingLabels.tollAndTollFreeLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.label = $translate.instant("webexUserSettingLabels.teleconfViaGlobalCallinLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.label = $translate.instant("webexUserSettingLabels.teleCLIAuthEnabledLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.label = $translate.instant("webexUserSettingLabels.callBackTeleconfLabel");
        WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.label = $translate.instant("webexUserSettingLabels.globalCallBackTeleconfLabel");
        WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.label = $translate.instant("webexUserSettingLabels.integratedVoIPLaabel");

        return WebexUserSettingsSvc;
      }, // initUserSettingsModel()

      initXmlApiInfo: function (
        webexSiteUrl,
        webexSiteName,
        webexAdminSessionTicket
      ) {
        WebExXmlApiInfoSvc.xmlApiUrl = "https://" + webexSiteUrl + "/WBXService/XMLService";
        WebExXmlApiInfoSvc.webexSiteName = webexSiteName;
        WebExXmlApiInfoSvc.webexAdminID = Authinfo.getPrimaryEmail();
        WebExXmlApiInfoSvc.webexAdminSessionTicket = webexAdminSessionTicket;
        WebExXmlApiInfoSvc.webexUserId = $stateParams.currentUser.userName;
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

        var userInfoJson = WebexUserSettingsSvc.userInfo.bodyJson;

        WebexUserSettingsSvc.meetingCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_meetingCenter) ? true : false;
        WebexUserSettingsSvc.trainingCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_trainingCenter) ? true : false;
        WebexUserSettingsSvc.eventCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_eventCenter) ? true : false;
        WebexUserSettingsSvc.supportCenter.isEntitledOnWebEx = ("true" == userInfoJson.use_supportedServices.use_supportCenter) ? true : false;

        logMsg = funcName + "\n" +
          "meetingCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.meetingCenter.isEntitledOnWebEx + "\n" +
          "trainingCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.trainingCenter.isEntitledOnWebEx + "\n" +
          "eventCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.eventCenter.isEntitledOnWebEx + "\n" +
          "supportCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.supportCenter.isEntitledOnWebEx + "\n" +
          "\n" +
          "meetingCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.meetingCenter.isEntitledOnAtlas + "\n" +
          "trainingCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.trainingCenter.isEntitledOnAtlas + "\n" +
          "eventCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.eventCenter.isEntitledOnAtlas + "\n" +
          "supportCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.supportCenter.isEntitledOnAtlas;
        // $log.log(logMsg);
      }, // updateCenterLicenseEntitlements()

      updateUserSettingsModelPart1: function () {
        var funcName = "updateUserSettingsModelPart1()";
        var logMsg = null;

        var userInfoJson = WebexUserSettingsSvc.userInfo.bodyJson;
        var siteInfoJson = WebexUserSettingsSvc.siteInfo.bodyJson;
        var meetingTypesInfoJson = WebexUserSettingsSvc.meetingTypesInfo.bodyJson;
        var siteVersionInfoJson = WebexUserSettingsSvc.siteVersionInfo.bodyJson;

        WebexUserSettingsSvc.meetingCenter.isSiteEnabled = false;
        WebexUserSettingsSvc.eventCenter.isSiteEnabled = false;
        WebexUserSettingsSvc.trainingCenter.isSiteEnabled = false;
        WebexUserSettingsSvc.supportCenter.isSiteEnabled = false;

        // Start of center status update
        var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

        siteServiceTypes.forEach(
          function chkSiteServiceType(siteServiceType) {
            if (siteServiceType == WebexUserSettingsSvc.meetingCenter.label) {
              WebexUserSettingsSvc.meetingCenter.isSiteEnabled = true;
            } else if (siteServiceType == WebexUserSettingsSvc.eventCenter.label) {
              WebexUserSettingsSvc.eventCenter.isSiteEnabled = true;
            } else if (siteServiceType == WebexUserSettingsSvc.trainingCenter.label) {
              WebexUserSettingsSvc.trainingCenter.isSiteEnabled = true;
            } else if (siteServiceType == WebexUserSettingsSvc.supportCenter.label) {
              WebexUserSettingsSvc.supportCenter.isSiteEnabled = true;
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
                  if (WebexUserSettingsSvc.meetingCenter.serviceType == siteMtgServiceType) {
                    meetingCenterApplicable = true;
                  } else if (WebexUserSettingsSvc.eventCenter.serviceType == siteMtgServiceType) {
                    if ("AUO" != siteMtgProductCodePrefix) {
                      eventCenterApplicable = true;
                    }
                  } else if (WebexUserSettingsSvc.trainingCenter.serviceType == siteMtgServiceType) {
                    if ("AUO" != siteMtgProductCodePrefix) {
                      trainingCenterApplicable = true;
                    }
                  } else if (WebexUserSettingsSvc.supportCenter.serviceType == siteMtgServiceType) {
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

        WebexUserSettingsSvc.sessionTypes = sessionTypes;
        var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

        /*
        logMsg = funcName + ": " + "\n" +
          "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
        $log.log(logMsg);
        */

        enabledSessionTypesIDs.forEach(
          function chkEnabledSessionTypeID(enabledSessionTypeID) { // loop through user's enabled session type
            WebexUserSettingsSvc.sessionTypes.forEach(function (sessionType) {
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
            }); // WebexUserSettingsSvc.sessionTypes.forEach()
          } // chkEnabledSessionTypeID()
        ); // enabledSessionTypesIDs.forEach()
        // End of Session Types update
      }, // updateUserSettingsModelPart1()

      updateUserSettingsModelPart2: function () {
        var funcName = "updateUserSettingsModelPart2()";
        var logMsg = null;

        var userInfoJson = WebexUserSettingsSvc.userInfo.bodyJson;
        var siteInfoJson = WebexUserSettingsSvc.siteInfo.bodyJson;
        var meetingTypesInfoJson = WebexUserSettingsSvc.meetingTypesInfo.bodyJson;
        var siteVersionInfoJson = WebexUserSettingsSvc.siteVersionInfo.bodyJson;

        // Start of Telephony privileges
        WebexUserSettingsSvc.telephonyPriviledge.hybridVoipOnly.isSiteEnabled = ("true" === siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridVoipOnly);

        WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = (siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_isTSPUsingTelephonyAPI == "false" && //not TSP audio
          siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_meetingPlace.ns1_persistentTSP == "false") ? true : false; // not MP audio

        WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isTspAudio = (siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_isTSPUsingTelephonyAPI == "true") ? true : false;

        logMsg = funcName + ": " + "\n" +
          "Hybrid audio=" + WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled + "\n" +
          "WebEx audio=" + WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio + "\n" +
          "TSP audio=" + WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isTspAudio;
        $log.log(logMsg);

        // Start of call-in teleconf
        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value = (
          "true" == userInfoJson.use_privilege.use_teleConfCallIn
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value = (
          "true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = (
          (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value) ||
          (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value)
        ) ? true : false;

        if (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value) {
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 2;
        } else if (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value) {
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 1;
        } else {
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 0;
        }

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_intlCallInTeleconferencing
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value = (
          "true" == userInfoJson.use_privilege.use_teleConfCallInInternational
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_teleCLIAuthEnabled
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.value = (
          "true" == userInfoJson.use_privilege.use_teleCLIAuthEnabled
        ) ? true : false;

        logMsg = funcName + ": " + "\n" +
          "ns1_callInTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing + "\n" +
          "ns1_tollFreeCallinTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing + "\n" +
          "use_teleConfCallIn=" + userInfoJson.use_privilege.use_teleConfCallIn + "\n" +
          "use_teleConfTollFreeCallIn=" + userInfoJson.use_privilege.use_teleConfTollFreeCallIn + "\n" +
          "toll.isSiteEnabled=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled + "\n" +
          "toll.value=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value + "\n" +
          "tollFree.isSiteEnabled=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled + "\n" +
          "tollFree.value=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value + "\n" +
          "callInTeleconf=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value + "\n" +
          "callInTeleconf.selectedCallInTollType=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.selectedCallInTollType;
        $log.log(logMsg);
        // End of call-in teleconf

        WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.value = (
          "true" == userInfoJson.use_privilege.use_teleConfCallOut
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_intlCallBackTeleconferencing
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = (
          "true" == userInfoJson.use_privilege.use_teleConfCallOutInternational
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.otherTeleconfServices.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_supportOtherTypeTeleconf
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.otherTeleconfServices.value = (
          "true" == userInfoJson.use_privilege.use_otherTelephony
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.otherTeleconfServices.label = siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_otherTeleServiceName;

        WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone
        ) ? true : false;

        WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = (
          "true" == userInfoJson.use_privilege.use_voiceOverIp
        ) ? true : false;

        logMsg = funcName + ": " + "\n" +
          "integratedVoIP.isSiteEnabled=" + WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.isSiteEnabled + "\n" +
          "integratedVoIP.value=" + WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value;
        $log.log(logMsg);
        // End of Telephony privileges
      }, // updateUserSettingsModelPart2()

      updateUserSettingsModelPart3: function () {
        var funcName = "updateUserSettingsModelPart3()";
        var logMsg = null;

        var userInfoJson = WebexUserSettingsSvc.userInfo.bodyJson;
        var siteInfoJson = WebexUserSettingsSvc.siteInfo.bodyJson;
        var meetingTypesInfoJson = WebexUserSettingsSvc.meetingTypesInfo.bodyJson;
        var siteVersionInfoJson = WebexUserSettingsSvc.siteVersionInfo.bodyJson;

        var enablePMRSiteLevel = siteInfoJson.ns1_siteInstance.ns1_siteCommonOptions.ns1_enablePersonalMeetingRoom;
        WebexUserSettingsSvc.pmr.isSiteEnabled = (
          "true" == enablePMRSiteLevel
        ) ? true : false;

        WebexUserSettingsSvc.pmr.value = (
          "true" == userInfoJson.use_privilege.use_isEnablePMR
        ) ? true : false;
        $log.log("PMR = " + WebexUserSettingsSvc.pmr.value);

        WebexUserSettingsSvc.cmr.value = (
          "true" == userInfoJson.use_privilege.use_isEnableCET
        ) ? true : false;
        $log.log("CMR = " + WebexUserSettingsSvc.cmr.value);

        // Start of Video privileges
        WebexUserSettingsSvc.videoSettings.hiQualVideo.isSiteEnabled = (
          "true" == siteInfoJson.ns1_siteInstance.ns1_video.ns1_HQvideo
        ) ? true : false;

        WebexUserSettingsSvc.videoSettings.hiQualVideo.value = (
          "true" == userInfoJson.use_privilege.use_HQvideo
        ) ? true : false;

        if (!WebexUserSettingsSvc.videoSettings.hiQualVideo.isSiteEnabled) {
          WebexUserSettingsSvc.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled = false;
        } else {
          WebexUserSettingsSvc.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled = (
            "true" == siteInfoJson.ns1_siteInstance.ns1_video.ns1_HDvideo
          ) ? true : false;
        }

        WebexUserSettingsSvc.videoSettings.hiQualVideo.hiDefVideo.value = (
          "true" == userInfoJson.use_privilege.use_HDvideo
        ) ? true : false;
        // End of Video privileges

        // Start of Event Center
        WebexUserSettingsSvc.eventCenter.optimizeBandwidthUsage.isSiteEnabled = (
          ("true" == siteInfoJson.ns1_siteInstance.ns1_supportedServices.ns1_eventCenter.ns1_optimizeAttendeeBandwidthUsage)
        ) ? true : false;

        WebexUserSettingsSvc.eventCenter.optimizeBandwidthUsage.value = (
          "true" == userInfoJson.use_eventCenter.use_optimizeAttendeeBandwidthUsage
        ) ? true : false;
        // End of Event Center

        // Start of Training Center privileges
        WebexUserSettingsSvc.trainingCenter.handsOnLabAdmin.isSiteEnabled = (
          ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab)
        ) ? true : false;

        WebexUserSettingsSvc.trainingCenter.handsOnLabAdmin.value = (
          "true" == userInfoJson.use_privilege.use_labAdmin
        ) ? true : false;
        // End of Training Center privileges
      }, // updateUserSettingsModelPart3()

      getUserInfoXml: function () {
        var xmlData = WebExXmlApiFact.getUserInfo(WebExXmlApiInfoSvc);

        return $q.all(xmlData);
      }, // getUserInfoXml()

      getSiteInfoXml: function () {
        var xmlData = WebExXmlApiFact.getSiteInfo(WebExXmlApiInfoSvc);

        return $q.all(xmlData);
      }, // getSiteInfoXml()

      getMeetingTypeInfoXml: function () {
        var xmlData = WebExXmlApiFact.getMeetingTypeInfo(WebExXmlApiInfoSvc);

        return $q.all(xmlData);
      }, // getMeetingTypeInfoXml()

      getSiteVersionInfoXml: function () {
        var siteVersionInfoXml = WebExXmlApiFact.getSiteVersion(WebExXmlApiInfoSvc);

        return siteVersionInfoXml;
      }, // getSiteVersionInfoXml()

      getUserSettingsInfoXml: function () {
        var userInfoXml = WebExXmlApiFact.getUserInfo(WebExXmlApiInfoSvc);
        var siteInfoXml = WebExXmlApiFact.getSiteInfo(WebExXmlApiInfoSvc);
        var meetingTypesInfoXml = WebExXmlApiFact.getMeetingTypeInfo(WebExXmlApiInfoSvc);

        return $q.all({
          userInfoXml: userInfoXml,
          siteInfoXml: siteInfoXml,
          meetingTypesInfoXml: meetingTypesInfoXml
        });
      }, // getUserSettingsInfoXml()

      getUserWebExEntitlementFromAtlas: function () {
        var funcName = "getUserWebExEntitlementFromAtlas";
        var logMsg = "";

        var _self = this;

        Orgservice.getValidLicenses().then(
          function getOrgLicensesSuccess(orgLicenses) {
            var funcName = "getOrgLicensesSuccess()";
            var logMsg = "";

            logMsg = funcName + ": " + "\n" +
              "orgLicenses=" + JSON.stringify(orgLicenses);
            // $log.log(logMsg);

            _self.getUserSettingsFromWebEx();

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
                            WebexUserSettingsSvc.meetingCenter.isEntitledOnAtlas = true;
                            WebexUserSettingsSvc.trainingCenter.isEntitledOnAtlas = true;
                            WebexUserSettingsSvc.eventCenter.isEntitledOnAtlas = true;
                            WebexUserSettingsSvc.supportCenter.isEntitledOnAtlas = true;
                          } else {
                            if (WebexUserSettingsSvc.meetingCenter.id == userLicenseType) {
                              WebexUserSettingsSvc.meetingCenter.isEntitledOnAtlas = true;
                            } else if (WebexUserSettingsSvc.trainingCenter.id == userLicenseType) {
                              WebexUserSettingsSvc.trainingCenter.isEntitledOnAtlas = true;
                            } else if (WebexUserSettingsSvc.eventCenter.id == userLicenseType) {
                              WebexUserSettingsSvc.eventCenter.isEntitledOnAtlas = true;
                            } else if (WebexUserSettingsSvc.supportCenter.id == userLicenseType) {
                              WebexUserSettingsSvc.supportCenter.isEntitledOnAtlas = true;
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

            _self.getUserSettingsFromWebEx();
          } // getOrgLicensesError()
        ); // Orgservice.getValidLicenses().then()
      }, // getUserWebExEntitlementFromAtlas()

      getUserSettingsFromWebEx: function () {
        var funcName = "getUserSettingsFromWebEx()";
        var logMsg = "";

        loading.reloadBtn = true;
        loading.reloadBtn2 = true;

        var _self = this;
        var webexSiteUrl = this.getSiteUrl();
        var webexSiteName = WebExUtilsFact.getSiteName(webexSiteUrl);

        this.getSessionTicket(webexSiteUrl).then(
          function getSessionTicketSuccess(webexAdminSessionTicket) {
            loading.reloadBtn = false;
            loading.reloadBtn2 = false;

            _self.initXmlApiInfo(
              webexSiteUrl,
              webexSiteName,
              webexAdminSessionTicket
            );

            WebexUserSettingsSvc.sessionTicketErr = false;

            _self.getSiteVersionInfoXml().then(
              function getSiteVersionInfoXmlSuccess(siteVersionInfoXml) {
                var funcName = "getSiteVersionInfoXmlSuccess()";
                var logMsg = "";

                var siteVersionInfo = WebExUtilsFact.validateSiteVersionXmlData(siteVersionInfoXml);
                var trainReleaseJsonObj = WebExUtilsFact.getSiteVersion(siteVersionInfo);
                var trainReleaseVersion = trainReleaseJsonObj.trainReleaseVersion;
                var trainReleaseOrder = trainReleaseJsonObj.trainReleaseOrder;

                WebexUserSettingsSvc.isT31Site = (
                  (null != trainReleaseOrder) &&
                  (400 <= +trainReleaseOrder)
                ) ? true : false;

                logMsg = funcName + ": " + "\n" +
                  "trainReleaseVersion=" + trainReleaseVersion + "\n" +
                  "trainReleaseOrder=" + trainReleaseOrder;
                $log.log(logMsg);

                WebexUserSettingsSvc.siteVersionInfo = siteVersionInfo;

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
              "hasLoadError=" + WebexUserSettingsSvc.hasLoadError + "\n" +
              "errMsg=" + WebexUserSettingsSvc.errMsg + "\n" +
              "allowRetry=" + WebexUserSettingsSvc.allowRetry + "\n" +
              "sessionTicketErr=" + WebexUserSettingsSvc.sessionTicketErr;
            $log.log(logMsg);
          } // getSessionTicketError
        ); // WebExUserSettingsFact.getSessionTicket().then()
      }, // getUserSettingsFromWebEx()

      getUserSettingsInfo: function (form) {
        var funcName = "getUserSettingsInfo()";
        var logMsg = "";

        logMsg = funcName + ":" + "\n" +
          "WebexUserSettingsSvc.isT31Site=" + WebexUserSettingsSvc.isT31Site;
        // $log.log(logMsg);

        WebexUserSettingsSvc.disableSave = true;
        WebexUserSettingsSvc.disableSave2 = true;

        loading.reloadBtn = true;
        loading.reloadBtn2 = true;

        loading.resetBtn = true;
        loading.resetBtn2 = true;

        var _self = this;

        _self.getUserSettingsInfoXml().then(
          function getUserSettingsInfoXmlSuccess(getInfoResult) {
            var funcName = "getUserSettingsInfoSuccess()";
            var logMsg = "";

            WebexUserSettingsSvc.userInfo = WebExUtilsFact.validateUserInfoXmlData(getInfoResult.userInfoXml);
            WebexUserSettingsSvc.siteInfo = WebExUtilsFact.validateSiteInfoXmlData(getInfoResult.siteInfoXml);
            WebexUserSettingsSvc.meetingTypesInfo = WebExUtilsFact.validateMeetingTypesInfoXmlData(getInfoResult.meetingTypesInfoXml);

            if (
              ("" === WebexUserSettingsSvc.userInfo.errId) &&
              ("" === WebexUserSettingsSvc.siteInfo.errId) &&
              ("" === WebexUserSettingsSvc.meetingTypesInfo.errId)
            ) {

              _self.updateCenterLicenseEntitlements();

              var isValidLicenseEntitlement = (
                (WebexUserSettingsSvc.meetingCenter.isEntitledOnWebEx == WebexUserSettingsSvc.meetingCenter.isEntitledOnAtlas) &&
                (WebexUserSettingsSvc.trainingCenter.isEntitledOnWebEx == WebexUserSettingsSvc.trainingCenter.isEntitledOnAtlas) &&
                (WebexUserSettingsSvc.eventCenter.isEntitledOnWebEx == WebexUserSettingsSvc.eventCenter.isEntitledOnAtlas) &&
                (WebexUserSettingsSvc.supportCenter.isEntitledOnWebEx == WebexUserSettingsSvc.supportCenter.isEntitledOnAtlas)
              ) ? true : false;

              if (!isValidLicenseEntitlement) {
                logMsg = funcName + "\n" +
                  "ERROR -entitlement mismatch detected!" + "\n" +
                  "\n" +
                  "meetingCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.meetingCenter.isEntitledOnWebEx + "\n" +
                  "trainingCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.trainingCenter.isEntitledOnWebEx + "\n" +
                  "eventCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.eventCenter.isEntitledOnWebEx + "\n" +
                  "supportCenter.isEntitledOnWebEx=" + WebexUserSettingsSvc.supportCenter.isEntitledOnWebEx + "\n" +
                  "\n" +
                  "meetingCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.meetingCenter.isEntitledOnAtlas + "\n" +
                  "trainingCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.trainingCenter.isEntitledOnAtlas + "\n" +
                  "eventCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.eventCenter.isEntitledOnAtlas + "\n" +
                  "supportCenter.isEntitledOnAtlas=" + WebexUserSettingsSvc.supportCenter.isEntitledOnAtlas;
                $log.log(logMsg);

                if (allowSessionMismatch) {
                  isValidLicenseEntitlement = true;
                }
              }

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

                WebexUserSettingsSvc.hasLoadError = false;
                WebexUserSettingsSvc.viewReady = true; // only set this after the model has finished being updated

                loading.reloadBtn = false;
                loading.reloadBtn2 = false;
                loading.resetBtn = false;
                loading.resetBtn2 = false;

                if (null != form) {
                  form.$setPristine();
                  form.$setUntouched();
                }
              }
            } else { // has invalid xml data
              logMsg = funcName + ": " + "\n" +
                "userInfo.errId=" + WebexUserSettingsSvc.userInfo.errId + "\n" +
                "userInfo.errReason=" + WebexUserSettingsSvc.userInfo.errReason + "\n" +
                "siteInfo.errId=" + WebexUserSettingsSvc.siteInfo.errId + "\n" +
                "siteInfo.errReason=" + WebexUserSettingsSvc.siteInfo.errReason + "\n" +
                "meetingTypesInfo.errId=" + WebexUserSettingsSvc.meetingTypesInfo.errId + "\n" +
                "meetingTypesInfo.errReason=" + WebexUserSettingsSvc.meetingTypesInfo.errReason;
              $log.log(logMsg);

              var errId = "";
              if ("" !== WebexUserSettingsSvc.userInfo.errId) {
                errId = WebexUserSettingsSvc.userInfo.errId;
              } else if ("" !== WebexUserSettingsSvc.siteInfo.errId) {
                errId = WebexUserSettingsSvc.siteInfo.errId;
              } else {
                errId = WebexUserSettingsSvc.meetingTypesInfo.errId;
              }

              _self.setLoadingErrorDisplay(
                errId,
                false,
                true,
                form
              );

              logMsg = funcName + ": " + "\n" +
                "hasLoadError=" + WebexUserSettingsSvc.hasLoadError + "\n" +
                "errMsg=" + WebexUserSettingsSvc.errMsg + "\n" +
                "allowRetry=" + WebexUserSettingsSvc.allowRetry + "\n" +
                "sessionTicketErr=" + WebexUserSettingsSvc.sessionTicketErr;
              $log.log(logMsg);
            } // has invalid xml data

            WebexUserSettingsSvc.disableSave = false;
            WebexUserSettingsSvc.disableSave2 = false;
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

            WebexUserSettingsSvc.disableSave = false;
            WebexUserSettingsSvc.disableSave2 = false;
          } // getUserSettingsInfoXmlError()
        ); // WebExUserSettingsFact.getUserSettingsInfoXml()
      }, // getUserSettingsInfo()

      setLoadingErrorDisplay: function (
        errId,
        sessionTicketErr,
        allowRetry,
        form
      ) {
        WebexUserSettingsSvc.errMsg = this.getErrMsg(errId, null);
        WebexUserSettingsSvc.viewReady = false;
        WebexUserSettingsSvc.hasLoadError = true;
        WebexUserSettingsSvc.sessionTicketErr = sessionTicketErr;
        WebexUserSettingsSvc.allowRetry = allowRetry;

        loading.reloadBtn = false;
        loading.reloadBtn2 = false;

        if (null != form) {
          form.$setPristine();
          form.$setUntouched();
        }
      }, // setLoadingErrorDisplay()

      updateUserSettings: function (form) {
        var funcName = "updateUserSettings()";
        var logMsg = "";
        var errMessage = null;

        WebexUserSettingsSvc.disableCancel = true;

        loading.saveBtn = true;

        var _self = this;
        var useSupportedServices = WebexUserSettingsSvc.userInfo.bodyJson.use_supportedServices;

        var userSettings = {
          meetingTypes: [],
          meetingCenter: "false",
          trainingCenter: "false",
          supportCenter: "false",
          eventCenter: "false",
          salesCenter: "false"
        };

        // go through the session types
        WebexUserSettingsSvc.sessionTypes.forEach(
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
        ); // WebexUserSettingsSvc.sessionTypes.forEach()

        if (blockSaveDueToNoSession()) {
          return;
        }

        if (blockSaveDueToPMR()) {
          return;
        }

        WebExXmlApiFact.updateUserSettings(WebExXmlApiInfoSvc, userSettings).then(
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

        function blockSaveDueToNoSession() {
          var funcName = "blockSaveDueToNoSession()";
          var logMsg = "";

          // $log.log(funcName);

          // block save if any entitled WebEx Center does not have at least one session types selected
          var blockSave = false;

          if (!allowSessionMismatch) {
            if (
              (WebexUserSettingsSvc.meetingCenter.isEntitledOnWebEx) &&
              (userSettings.meetingCenter != "true")
            ) {

              blockSave = true;
            } else if (
              (WebexUserSettingsSvc.trainingCenter.isEntitledOnWebEx) &&
              (userSettings.trainingCenter != "true")
            ) {

              blockSave = true;
            } else if (
              (WebexUserSettingsSvc.eventCenter.isEntitledOnWebEx) &&
              (userSettings.eventCenter != "true")
            ) {

              blockSave = true;
            } else if (
              (WebexUserSettingsSvc.supportCenter.isEntitledOnWebEx) &&
              (userSettings.supportCenter != "true")
            ) {

              blockSave = true;
            }
          }

          if (blockSave) {
            loading.saveBtn = false;
            loading.saveBtn2 = false;
            WebexUserSettingsSvc.disableCancel = false;
            WebexUserSettingsSvc.disableCancel2 = false;
            errMessage = $translate.instant("webexUserSettings.mustHaveAtLeastOneSessionTypeEnabled");
            Notification.notify([errMessage], 'error');
          }

          return blockSave;
        } // blockSaveDueToNoSession()

        function blockSaveDueToPMR() {
          var funcName = "blockSaveDueToPMR()";
          var logMsg = "";

          // $log.log(funcName);

          // block save if PMR is enabled but does not have PRO or STD enabled.
          var blockSave = _self.isUserLevelPMREnabled() && !_self.hasProOrStdMeetingCenter(WebexUserSettingsSvc.sessionTypes);

          if (blockSave) {
            loading.saveBtn = false;
            loading.saveBtn2 = false;
            WebexUserSettingsSvc.disableCancel = false;
            WebexUserSettingsSvc.disableCancel2 = false;
            errMessage = $translate.instant("webexUserSettings.mustHavePROorSTDifPMRenabled");
            Notification.notify([errMessage], 'error');
          }

          return blockSave;
        } // blockSaveDueToPMR()
      }, // updateUserSettings()

      updateUserSettings2: function (form) {
        var funcName = "updateUserSettings2()";
        var logMsg = "";

        WebexUserSettingsSvc.disableCancel2 = true;

        loading.saveBtn2 = true;

        switch (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.selectedCallInTollType) {
        case 1:
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value = true;
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value = false;
          break;

        case 2:
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value = true;
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value = true;
          break;

        default:
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value = false;
          WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value = false;
          break;
        } // switch()

        logMsg = funcName + ": " + "\n" +
          "selectedCallInTollType=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.selectedCallInTollType + "\n" +
          "toll.value=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value + "\n" +
          "tollFree.value=" + WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value;

        var _self = this;

        WebExXmlApiInfoSvc.tollSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.isSiteEnabled;
        WebExXmlApiInfoSvc.toll = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.toll.value;

        WebExXmlApiInfoSvc.tollFreeSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled;
        WebExXmlApiInfoSvc.tollFree = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.tollFree.value;

        WebExXmlApiInfoSvc.teleconfViaGlobalCallInSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.isSiteEnabled;
        WebExXmlApiInfoSvc.teleconfViaGlobalCallIn = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value;

        WebExXmlApiInfoSvc.teleCLIAuthEnabledSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.isSiteEnabled;
        WebExXmlApiInfoSvc.teleCLIAuthEnabled = WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.teleCLIAuthEnabled.value;

        WebExXmlApiInfoSvc.callBackTeleconfSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.isSiteEnabled;
        WebExXmlApiInfoSvc.callBackTeleconf = WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.value;

        WebExXmlApiInfoSvc.globalCallBackTeleconfSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.isSiteEnabled;
        WebExXmlApiInfoSvc.globalCallBackTeleconf = WebexUserSettingsSvc.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value;

        WebExXmlApiInfoSvc.otherTelephonySiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.otherTeleconfServices.isSiteEnabled;
        WebExXmlApiInfoSvc.otherTelephony = WebexUserSettingsSvc.telephonyPriviledge.otherTeleconfServices.value;

        WebExXmlApiInfoSvc.integratedVoIPSiteEnabled = WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.isSiteEnabled;
        WebExXmlApiInfoSvc.integratedVoIP = WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value;

        WebExXmlApiInfoSvc.isEnablePMRSiteEnabled = WebexUserSettingsSvc.pmr.isSiteEnabled;
        WebExXmlApiInfoSvc.isEnablePMR = WebexUserSettingsSvc.pmr.value;

        WebExXmlApiInfoSvc.hiQualVideoSitenEnabled = WebexUserSettingsSvc.videoSettings.hiQualVideo.isSiteEnabled;
        WebExXmlApiInfoSvc.hiQualVideo = WebexUserSettingsSvc.videoSettings.hiQualVideo.value;

        WebExXmlApiInfoSvc.hiDefVideoSiteEnabled = WebexUserSettingsSvc.videoSettings.hiQualVideo.hiDefVideo.isSiteEnabled;
        WebExXmlApiInfoSvc.hiDefVideo = WebexUserSettingsSvc.videoSettings.hiQualVideo.hiDefVideo.value;

        WebExXmlApiInfoSvc.eventCenterSiteEnabled = WebexUserSettingsSvc.eventCenter.isSiteEnabled;
        WebExXmlApiInfoSvc.optimizeBandwidthUsageSiteEnabled = WebexUserSettingsSvc.eventCenter.optimizeBandwidthUsage.isSiteEnabled;
        WebExXmlApiInfoSvc.optimizeBandwidthUsage = WebexUserSettingsSvc.eventCenter.optimizeBandwidthUsage.value;

        WebExXmlApiInfoSvc.trainingCenterSiteEnabled = WebexUserSettingsSvc.trainingCenter.isSiteEnabled;
        WebExXmlApiInfoSvc.handsOnLabAdminSiteEnabled = WebexUserSettingsSvc.trainingCenter.handsOnLabAdmin.isSiteEnabled;
        WebExXmlApiInfoSvc.handsOnLabAdmin = WebexUserSettingsSvc.trainingCenter.handsOnLabAdmin.value;

        var okToUpdate = true;
        var notificationMsg;

        if ((WebexUserSettingsSvc.pmr.value === true) && (WebexUserSettingsSvc.cmr.value === true) && //if enabling both PM and CMR
          WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio && //and site is WebEx audio
          !WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled) { //but does not support hybrid audio
          notificationMsg = $translate.instant("webexUserSettings.pmrErrorHybridAudio"); //show an error
          WebexUserSettingsSvc.pmr.value = false; //un-check the PMR option
          _self.notifyError(notificationMsg);
          okToUpdate = false;
        }

        if (okToUpdate) {
          if (WebexUserSettingsSvc.isT31Site) {
            if ((WebexUserSettingsSvc.pmr.value === true) && (WebexUserSettingsSvc.cmr.value === true) && //if enabling PMR and CMR
              (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value === false && WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value === false)) { //require both hybrid audio and integrated voip
              notificationMsg = $translate.instant("webexUserSettings.pmrErrorTelephonyPrivilegesHybridVOIP");
              _self.notifyError(notificationMsg);
              okToUpdate = false;
            }
          } else {
            if ((WebexUserSettingsSvc.pmr.value === true) && (WebexUserSettingsSvc.cmr.value === true) && //if enabling both PMR and CMR
              (WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value === false)) { //and if call in is disabled
              notificationMsg = $translate.instant("webexUserSettings.pmrErrorTelephonyPrivileges"); //show error
              _self.notifyError(notificationMsg);
              okToUpdate = false;
            }
          }
        }

        if (okToUpdate) {
          WebExXmlApiFact.updateUserSettings2(WebExXmlApiInfoSvc).then(
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
        loading.saveBtn2 = false;
        WebexUserSettingsSvc.disableCancel2 = false;
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
            WebExXmlApiFact.flushWafCache(WebExXmlApiInfoSvc).then(
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

        loading.saveBtn = false;
        loading.saveBtn2 = false;

        WebexUserSettingsSvc.disableCancel = false;
        WebexUserSettingsSvc.disableCancel2 = false;

        //If this is a read only admin and WebEx returns "Access denied, additional privileges are required"
        if (resultJson.errId == "000001" && _.isFunction(Authinfo.isReadOnlyAdmin) && Authinfo.isReadOnlyAdmin()) {
          Notification.notifyReadOnly(resultJson.errId);
        } else {
          Notification.notify([notificationMsg], updateStatus);
        }
      }, // processUpdateResponse()

      processNoUpdateResponse: function (result) {
        var funcName = "processNoUpdateResponse()";
        var logMsg = "";

        logMsg = funcName + ": " + "result=" + "\n" + result;
        $log.log(logMsg);

        loading.saveBtn = false;
        loading.saveBtn2 = false;

        WebexUserSettingsSvc.disableCancel = false;
        WebexUserSettingsSvc.disableCancel2 = false;

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
          ("000029" === errId) ||
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

          WebexUserSettingsSvc.sessionTypes.forEach(
            function chkSessionType(sessionType) {
              logMsg = funcName + ": " + "\n" +
                "sessionType=" + JSON.stringify(sessionType);
              // $log.log(logMsg);

              if (sessionType.sessionTypeId == errValue) {
                sessionTypeName = sessionType.sessionDescription;
              }
            } // chkSessionType()
          ); // WebexUserSettingsSvc.sessionTypes.forEach()

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
})();
