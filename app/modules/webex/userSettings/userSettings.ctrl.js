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

      this.btnReload = function () {
        if (this.userSettingsModel.sessionTicketErr) {
          this.initPanel();
        } else {
          this.getUserSettingsInfo();
        }
      }; // btnReload()

      this.btnSave = function () {
        var funcName = "btnSave()";
        var logMsg = "";

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

        WebExUserSettingsFact.updateUserSettings(userSettings);
      }; // btnSave()

      this.initPanel = function () {
        WebExUserSettingsFact.initPanel();
      }; // initPanel()

      this.getUserSettingsInfo = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
      }; // getUserSettingsInfo()

      //----------------------------------------------------------------------//

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

      this.initPanel();
    } // WebExUserSettingsCtrl()
  ]);
})();
