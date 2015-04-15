(function () {
  'use strict';

  angular.module('WebExUserSettings2').controller('WebExUserSettings2Ctrl', [
    '$scope',
    '$log',
    '$filter',
    '$stateParams',
    '$translate',
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
      $translate,
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
      var locale = $translate.use();
      if (locale == "jp_JA") {
        locale = "ja_JP";
      }
      $scope.localeParam = locale;

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()

      /*
      this.btnReload = function () {
        if (this.userSettingsModel.sessionTicketErr) {
          this.initPanel();
        } else {
          this.getUserSettingsInfo();
        }
      }; // btnReload()
      */

      this.btnSave = function () {
        var funcName = "btnSave()";
        var logMsg = "";

        WebExUserSettingsFact.updateUserSettings2();
      }; // btnSave()

      /*
      this.initPanel = function () {
        WebExUserSettingsFact.initPanel();
      }; // initPanel()

      this.getUserSettingsInfo = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
      }; // getUserSettingsInfo()
      */

      //----------------------------------------------------------------------//

      this.userSettingsModel = WebExUserSettingsFact.getUserSettingsModel();
    } // WebExUserSettings2Ctrl()
  ]);
})();
