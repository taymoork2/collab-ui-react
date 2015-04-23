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

      this.btnReload = function () {
        var funcName = "btnReload()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "sessionTicketErr=" + this.userSettingsModel.sessionTicketErr;
        // $log.log(logMsg);

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
