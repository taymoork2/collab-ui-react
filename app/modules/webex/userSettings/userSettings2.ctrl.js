(function () {
  'use strict';

  angular.module('WebExUserSettings2').controller('WebExUserSettings2Ctrl', [
    '$scope',
    '$log',
    'WebExUserSettingsFact',
    'Notification',
    function (
      $scope,
      $log,
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

              $("#webexUserSettingsPage2").removeClass("hidden");
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

      this.updateUserSettings = function () {
        var funcName = "updateUserSettings()";
        var logMsg = "";

        logMsg = funcName + ": " + "START";
        $log.log(logMsg);

        logMsg = funcName + ": " + "END";
        $log.log(logMsg);
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

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
    } // WebExUserSettings2Ctrl()
  ]);
})();
