(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('WebExUserSettingsFact', [
    '$q',
    '$log',
    'XmlApiFact',
    'WebexUserSettingsSvc',
    'XmlApiInfoSvc',
    function (
      $q,
      $log,
      XmlApiFact,
      userSettingsModel,
      xmlApiInfo
    ) {
      return {
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
            "infoXml=\n" + infoXml;
          // $log.log(logMsg);

          var headerJson = this.xml2JsonConvert(
            commentText + " Header",
            infoXml,
            "<serv:header>",
            "<serv:body>"
          ).body;

          var infoJson = this.xml2JsonConvert(
            commentText,
            infoXml,
            startOfBodyStr,
            endOfBodyStr
          ).body;

          logMsg = funcName + ": " + "\n" +
            "commentText=" + commentText + "\n" +
            "infoJson=\n" + JSON.stringify(infoJson);
          $log.log(logMsg);

          var errReason = "";
          if ("SUCCESS" != headerJson.serv_header.serv_response.serv_result) {
            // if ("" === infoJson) {
            errReason = headerJson.serv_header.serv_response.serv_reason;

            logMsg = funcName + ": " + "ERROR!!!" + "\n" +
              "headerJson=\n" + JSON.stringify(headerJson) + "\n" +
              "errReason=\n" + errReason;
            $log.log(logMsg);
          }

          return ([
            headerJson,
            infoJson,
            errReason
          ]);
        }, // validateXmlData()

        getUserSettingsModel: function () {
          return userSettingsModel;
        }, // getUserSettingsModel()

        getXmlApiInfo: function (
          webexSiteName,
          webexdminID,
          webexAdminSessionTicket,
          webexUser
        ) {

          xmlApiInfo.xmlServerURL = "";
          xmlApiInfo.siteID = "";
          xmlApiInfo.webexAdminID = "";
          xmlApiInfo.webexAdminPswd = "";

          /* TODO
          xmlApiInfo.xmlServerURL = webexSiteName + "/WBXService/XMLService";
          xmlApiInfo.webexAdminID = webexdminID;
          xmlApiInfo.webexSessionTicket = webexAdminSessionTicket;
          */
          xmlApiInfo.webexUserId = webexUser.userName;

          return xmlApiInfo;
        }, // getXmlApiInfo()

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
          // General
          // TODO:
          //   if (???) {
          //     userSettingsModel.general.hiQualVideo.isSiteEnabled = true;
          //   }
          //
          //   if (???) {
          //     userSettingsModel.general.hiQualVideo.value = true;
          //   }
          //
          //   if (???) {
          //     userSettingsModel.general.hiQualVideo.hiDefVideo.value = true;
          //   }

          // Telephony
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.isSiteEnabled = true;

            if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference) {
              userSettingsModel.telephonyPriviledge.callInTeleconf.callInTollOnly.isSiteEnabled = true;
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

          logMsg = funcName + ": " + "\n" +
            "ns1_callInTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing + "\n" +
            "ns1_hybridTeleconference=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference + "\n" +
            "ns1_tollFreeCallinTeleconferencing=" + siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing + "\n" +
            "use_teleConfCallIn=" + userInfoJson.use_privilege.use_teleConfCallIn + "\n" +
            "use_teleConfTollFreeCallIn=" + userInfoJson.use_privilege.use_teleConfTollFreeCallIn;
          // $log.log(logMsg);

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.isSiteEnabled = true;
          //   }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallInInternational) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.value = true;
          }

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.isSiteEnabled == true;
          //

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.value = true;
          //   }

          // TODO:
          //   if (???) {
          //      userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.reqPinEnabled.value = true;
          //   }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallOut) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.value = true;
          }

          if ("true" == userInfoJson.use_privilege.use_teleConfCallOutInternational) {
            userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = true;
          }

          // TODO:
          //   if (???) {
          //     userSettingsModel.telephonyPriviledge.otherTeleconfServices.isSiteEnabled = true;
          //   }

          if ("true" == userInfoJson.use_privilege.use_otherTelephony) {
            userSettingsModel.telephonyPriviledge.otherTeleconfServices.value = true;
          }

          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_voiceOverIp) {
            userSettingsModel.telephonyPriviledge.integratedVoIP.value = true;
          }

          // Event Center
          // TODO:
          //   if (???) {
          //     userSettingsModel.eventCenter.optimizeBandwidthUsage.isSitenEnabled = true;
          //   }
          //
          //   if (???) {
          //     userSettingsModel.eventCenter.optimizeBandwidthUsage.value = true;
          //   }

          // Training Center
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab) {
            userSettingsModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = true;
          }

          if ("true" == userInfoJson.use_privilege.use_labAdmin) {
            userSettingsModel.trainingCenter.handsOnLabAdmin.value = true;
          }
          //---------------- end of user privileges update -----------------//

          return userSettingsModel;
        }, // updateUserSettingsModel()

        getUserInfo: function () {
          var xmlData = XmlApiFact.getUserInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getUserInfo()

        getSiteInfo: function () {
          var xmlData = XmlApiFact.getSiteInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getSiteInfo()

        getMeetingTypeInfo: function () {
          var xmlData = XmlApiFact.getMeetingTypeInfo(xmlApiInfo);

          return $q.all(xmlData);
        }, // getMeetingTypeInfo()

        getUserSettingsInfo: function () {
          var userInfoXml = XmlApiFact.getUserInfo(xmlApiInfo);
          var siteInfoXml = XmlApiFact.getSiteInfo(xmlApiInfo);
          var meetingTypeXml = XmlApiFact.getMeetingTypeInfo(xmlApiInfo);

          return $q.all([userInfoXml, siteInfoXml, meetingTypeXml]);
        }, // getUserSettingsInfo()

        updateUserSettings: function (userSettings) {
          return XmlApiFact.updateUserSettings(xmlApiInfo, userSettings);
        },

        updateUserSettings2: function () {
          var teleConfCallIn = false;
          var teleConfTollFreeCallIn = false;

          if (3 == userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType) {
            teleConfCallIn = true;
            teleConfTollFreeCallIn = true;
          } else if (2 == userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType) {
            teleConfTollFreeCallIn = true;
          } else {
            teleConfCallIn = true;
          }

          userSettingsModel.telephonyPriviledge.teleConfCallIn = teleConfCallIn;
          userSettingsModel.telephonyPriviledge.teleConfTollFreeCallIn = teleConfTollFreeCallIn;

          if (!userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.value) {
            userSettingsModel.telephonyPriviledge.callInTeleconf.cliAuth.reqPinEnabled = false;
          }

          xmlApiInfo.teleConfCallIn = userSettingsModel.telephonyPriviledge.teleConfCallIn;
          xmlApiInfo.teleConfTollFreeCallIn = userSettingsModel.telephonyPriviledge.teleConfTollFreeCallIn;
          xmlApiInfo.teleconfViaGlobalCallin = userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.value;
          xmlApiInfo.callBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.value;
          xmlApiInfo.globalCallBackTeleconf = userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value;
          xmlApiInfo.otherTelephony = userSettingsModel.telephonyPriviledge.otherTeleconfServices.value;
          xmlApiInfo.integratedVoIP = userSettingsModel.telephonyPriviledge.integratedVoIP.value;
          xmlApiInfo.handsOnLabAdmin = userSettingsModel.trainingCenter.handsOnLabAdmin.value;

          return XmlApiFact.updateUserSettings2(xmlApiInfo);
        }, // updateUserSettings2()

        getSessionTicket: function (wbxSiteUrl) {
          return XmlApiFact.getSessionTicket(wbxSiteUrl);
        }, //getSessionTicket()

        xml2JsonConvert: function (
          commentText,
          infoXml,
          startOfBodyStr,
          endOfBodyStr
        ) {
          return XmlApiFact.xml2JsonConvert(
            commentText,
            infoXml,
            startOfBodyStr,
            endOfBodyStr
          );
        }, // xml2JsonConvert()
      }; // return
    } //WebExUserSettingsFact
  ]); // angular
})();
