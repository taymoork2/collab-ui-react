(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('WebExUserSettingsSvc', [
    '$q',
    '$log',
    'XmlApiSvc',
    'WebexUserSettingsModel',
    function (
      $q,
      $log,
      XmlApiSvc,
      userSettingsModel
    ) {
      return {
        initUserSettingsModel: function () {
          return userSettingsModel;
        }, // initUserSettingsModel()

        updateUserSettingsModel: function (
          userInfoJson,
          siteInfoJson,
          meetingTypesInfoJson
        ) {
          var funcName = "updateUserSettingsModel()";
          var logMsg = null;

          //---------------- start of center status update ----------------//
          var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

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
          //---------------- end of center status update ----------------//

          //---------------- start of session types update ----------------//
          var sessionTypes = [];
          if (null != meetingTypesInfoJson.mtgtype_meetingType) {
            var siteMeetingTypes = [].concat(meetingTypesInfoJson.mtgtype_meetingType);

            siteMeetingTypes.forEach(function (siteMeetingType) {
              var siteMtgServiceTypeID = siteMeetingType.mtgtype_meetingTypeID;
              var siteMtgProductCodePrefix = siteMeetingType.mtgtype_productCodePrefix;
              var siteMtgDisplayName = siteMeetingType.mtgtype_displayName;
              var siteMtgServiceTypes = [].concat(siteMeetingType.mtgtype_serviceTypes.mtgtype_serviceType);

              if (1 < siteMtgServiceTypes.length) {
                logMsg = funcName + ": " + "\n" +
                  "siteMtgServiceTypeID=" + siteMtgServiceTypeID + "\n" +
                  "siteMtgProductCodePrefix=" + siteMtgProductCodePrefix + "\n" +
                  "siteMtgServiceTypes=" + siteMtgServiceTypes;
                // $log.log(logMsg);
                // alert(logMsg);
              }

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
          // alert(logMsg);

          enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
            userSettingsModel.sessionTypes.forEach(function (sessionType) {
              var sessionTypeId = sessionType.sessionTypeId;

              logMsg = funcName + ": " + "\n" +
                "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                "sessionTypeId=" + sessionTypeId;
              // $log.log(logMsg);
              // alert(logMsg);

              if (sessionType.sessionTypeId == enabledSessionTypeID) {
                sessionType.sessionEnabled = true;
              }
            }); // userSettingsModel.sessionTypes.forEach()
          }); // enabledSessionTypesIDs.forEach()
          //---------------- end of session types update ----------------//

          //---------------- start of cmr update----------------//
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_siteCommonOptions.ns1_EnableCloudTelepresence) {
            userSettingsModel.collabMeetingRoom.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_isEnableCET) {
            userSettingsModel.collabMeetingRoom.value = true;
          }
          //---------------- end of cmr update ----------------//

          //---------------- start of user privileges update -----------------//
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.isSiteEnabled = true;
          }

          if (userSettingsModel.telephonyPriviledge.callInTeleconf.isSiteEnabled) {
            if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference) {
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollOnly.isSiteEnabled = true;
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollFreeOnly.isSiteEnabled = true;
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollAndTollFree.isSiteEnabled = true;
            } else if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference) {
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollFreeOnly.isSiteEnabled = true;
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollAndTollFree.isSiteEnabled = true;
            } else if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing) {
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollFreeOnly.isSiteEnabled = true;
            } else {
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollOnly.isSiteEnabled = true;
            }
          }

          if (
            ("true" == userInfoJson.use_privilege.use_teleConfCallIn) &&
            ("true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn)
          ) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 3;
          } else if ("true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 2;
          } else {
            userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 1;
          }

          //
          if ("true" == userInfoJson.use_privilege.use_teleConfCallInInternational) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.value = true;
          }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallOut) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.value = true;
          }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallOutInternational) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.value = true;
          }

          if ("true" == userInfoJson.use_privilege.use_otherTelephony) {
            userSettingsModel.telephonyPriviledge.otherTeleconfServices.value = true;
          }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_voiceOverIp) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.value = true;
          }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab) {
            userSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_labAdmin) {
            userSettingsModel.trainingCenter.handsOnLabAdmin.value = true;
          }
          //---------------- end of user privileges update -----------------//

          return userSettingsModel;
        }, // updateUserSettingsModel()

        getUserInfo: function (xmlApiAccessInfo) {
          var xmlData = XmlApiSvc.getUserInfo(xmlApiAccessInfo);

          return $q.all(xmlData);
        }, // getUserInfo()

        getSiteInfo: function (xmlApiAccessInfo) {
          var xmlData = XmlApiSvc.getSiteInfo(xmlApiAccessInfo);

          return $q.all(xmlData);
        }, // getSiteInfo()

        getMeetingTypeInfo: function (xmlApiAccessInfo) {
          var xmlData = XmlApiSvc.getMeetingTypeInfo(xmlApiAccessInfo);

          return $q.all(xmlData);
        }, // getMeetingTypeInfo()

        getUserSettingsInfo: function (xmlApiAccessInfo) {
          var userInfoXml = XmlApiSvc.getUserInfo(xmlApiAccessInfo);
          var siteInfoXml = XmlApiSvc.getSiteInfo(xmlApiAccessInfo);
          var meetingTypeXml = XmlApiSvc.getMeetingTypeInfo(xmlApiAccessInfo);

          return $q.all([userInfoXml, siteInfoXml, meetingTypeXml]);
        }, // getUserSettingsInfo()

        updateUserSettings: function (xmlApiAccessInfo, userSettings) {
          return XmlApiSvc.updateUserPrivileges(xmlApiAccessInfo, userSettings);
        },

        xml2JsonConvert: function (commentText, xmlDataText, startOfBodyStr, endOfBodyStr) {
          return XmlApiSvc.xml2JsonConvert(commentText, xmlDataText, startOfBodyStr, endOfBodyStr);
        }, // xml2JsonConvert()

        getSessionTicket: function (wbxSiteUrl) {
          return XmlApiSvc.getSessionTicket(wbxSiteUrl);
        }, //getSessionTicket()
      }; // return
    } //WebExUserSettingsSvc
  ]); // angular
})();
