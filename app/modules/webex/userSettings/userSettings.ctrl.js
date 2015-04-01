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

      this.getUserName = function () {
        var userName = WebExUserSettingsFact.getUserName();

        $log.log("getUserName(): userName=" + userName);

        return userName;
      }; // getUserName()

      this.initPanel = function () {
        WebExUserSettingsFact.initPanel();
      }; // initPanel()

      this.getUserSettingsInfo = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
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

      this.initPanel();
    } // WebExUserSettingsCtrl()
  ]);
})();
