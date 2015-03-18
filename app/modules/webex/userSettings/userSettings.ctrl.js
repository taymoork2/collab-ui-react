(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$log',
    '$filter',
    '$stateParams',
    'WebExUserSettingsFact',
    'Notification',
    function (
      $scope,
      $log,
      $filter,
      $stateParams,
      WebExUserSettingsFact,
      Notification
    ) {
      this.xmlApiAccessInfo = {
        xmlServerURL: "",
        webexAdminID: "",
        webexAdminPswd: "",
        siteID: "",
        webexSessionTicket: "",
        webexUserId: ""
      };

      this.currentUser = $stateParams.currentUser;
      this.xmlApiAccessInfo.webexUserId = this.currentUser.userName.match(/^([^@]*)@/)[1];

      this.getUserSettingsInfo = function () {
        var currView = this;

        WebExUserSettingsFact.getUserSettingsInfo(this.xmlApiAccessInfo).then(
          function getUserSettingsInfoSuccess(getInfoResult) {
            var funcName = "getUserSettingsInfoSuccess()";
            var logMsg = "";
            // alert(funcName);

            var validateUserInfoResult = WebExUserSettingsFact.validateXmlData(
              "User Data",
              getInfoResult[0],
              "<use:",
              "</serv:bodyContent>"
            );

            currView.userInfoHeaderJson = validateUserInfoResult[0];
            currView.userInfoJson = validateUserInfoResult[1];
            currView.userInfoErrReason = validateUserInfoResult[2];

            var validateSiteInfoResult = WebExUserSettingsFact.validateXmlData(
              "Site Info",
              getInfoResult[1],
              "<ns1:",
              "</serv:bodyContent>"
            );

            currView.siteInfoHeaderJson = validateSiteInfoResult[0];
            currView.siteInfoJson = validateSiteInfoResult[1];
            currView.siteInfoErrReason = validateSiteInfoResult[2];

            var validateMeetingTypesInfoResult = WebExUserSettingsFact.validateXmlData(
              "Meeting Types Info",
              getInfoResult[2],
              "<mtgtype:",
              "</serv:bodyContent>"
            );

            currView.meetingTypesInfoHeaderJson = validateMeetingTypesInfoResult[0];
            currView.meetingTypesInfoJson = validateMeetingTypesInfoResult[1];
            currView.meetingTypesErrReason = validateMeetingTypesInfoResult[2];

            if (
              ("" === currView.userInfoErrReason) &&
              ("" === currView.siteInfoErrReason) &&
              ("" === currView.meetingTypesErrReason)
            ) {
              currView.userSettingsModel = WebExUserSettingsFact.updateUserSettingsModel(
                currView.userInfoJson,
                currView.siteInfoJson,
                currView.meetingTypesInfoJson
              );

              currView.viewReady = true;
              $("#webexUserSettingsPage").removeClass("hidden");
            } else { // xmlapi returns error
              if ("Corresponding User not found" == currView.userInfoErrReason) {
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

          function getUserSettingsInfoError(getInfoResult) {
            var funcName = "getUserSettingsInfoError()";
            var logMsg = "";

            logMsg = funcName + ": " + "getInfoResult=" + JSON.stringify(getInfoResult);
            $log.log(logMsg);
            // alert(logMsg);
          } // getUserSettingsInfoError()
        ); // WebExUserSettingsFact.getUserSettingsInfo()
      }; // getUserSettingsInfo()

      this.disableCmrSwitch = function () {
        var funcName = "disableCmrSwitch()";
        var logMsg = "";

        var disableSwitch = true;
        if (this.viewReady) {
          this.userSettingsModel.sessionTypes.forEach(function (sessionType) {
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
        var funcName = "updateUserSettings()";
        var logMsg = "";

        var userPrivileges = {
          meetingTypes: [],
          meetingCenter: false,
          trainingCenter: false,
          supportCenter: false,
          eventCenter: false,
          salesCenter: false
        };

        // go through the session types
        this.userSettingsModel.sessionTypes.forEach(function (sessionType) {
          if (sessionType.sessionEnabled) {
            userPrivileges.meetingTypes.push(sessionType.sessionTypeId);

            logMsg = funcName + ": " + "\n" +
              "sessionTypeId=" + sessionType.sessionTypeId + "\n" +
              "meetingCenterApplicable=" + sessionType.meetingCenterApplicable + "\n" +
              "trainingCenterApplicable=" + sessionType.trainingCenterApplicable + "\n" +
              "supportCenterApplicable=" + sessionType.supportCenterApplicable + "\n" +
              "eventCenterApplicable=" + sessionType.eventCenterApplicable;
            // $log.log(logMsg);

            if (!userPrivileges.meetingCenter) userPrivileges.meetingCenter = sessionType.meetingCenterApplicable;
            if (!userPrivileges.trainingCenter) userPrivileges.trainingCenter = sessionType.trainingCenterApplicable;
            if (!userPrivileges.supportCenter) userPrivileges.supportCenter = sessionType.supportCenterApplicable;
            if (!userPrivileges.eventCenter) userPrivileges.eventCenter = sessionType.eventCenterApplicable;
            if (!userPrivileges.salesCenter) userPrivileges.salesCenter = sessionType.salesCenterApplicable;
          }
        }); // userSettingsModel.sessionTypes.forEach()

        WebExUserSettingsFact.updateUserSettings(this.xmlApiAccessInfo, userPrivileges).then(
          function () {
            var successMsg = [];
            successMsg.push($filter('translate')('webexUserSettings.userUpdateSuccess'));
            Notification.notify(['User privileges updated'], 'success');
          },
          function () {
            Notification.notify(['User privileges update failed'], 'error');
          }
        );
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.viewReady = false;

      this.userInfoHeaderJson = null;
      this.userInfoJson = null;
      this.userInfoErrReason = "";

      this.siteInfoHeaderJson = null;
      this.siteInfoJson = null;
      this.siteInfoErrReason = "";

      this.meetingTypesInfoHeaderJson = null;
      this.meetingTypesInfoJson = null;
      this.meetingTypesErrReason = "";

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

      this.getUserSettingsInfo();
    } // WebExUserSettingsCtrl()
  ]);
})();
