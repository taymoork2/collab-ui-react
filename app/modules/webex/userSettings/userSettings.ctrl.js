(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$log',
    'WebExUserSettingsSvc',
    'Notification',
    function (
      $scope,
      $log,
      WebExUserSettingsSvc,
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

            currView.userInfoJson = WebExUserSettingsSvc.xml2JsonConvert("User Data", result[0], "<use:", "</serv:bodyContent>").body;
            currView.siteInfoJson = WebExUserSettingsSvc.xml2JsonConvert("Site Info", result[1], "<ns1:", "</serv:bodyContent>").body;
            currView.meetingTypesInfoJson = WebExUserSettingsSvc.xml2JsonConvert("Meeting Types Info", result[2], "<mtgtype:", "</serv:bodyContent>").body;

            if ("" === currView.userInfoJson) {
              currView.userInfoErrHeaderJson = WebExUserSettingsSvc.xml2JsonConvert(
                "User Data Header",
                result[0],
                "<serv:header>",
                "<serv:body>"
              ).body;

              this.userInfoErrReason = currView.userInfoErrHeaderJson.serv_header.serv_response.serv_reason;

              logMsg = funcName + ": " + "ERROR!!!" + "\n" +
                "userInfoErrHeaderJson=\n" + JSON.stringify(currView.userInfoErrHeaderJson) + "\n" +
                "userInfoErrReason=\n" + currView.userInfoErrReason;
              $log.log(logMsg);
            }

            if ("" === currView.siteInfoJson) {
              currView.siteInfoErrHeaderJson = WebExUserSettingsSvc.xml2JsonConvert(
                "Site Info Header",
                result[1],
                "<serv:header>",
                "<serv:body>"
              ).body;

              currView.siteInfoErrReason = currView.siteInfoErrHeaderJson.serv_header.serv_response.serv_reason;

              logMsg = funcName + ": " + "ERROR!!!" + "\n" +
                "siteInfoErrHeaderJson=\n" + JSON.stringify(currView.siteInfoErrHeaderJson) + "\n" +
                "siteInfoErrReason=\n" + currView.siteInfoErrReason;
              $log.log(logMsg);
            }

            if ("" === currView.meetingTypesInfoJson) {
              currView.meetingTypesInfoErrHeaderJson = WebExUserSettingsSvc.xml2JsonConvert(
                "Meeting Types Info Header",
                result[2],
                "<serv:header>",
                "<serv:body>"
              ).body;

              currView.meetingTypesErrReason = currView.meetingTypesInfoErrHeaderJson.serv_header.serv_response.serv_reason;

              logMsg = funcName + ": " + "ERROR!!!" + "\n" +
                "meetingTypesInfoErrHeaderJson=\n" + JSON.stringify(currView.meetingTypesInfoErrHeaderJson) + "\n" +
                "meetingTypesErrReason=\n" + currView.meetingTypesErrReason;
              $log.log(logMsg);
            }

            if (
              ("" === currView.userInfoErrReason) &&
              ("" === currView.siteInfoErrReason) &&
              ("" === currView.meetingTypesErrReason)
            ) {
              currView.userSettingsModel = WebExUserSettingsSvc.updateUserSettingsModel(
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

          function getUserSettingsInfoError(result) {
            var funcName = "getUserSettingsInfoError()";
            var logMsg = "";

            logMsg = funcName + ": " + "result=" + JSON.stringify(result);
            $log.log(logMsg);
            // alert(logMsg);
          } // getUserSettingsInfoError()
        ); // WebExUserSettingsSvc.getUserSettingsInfo()
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
        var FuncName = "updateUserSettings()";
        var logMsg = "";
        
        logMsg = funcName + ": " + "START";
        $log.log(logMsg);

        var userPrivileges = {
          meetingTypes: [],
          meetingCenter: false,
          trainingCenter: false,
          supportCenter: false,
          eventCenter: false,
          salesCenter: false
        };

        //go through the session types
        this.userSettingsModel.sessionTypes.forEach(function (sessionType) {
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
              Notification.notify(['User privileges updated'], 'success');
            },
            function () {
              Notification.notify(['User privileges update failed'], 'error');
            });

        logMsg = funcName + ": " + "END";
        $log.log(logMsg);
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.viewReady = false;

      this.userInfoJson = null;
      this.userInfoErrHeaderJson = "";
      this.userInfoErrReason = "";

      this.siteInfoJson = null;
      this.siteInfoErrHeaderJson = "";
      this.siteInfoErrReason = "";

      this.meetingTypesInfoJson = null;
      this.meetingTypesInfoErrHeaderJson = "";
      this.meetingTypesErrReason = "";

      this.userSettingsModel = WebExUserSettingsSvc.initUserSettingsModel();

      this.getUserSettingsInfo();
    } // WebExUserSettingsCtrl()
  ]);
})();
