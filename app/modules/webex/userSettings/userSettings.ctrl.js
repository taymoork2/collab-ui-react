(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$log',
    'WebExUserSettingsSvc',
    'WebexUserPrivilegesModel',
    function (
      $scope,
      $log,
      WebExUserSettingsSvc,
      userPrivilegesModel
    ) {

      // this.createUserPrivilegesModel = function () {
      //   this.userPrivilegesModel = userPrivilegesModel;
      // };

      this.getUserSettingsInfo = function () {
        var currView = this;
        var xmlApiAccessInfo = {
          xmlServerURL: "",
          webexAdminID: "",
          webexAdminPswd: "",
          siteID: "4272",
          PartnerID: "4272",
          webexSessionTicket: null,
          webexUserId: ""
        };

        WebExUserSettingsSvc.getUserSettingsInfo(xmlApiAccessInfo).then(
          function getUserSettingsInfoSuccess(result) {
            currView.userInfoXml = result[0];
            currView.siteInfoXml = result[1];
            currView.meetingTypesInfoXml = result[2];

            var validResult = true;
            // TODO:
            //   add code to validate the returned data

            if (validResult) {
              currView.userInfoJson = WebExUserSettingsSvc.xml2JsonConvert("User Data", result[0], "<use:", "</serv:bodyContent>");
              currView.siteInfoJson = WebExUserSettingsSvc.xml2JsonConvert("Site Info", result[1], "<ns1:", "</serv:bodyContent>");
              currView.meetingTypesInfoJson = WebExUserSettingsSvc.xml2JsonConvert("Meeting Types Info", result[2], "<mtgtype:", "</serv:bodyContent>");

              currView.updateUserPrivilegesModel();
              $("#webexUserSettingsPage").removeClass("hidden");
            }
          }, // getUserSettingsInfoSuccess()

          function getUserSettingsInfoError(result) {
            var funcName = "getUserSettingsInfoError()";
            var logMsg = "";

            logMsg = funcName + ": " + "result=" + JSON.stringify(result);
            // alert(logMsg);
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
        var sessionTypes = [];

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
        // alert("updateUserSettings(): START");
        // alert("updateUserSettings(): END");
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.xml2JsonConvert = WebExUserSettingsSvc.xml2JsonConvert;
      this.getSessionTicket = WebExUserSettingsSvc.getSessionTicket;

      this.userInfoXml = null;
      this.userInfoJson = null;

      this.siteInfoXml = null;
      this.siteInfoJson = null;

      this.meetingTypesInfoXml = null;
      this.meetingTypesInfoJson = null;

      this.userPrivilegesModel = userPrivilegesModel;

      this.getUserSettingsInfo();
    } // WebExUserSettingsCtrl()
  ]);
})();
