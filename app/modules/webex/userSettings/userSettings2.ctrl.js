(function () {
  'use strict';

  angular.module('WebExUserSettings2').controller('WebExUserSettings2Ctrl', [
    '$scope',
    '$log',
    '$filter',
    '$stateParams',
    '$sce',
    'WebExUserSettingsFact',
    'Notification',
    'Authinfo',
    'Config',
    function (
      $scope,
      $log,
      $filter,
      $stateParams,
      $sce,
      WebExUserSettingsFact,
      Notification,
      Authinfo,
      Config
    ) {

      this.getUserSettingsInfo = function () {
        var currView = this;

        WebExUserSettingsFact.getUserSettingsInfo().then(
          function getUserSettingsInfoSuccess(getInfoResult) {
            var funcName = "getUserSettingsInfoSuccess()";
            var logMsg = "";

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
            currView.siteBodyJson = validateSiteInfoResult[1];
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
                currView.siteBodyJson,
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
          } // getUserSettingsInfoError()
        ); // WebExUserSettingsFact.getUserSettingsInfo()
      }; // getUserSettingsInfo()

      this.updateUserSettings = function () {
        var funcName = "updateUserSettings()";
        var logMsg = "";

        logMsg = funcName + ": " + "START";
        $log.log(logMsg);

        WebExUserSettingsFact.updateUserSettings2().then(
          function () {
            var successMsg = [];
            successMsg.push($filter('translate')('webexUserSettings2.updateSuccess'));

            Notification.notify(['Privileges updated'], 'success');
          },
          function () {
            Notification.notify(['Privileges update failed'], 'error');
          }
        );

        logMsg = funcName + ": " + "END";
        $log.log(logMsg);
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.userInfoHeaderJson = null;
      this.userInfoJson = null;
      this.userInfoErrReason = "";

      this.siteInfoHeaderJson = null;
      this.siteBodyJson = null;
      this.siteInfoErrReason = "";

      this.meetingTypesInfoHeaderJson = null;
      this.meetingTypesInfoJson = null;
      this.meetingTypesErrReason = "";

      this.userSettingsModel = WebExUserSettingsFact.getUserSettingsModel();

      var _self = this;
      var webexSiteUrl = "";
      var webexSiteName = "";

      WebExUserSettingsFact.getSessionTicket(webexSiteUrl).then(
        function getSessionTicketSuccess(webexAdminSessionTicket) {
          WebExUserSettingsFact.initXmlApiInfo(
            webexSiteUrl,
            webexSiteName,
            webexAdminSessionTicket
          );

          _self.getUserSettingsInfo();

          $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
          };

          $scope.webexAdvancedUrl = Config.getWebexAdvancedEditUrl(webexSiteUrl);
          $scope.adminEmailParam = Authinfo.getUserName();
          $scope.userEmailParam = $stateParams.currentUser.userName;
        }, // getSessionTicketSuccess()

        function getSessionTicketError(reason) {
          $log.log("WebExUserSettings2Ctrl(): failed to get session ticket");
        } // getSessionTicketError()
      );
    } // WebExUserSettings2Ctrl()
  ]);
})();
