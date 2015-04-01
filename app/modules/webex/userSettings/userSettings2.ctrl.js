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
        $scope.webexAdvancedUrl = Config.getWebexAdvancedEditUrl(WebExUserSettingsFact.getSiteUrl());
        $scope.adminEmailParam = Authinfo.getUserName();
        $scope.userEmailParam = $stateParams.currentUser.userName;

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

      this.initPanel();

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()
    } // WebExUserSettings2Ctrl()
  ]);
})();
