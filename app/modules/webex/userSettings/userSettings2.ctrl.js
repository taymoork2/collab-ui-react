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
      $scope.webexAdvancedUrl = Config.getWebexAdvancedEditUrl(WebExUserSettingsFact.getSiteUrl());
      $scope.adminEmailParam = Authinfo.getUserName();
      $scope.userEmailParam = $stateParams.currentUser.userName;

      this.btnSave = function () {
        var funcName = "btnSave()";
        var logMsg = "";

        WebExUserSettingsFact.updateUserSettings2();
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

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()
    } // WebExUserSettings2Ctrl()
  ]);
})();
