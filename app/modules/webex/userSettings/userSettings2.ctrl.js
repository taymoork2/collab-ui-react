(function () {
  'use strict';

  angular.module('WebExUserSettings2').controller('WebExUserSettings2Ctrl', [
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
        var funcName = "getUserSettingsInfo()";
        var logMsg = "";

        $log.log(funcName);

        var currView = this;

        WebExUserSettingsSvc.getUserSettingsInfo(this.xmlApiAccessInfo).then(
          function getUserSettingsInfoSuccess(result) {
            var funcName = "getUserSettingsInfoSuccess()";
            var logMsg = "";

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

          function getUserSettingsInfoError(result) {
            var funcName = "getUserSettingsInfoError()";
            var logMsg = "";

            logMsg = funcName + ": " + "result=" + JSON.stringify(result);
            $log.log(logMsg);
            // alert(logMsg);
          } // getUserSettingsInfoError()
        ); // WebExUserSettingsSvc.getUserSettingsInfo()
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
    } // WebExUserSettings2Ctrl()
  ]);
})();
