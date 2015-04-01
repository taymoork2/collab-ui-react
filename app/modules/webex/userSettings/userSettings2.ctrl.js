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

      $scope.userSettingsView.form.$dirty = false;

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

      this.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

      var _self = this;

      this.initPanel();
    } // WebExUserSettings2Ctrl()
  ]);
})();
