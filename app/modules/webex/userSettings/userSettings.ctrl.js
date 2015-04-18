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

      this.btnSave = function (form) {
        var funcName = "btnSave()";
        var logMsg = "";

        WebExUserSettingsFact.updateUserSettings(form);
      }; // btnSave()

      this.initPanel = function () {
        WebExUserSettingsFact.initPanel();
      }; // initPanel()

      this.getUserSettingsInfo = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
      }; // getUserSettingsInfo()

      this.reset = function (form) {
        form.$setPristine();
        form.$setUntouched();
        this.getUserSettingsInfo();
      }; //reset()

      //----------------------------------------------------------------------//

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

      this.initPanel();
    } // WebExUserSettingsCtrl()
  ]);
})();
