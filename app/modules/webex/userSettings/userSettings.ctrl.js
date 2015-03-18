(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$log',
    'WebExUserSettingsSvc',
    'WebexUserPrivilegesModel',
    'Notification',
    '$filter',
    '$stateParams',
    function (
      $scope,
      $log,
      WebExUserSettingsSvc,
      userPrivilegesModel,
      Notification,
      $filter,
      $stateParams
    ) {
      this.currentUser = $stateParams.currentUser;

      this.xmlApiAccessInfo = {
        xmlServerURL: "",
        webexAdminID: "",
        webexAdminPswd: "",
        siteID: null,
        webexSessionTicket: null,
        webexUserId: ""
      };

      this.xmlApiAccessInfo.webexUserId = this.currentUser.userName.match(/^([^@]*)@/)[1]; // stripping out the @domain part and keeping only username for now

      this.getUserSettingsInfo = function () {
        var currView = this;

        WebExUserSettingsSvc.getUserSettingsInfo(this.xmlApiAccessInfo).then(
          function getUserSettingsInfoSuccess(result) {
            var funcName = "getUserSettingsInfoSuccess()";
            var logMsg = "";
            // alert(funcName);

            logMsg = funcName + ": " + "\n" +
              "userInfoXml=\n" + result[0];
            // $log.log(logMsg);

            logMsg = funcName + ": " + "\n" +
              "siteInfoXml=\n" + result[1];
            // $log.log(logMsg);

            logMsg = funcName + ": " + "\n" +
              "meetingTypesInfoXml=\n" + result[2];
            // $log.log(logMsg);

            currView.userInfoXml = result[0];
            currView.userInfoJson = WebExUserSettingsSvc.xml2JsonConvert("User Data", currView.userInfoXml, "<use:", "</serv:bodyContent>").body;

            currView.siteInfoXml = result[1];
            currView.siteInfoJson = WebExUserSettingsSvc.xml2JsonConvert("Site Info", currView.siteInfoXml, "<ns1:", "</serv:bodyContent>").body;

            currView.meetingTypesInfoXml = result[2];
            currView.meetingTypesInfoJson = WebExUserSettingsSvc.xml2JsonConvert("Meeting Types Info", currView.meetingTypesInfoXml, "<mtgtype:", "</serv:bodyContent>").body;

            var userInfoHeaderJson = "";
            var userInfoErrorReason = "";
            if ("" === currView.userInfoJson) {
              userInfoHeaderJson = WebExUserSettingsSvc.xml2JsonConvert(
                "User Data Header",
                currView.userInfoXml,
                "<serv:header>",
                "<serv:body>"
              ).body;

              userInfoErrorReason = userInfoHeaderJson.serv_header.serv_response.serv_reason;
            }

            var siteInfoHeaderJson = "";
            var siteInfoErrorReason = "";
            if ("" === currView.siteInfoJson) {
              siteInfoHeaderJson = WebExUserSettingsSvc.xml2JsonConvert(
                "Site Info Header",
                currView.siteInfoXml,
                "<serv:header>",
                "<serv:body>"
              ).body;

              siteInfoErrorReason = siteInfoHeaderJson.serv_header.serv_response.serv_reason;
            }

            var meetingTypesInfoHeaderJson = "";
            var meetingTypesErrorReason = "";
            if ("" === currView.meetingTypesInfoJson) {
              meetingTypesInfoHeaderJson = WebExUserSettingsSvc.xml2JsonConvert(
                "Meeting Types Info Header",
                currView.meetingTypesInfoXml,
                "<serv:header>",
                "<serv:body>"
              ).body;

              meetingTypesErrorReason = meetingTypesInfoHeaderJson.serv_header.serv_response.serv_reason;
            }

            if (
              ("" === userInfoErrorReason) &&
              ("" === siteInfoErrorReason) &&
              ("" === meetingTypesErrorReason)
            ) {
              currView.updateUserPrivilegesModel();
            } else { // xmlapi returns error
              logMsg = funcName + ": " + "ERROR!!!" + "\n" +
                "userInfoHeaderJson=\n" + JSON.stringify(userInfoHeaderJson) + "\n" +
                "siteInfoHeaderJson=\n" + JSON.stringify(siteInfoHeaderJson) + "\n" +
                "meetingTypesInfoHeaderJson=\n" + JSON.stringify(meetingTypesInfoHeaderJson);
              $log.log(logMsg);

              if ("Corresponding User not found" == userInfoErrorReason) {
                // TODO
                //   handle invalid user error
                logMsg = funcName + ": " + "INVALID USER!!!";
                $log.log(logMsg);
              } else {
                // TODO
                //   handle all other errors
                logMsg = funcName + ": " + "OTHER ERROR!!!";
                $log.log(logMsg);
              }
            } // xmlapi returns error
          }, // getUserSettingsInfoSuccess()

          function getUserSettingsInfoError(result) {
            var funcName = "getUserSettingsInfoError()";
            var logMsg = "";

            logMsg = funcName + ": " + "result=" + JSON.stringify(result);
            $log.log(logMsg);
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
        var userInfoJson = currView.userInfoJson;
        var siteInfoJson = currView.siteInfoJson;
        var meetingTypesInfoJson = currView.meetingTypesInfoJson;

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
        }

        userPrivilegesModel.sessionTypes = sessionTypes;
        var enabledSessionTypesIDs = [].concat(userInfoJson.use_meetingTypes.use_meetingType);

        logMsg = funcName + ": " + "\n" +
          "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
        // $log.log(logMsg);
        // alert(logMsg);

        enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
          userPrivilegesModel.sessionTypes.forEach(function (sessionType) {
            var sessionTypeId = sessionType.sessionTypeId;

            logMsg = funcName + ": " + "\n" +
              "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
              "sessionTypeId=" + sessionTypeId;
            // $log.log(logMsg);
            // alert(logMsg);

            if (sessionType.sessionTypeId == enabledSessionTypeID) {
              sessionType.sessionEnabled = true;
            }
          }); // userPrivilegesModel.sessionTypes.forEach()
        }); // enabledSessionTypesIDs.forEach()
        //---------------- end of session types update ----------------//

        //---------------- start of cmr update----------------//
        if ("true" == siteInfoJson.ns1_siteInstance.ns1_siteCommonOptions.ns1_EnableCloudTelepresence) {
          userPrivilegesModel.collabMeetingRoom.isSiteEnabled = true;
        }

        if ("true" == userInfoJson.use_privilege.use_isEnableCET) {
          userPrivilegesModel.collabMeetingRoom.value = true;
        }
        //---------------- end of cmr update ----------------//

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

        //
        if ("true" == userInfoJson.use_privilege.use_teleConfCallInInternational) {
          userPrivilegesModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallin.value = true;
        }

        if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_callBackTeleconferencing) {
          userPrivilegesModel.telephonyPriviledge.callBackTeleconf.isSiteEnabled = true;
        }

        if ("true" == userInfoJson.use_privilege.use_teleConfCallOut) {
          userPrivilegesModel.telephonyPriviledge.callBackTeleconf.value = true;
        }

        if ("true" == userInfoJson.use_privilege.use_teleConfCallOutInternational) {
          userPrivilegesModel.telephonyPriviledge.integratedVoIP.value = true;
        }

        if ("true" == userInfoJson.use_privilege.use_otherTelephony) {
          userPrivilegesModel.telephonyPriviledge.otherTeleconfServices.value = true;
        }

        if ("true" == siteInfoJson.ns1_siteInstance.ns1_telephonyConfig.ns1_internetPhone) {
          userPrivilegesModel.telephonyPriviledge.integratedVoIP.isSiteEnabled = true;
        }

        if ("true" == userInfoJson.use_privilege.use_voiceOverIp) {
          userPrivilegesModel.telephonyPriviledge.integratedVoIP.value = true;
        }

        if ("true" == siteInfoJson.ns1_siteInstance.ns1_tools.ns1_handsOnLab) {
          userPrivilegesModel.trainingCenter.handsOnLabAdmin.isSiteEnabled = true;
        }

        if ("true" == userInfoJson.use_privilege.use_labAdmin) {
          userPrivilegesModel.trainingCenter.handsOnLabAdmin.value = true;
        }
        //---------------- end of user privileges update -----------------//

        this.viewReady = true;
        $("#webexUserSettingsPage").removeClass("hidden");
      }; // updateUserPrivilegesModel()

      this.disableCmrSwitch = function () {
        var funcName = "disableCmrSwitch()";
        var logMsg = "";

        var disableSwitch = true;
        if (this.viewReady) {
          this.userPrivilegesModel.sessionTypes.forEach(function (sessionType) {
            var meetingCenterApplicable = sessionType.meetingCenterApplicable;
            var sessionEnabled = sessionType.sessionEnabled;

            if (meetingCenterApplicable && sessionEnabled) {
              disableSwitch = false;
            }
          }); // sessionTypes.forEach()
        }

        return disableSwitch;
      }; // disableCmrSwitch()

      this.updateUserSettings = function () {
        $log.log("updateUserSettings(): START");

        var userPrivileges = {
          meetingTypes: [],
          meetingCenter: false,
          trainingCenter: false,
          supportCenter: false,
          eventCenter: false,
          salesCenter: false
        };

        //go through the session types
        userPrivilegesModel.sessionTypes.forEach(function (sessionType) {
          if (sessionType.sessionEnabled) {
            userPrivileges.meetingTypes.push(sessionType.sessionTypeId);
            $log.log("sessionType.sessionTypeId = " + sessionType.sessionTypeId);
            $log.log("sessionType.trainingCenterApplicable = " + sessionType.trainingCenterApplicable);
            if (!userPrivileges.meetingCenter) userPrivileges.meetingCenter = sessionType.meetingCenterApplicable ? true : false;
            if (!userPrivileges.trainingCenter) userPrivileges.trainingCenter = sessionType.trainingCenterApplicable ? true : false;
            if (!userPrivileges.supportCenter) userPrivileges.supportCenter = sessionType.supportCenterApplicable ? true : false;
            if (!userPrivileges.eventCenter) userPrivileges.eventCenter = sessionType.eventCenterApplicable ? true : false;
            if (!userPrivileges.salesCenter) userPrivileges.salesCenter = sessionType.salesCenterApplicable ? true : false;
          }
        });

        WebExUserSettingsSvc.updateUserSettings(this.xmlApiAccessInfo, userPrivileges)
          .then(function () {
              var successMsg = [];
              successMsg.push($filter('translate')('webexUserSettings.userUpdateSuccess'));
              Notification.notify(['User privileges updated'], 'success');
            },
            function () {
              Notification.notify(['User privileges update failed'], 'error');
            });

        $log.log("updateUserSettings(): END");
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.viewReady = false;

      this.userInfoXml = null;
      this.userInfoJson = null;

      this.siteInfoXml = null;
      this.siteInfoJson = null;

      this.meetingTypesInfoXml = null;
      this.meetingTypesInfoJson = null;

      this.xml2JsonConvert = WebExUserSettingsSvc.xml2JsonConvert;
      this.getSessionTicket = WebExUserSettingsSvc.getSessionTicket;

      this.userPrivilegesModel = userPrivilegesModel;

      this.getUserSettingsInfo();
    } // WebExUserSettingsCtrl()
  ]);
})();
