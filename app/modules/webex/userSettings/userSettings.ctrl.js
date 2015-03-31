(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$log',
    '$translate',
    '$filter',
    '$stateParams',
    'WebExUserSettingsFact',
    'Notification',
    function (
      $scope,
      $log,
      $translate,
      $filter,
      $stateParams,
      WebExUserSettingsFact,
      Notification
    ) {

      /**
       * If user does not have first and last names, use the email address as the display name
       */
      this.getGivenName = function () {
        if ($stateParams.currentUser.displayName) {
              return $stateParams.currentUser.displayName;
        }

        if (!$stateParams.currentUser.name) {
          return $stateParams.currentUser.userName;
        }

        if (
          ($stateParams.currentUser.name.givenName === "") &&
          ($stateParams.currentUser.name.familyName === "")
        ) {
          return $stateParams.currentUser.userName;
        }

        return $stateParams.currentUser.name.givenName;
      }; // getGivenName()

      this.getFamilyName = function () {
        if (!$stateParams.currentUser.name || $stateParams.currentUser.displayName) {
          return "";
        }

        return $stateParams.currentUser.name.familyName;
      }; // getFamilyName()

      this.getUserSettingsInfo = function () {
        angular.element('#reloadBtn').button('loading'); //show spinning icon in "Try again" button

        var getUserSettingsInfoResult = WebExUserSettingsFact.getUserSettingsInfo();

        angular.element('#reloadBtn').button('reset'); // Reset "try again button" to normal state
      }; // getUserSettingsInfo()

      this.updateUserSettings = function () {
        var funcName = "updateUserSettings()";
        var logMsg = "";

        logMsg = funcName + ": " + "START";
        // $log.log(logMsg);

        var useSupportedServices = this.userSettingsModel.userInfo.bodyJson.use_supportedServices;

        var userSettings = {
          meetingTypes: [],
          meetingCenter: useSupportedServices.use_meetingCenter,
          trainingCenter: useSupportedServices.use_trainingCenter,
          supportCenter: useSupportedServices.use_supportCenter,
          eventCenter: useSupportedServices.use_eventCenter,
          salesCenter: useSupportedServices.use_salesCenter
        };

        // go through the session types
        this.userSettingsModel.sessionTypes.forEach(function (sessionType) {
          if (sessionType.sessionEnabled) {
            userSettings.meetingTypes.push(sessionType.sessionTypeId);
          }
        }); // userSettingsModel.sessionTypes.forEach()

        WebExUserSettingsFact.updateUserSettings(userSettings).then(
          function () {
            var successMsg = [];
            successMsg.push($filter('translate')('webexUserSettings.updateSuccess'));
            Notification.notify(['Session Enablement updated'], 'success');
          },
          function () {
            Notification.notify(['Session Enablement update failed'], 'error');
          }
        );

        logMsg = funcName + ": " + "END";
        $log.log(logMsg);
      }; // updateUserSettings()

      //----------------------------------------------------------------------//

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

      var _self = this;
      var webexSiteUrl = WebExUserSettingsFact.getSiteUrl();
      var webexSiteName = WebExUserSettingsFact.getSiteName(webexSiteUrl);

      WebExUserSettingsFact.getSessionTicket(webexSiteUrl).then(
        function getSessionTicketSuccess(webexAdminSessionTicket) {
          WebExUserSettingsFact.initXmlApiInfo(
            webexSiteUrl,
            webexSiteName,
            webexAdminSessionTicket
          );

          _self.getUserSettingsInfo();
        }, // getSessionTicketSuccess()

        function getSessionTicketError(reason) {
          $log.log("WebExUserSettingsCtrl(): failed to get session ticket");
        } // getSessionTicketError
      );
    } // WebExUserSettingsCtrl()
  ]);
})();
