(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    'WebExUserSettingsFact',
    'Notification',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      WebExUserSettingsFact,
      Notification
    ) {
      // Update the breadcrumb with site url
      $state.current.data.displayName = $stateParams.site;
      $rootScope.$broadcast('displayNameUpdated');

      this.initPanel = function () {
        WebExUserSettingsFact.initPanel();
      }; // initPanel()

      this.getUserSettingsInfo = function (form) {
        WebExUserSettingsFact.getUserSettingsInfo(form);
      }; // getUserSettingsInfo()

      this.btnReload = function () {
        var funcName = "btnReload()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "sessionTicketErr=" + this.userSettingsModel.sessionTicketErr;
        // $log.log(logMsg);

        if (this.userSettingsModel.sessionTicketErr) {
          this.initPanel();
        } else {
          this.getUserSettingsInfo(null);
        }
      }; // btnReload()

      this.btnSave = function (form) {
        WebExUserSettingsFact.updateUserSettings(form);
      }; // btnSave()

      this.btnReset = function (form) {
        this.getUserSettingsInfo(form);
      }; // btnReset()

      //----------------------------------------------------------------------//

      $log.log("Show panel3");

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();
      this.initPanel();
    } // WebExUserSettingsCtrl()
  ]);
})();
