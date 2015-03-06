(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$log',
    'WebExUserSettingsSvc',
    function (
      $scope,
      $log,
      WebExUserSettingsSvc
    ) {
      this.createUserPrivilegesModel = function () {
        var funcName = "createUserPrivilegesModel()";
        var logMsg = "";
        // alert(funcName);

        var userPrivilegesModel = {
          sessionEnablementTitle: "Session Enablement",
          userPrivilegesTitle: "User Privileges",

          sessionTypes: null,

          meetingCenter: {
            label: "Meeting Center",
            serviceType: "MeetingCenter",
            isSiteEnabled: false
          }, // meetingCenter

          trainingCenter: {
            label: "Training Center",
            serviceType: "TrainingCenter",
            isSiteEnabled: false,

            handsOnLabAdmin: {
              id: "handsOnLabAdmin",
              label: "Hands-on Lab Admin (effective only when hands-on lab is enabled)",
              value: false,
              isSiteEnabled: false
            }
          }, // trainingCenter

          eventCenter: {
            label: "Event Center",
            serviceType: "EventCenter",
            isSiteEnabled: false,

            optimizeBandwidthUsage: {
              id: "optimizeBandwidthUsage",
              label: "Optimized bandwidth usage for attendees within the same network",
              value: false,
              isSiteEnabled: false
            }
          }, // eventCenter

          supportCenter: {
            label: "Support Center",
            serviceType: "SupportCenter",
            isSiteEnabled: false
          }, // supportCenter

          /*
          collabRoom: {
            id: "collabRoom",
            label: "Collabration Room",
            value: true
          }, // collabRoom
          */

          /*
          general: {
            label: "General",

            hiQualVideo: {
              id: "hiQualVideo",
              label: "Turn on high-quality video (360p)",
              value: true
            },

            hiDefVideo: {
              id: "hiDefVideo",
              label: "Turn on high-definition video video (720p)",
              value: true
            },
            
          }, // general
          */

          telephonyPriviledge: {
            label: "Telephony Privilege",

            callInTeleconf: {
              id: "callInTeleconf",
              label: "Call-in teleconferencing",
              value: true,
              isSiteEnabled: false,
              selectedCallInTollType: 0,

              callInTollOnly: {
                id: "tollOnly",
                label: "Toll",
                isSiteEnabled: true,
                value: 1
              },

              callInTollFreeOnly: {
                id: "tollFreeOnly",
                label: "Toll free",
                isSiteEnabled: true,
                value: 2
              },

              callInTollAndTollFree: {
                id: "tollAndTollFree",
                label: "Toll & Toll free",
                isSiteEnabled: true,
                value: 3
              },

              teleconfViaGlobalCallin: {
                id: "teleconfViaGlobalCallin",
                label: "Allow access to teleconference via global call-in numbers",
                value: true
              },

              cliAuth: {
                id: "cliAuth",
                label: "Enable teleconferencing CLI authentication",
                value: true
              }
            }, // callInTeleconf

            callBackTeleconf: {
              id: "callBackTeleconf",
              label: "Call-back teleconferencing",
              value: true,

              globalCallBackTeleconf: {
                id: "globalCallBackTeleconf",
                label: "Global call-back teleconferencing",
                value: true
              },
            },

            otherTeleconfServices: {
              id: "otherTeleconfServices",
              label: "Other teleconference services",
              value: true
            },

            integratedVoIP: {
              id: "integratedVoIP",
              label: "Integrated VoIP",
              value: true
            },

            selectTeleconfLocation: {
              id: "selectTeleconfLocation",
              label: "Select teleconferencing location",
              value: true,
              defaultTeleconfLocation: "Asia",

              teleconfLocations: ["North America",
                "South America",
                "Asia",
                "Africa",
                "Australia"
              ]
            } //selectTeleconfLocation
          }, // telephonyPriviledges
        }; // userPrivilegesModel

        this.userPrivilegesModel = userPrivilegesModel;
      }; // createUserPrivilegesModel()

      this.getUserSettingsInfo = function () {
        var funcName = "getUserSettingsInfo()";
        var logMsg = "";
        // alert(funcName);

        var currView = this;
        var xmlApiAccessInfo = {
          xmlServerURL: "http://172.24.93.53/xml9.0.0/XMLService",
          webexAdminID: "jpallapa",
          webexAdminPswd: "C!sco123",
          siteID: "4272",
          PartnerID: "4272",
          webexSessionTicket: null,
          webexUserId: "jpallapa"
        };

        WebExUserSettingsSvc.getUserSettingsInfo(xmlApiAccessInfo).then(
          function getUserSettingsInfoSuccess(result) {
            var funcName = "getUserSettingsInfoSuccess()";
            var logMsg = "";
            // alert(funcName);

            currView.userInfoXml = result[0];
            currView.siteInfoXml = result[1];
            currView.meetingTypesInfoXml = result[2];

            var validResult = true;
            // TODO:
            //   add code to validate the returned data

            if (validResult) {
              currView.userInfoJson = currView.xml2JsonConvert("User Data", result[0], "<use:", "</serv:bodyContent>");
              currView.siteInfoJson = currView.xml2JsonConvert("Site Info", result[1], "<ns1:", "</serv:bodyContent>");
              currView.meetingTypesInfoJson = currView.xml2JsonConvert("Meeting Types Info", result[2], "<mtgtype:", "</serv:bodyContent>");

              currView.updateUserPrivilegesModel();
              $("#webexUserSettingsPage").removeClass("hidden");
            }
          }, // getUserSettingsInfoSuccess()

          function getUserSettingsInfoError(result) {
            var funcName = "getUserSettingsInfoError()";
            var logMsg = "";

            logMsg = funcName + ": " + "result=" + JSON.stringify(result);
            alert(logMsg);
          } // getUserSettingsInfoError()
        ); // WebExUserSettingsSvc.getUserSettingsInfo()
      }; // getUserSettingsInfo()

      this.updateUserPrivilegesModel = function () {
        var funcName = "updateUserPrivilegesModel()";
        var logMsg = null;
        // alert(funcName);

        var currView = this;
        var userPrivilegesModel = currView.userPrivilegesModel;
        var userInfoJson = currView.userInfoJson.body;
        var siteInfoJson = currView.siteInfoJson.body;
        var meetingTypesInfoJson = currView.meetingTypesInfoJson.body;

        //---------------- start of center status update ----------------//
        var siteServiceTypes = [].concat(siteInfoJson.ns1_siteInstance.ns1_metaData.ns1_serviceType);

        siteServiceTypes.forEach(function (siteServiceType) {
          if (siteServiceType == userPrivilegesModel.meetingCenter.label) {
            userPrivilegesModel.meetingCenter.isSiteEnabled = true;
          } else if (siteServiceType == userPrivilegesModel.eventCenter.label) {
            userPrivilegesModel.eventCenter.isSiteEnabled = true;
          } else if (siteServiceType == userPrivilegesModel.trainingCenter.label) {
            userPrivilegesModel.trainingCenter.isSiteEnabled = true;
          } else if (siteServiceType == userPrivilegesModel.supportCenter.label) {
            userPrivilegesModel.supportCenter.isSiteEnabled = true;
          }
        }); // siteServiceTypes.forEach()
        //---------------- end of center status update ----------------//

        //---------------- start of session types update ----------------//
        var siteMeetingTypes = meetingTypesInfoJson.mtgtype_meetingType;
        var sessionTypes = new Array;

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
            $log.log(logMsg);
            // alert(logMsg);
          }

          var meetingCenterApplicable = false;
          var trainingCenterApplicable = false;
          var eventCenterApplicable = false;
          var supportCenterApplicable = false;

          siteMtgServiceTypes.forEach(function (siteMtgServiceType) {
            if (userPrivilegesModel.meetingCenter.serviceType == siteMtgServiceType) {
              meetingCenterApplicable = true;
            } else if (userPrivilegesModel.eventCenter.serviceType == siteMtgServiceType) {
              if ("AUO" != siteMtgProductCodePrefix) {
                eventCenterApplicable = true;
              }
            } else if (userPrivilegesModel.trainingCenter.serviceType == siteMtgServiceType) {
              if ("AUO" != siteMtgProductCodePrefix) {
                trainingCenterApplicable = true;
              }
            } else if (userPrivilegesModel.supportCenter.serviceType == siteMtgServiceType) {
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

        userPrivilegesModel.sessionTypes = sessionTypes;
        var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

        logMsg = funcName + ": " + "\n" +
          "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
        $log.log(logMsg);
        // alert(logMsg);

        enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
          userPrivilegesModel.sessionTypes.forEach(function (sessionType) {
            var sessionTypeId = sessionType.sessionTypeId;

            logMsg = funcName + ": " + "\n" +
              "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
              "sessionTypeId=" + sessionTypeId;
            $log.log(logMsg);
            // alert(logMsg);

            if (sessionType.sessionTypeId == enabledSessionTypeID) {
              sessionType.sessionEnabled = true;
            }
          }); // userPrivilegesModel.sessionTypes.forEach()
        }); // enabledSessionTypesIDs.forEach()
        //---------------- end of session types update ----------------//

        //---------------- start of user privileges update -----------------//
        if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callInTeleconferencing) {
          userPrivilegesModel.telephonyPriviledge.callInTeleconf.isSiteEnabled = true;
        }

        if (userPrivilegesModel.telephonyPriviledge.callInTeleconf.isSiteEnabled) {
          if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference) {
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollOnly.isSiteEnabled = true;
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollFreeOnly.isSiteEnabled = true;
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollAndTollFree.isSiteEnabled = true;
          } else if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_hybridTeleconference) {
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollFreeOnly.isSiteEnabled = true;
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollAndTollFree.isSiteEnabled = true;
          } else if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_tollFreeCallinTeleconferencing) {
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollFreeOnly.isSiteEnabled = true;
          } else {
            userPrivilegesModel.telephonyPriviledge.callInTeleconf.callInTollOnly.isSiteEnabled = true;
          }
        }

        if (
          ("true" == userInfoJson.use_privilege.use_teleConfCallIn) &&
          ("true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn)
        ) {
          userPrivilegesModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 3;
        } else if ("true" == userInfoJson.use_privilege.use_teleConfTollFreeCallIn) {
          userPrivilegesModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 2;
        } else {
          userPrivilegesModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 1;
        }

        // TODO:
        //   add code to update:
        //     userPrivilegesModel.eventCenter.optimizeBandwidthUsage.isSiteEnabled
        //     userPrivilegesModel.eventCenter.optimizeBandwidthUsage.value

        if ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab) {
          userPrivilegesModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = true;
        }

        if ("true" == userInfoJson.use_privilege.use_labAdmin) {
          userPrivilegesModel.trainingCenter.handsOnLabAdmin.value = true;
        }
        //---------------- start of user privileges update -----------------//
      }; // updateUserPrivilegesModel()

      this.updateUserSettings = function () {
        alert("updateUserSettings(): START");
        alert("updateUserSettings(): END");
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.xml2JsonConvert = WebExUserSettingsSvc.xml2JsonConvert;

      this.userInfoXml = null;
      this.userInfoJson = null;

      this.siteInfoXml = null;
      this.siteInfoJson = null;

      this.meetingTypesInfoXml = null;
      this.meetingTypesInfoJson = null;

      this.createUserPrivilegesModel();
      this.getUserSettingsInfo();
    } // WebExUserSettingsCtrl()
  ]);
})();
