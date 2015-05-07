(function () {
  'use strict';

  angular.module('WebExUserSettings2').controller('WebExUserSettings2Ctrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$filter',
    '$state',
    '$stateParams',
    '$translate',
    '$sce',
    'WebExUserSettingsFact',
    'Notification',
    'Authinfo',
    'Config',
    function (
      $scope,
      $rootScope,
      $log,
      $filter,
      $state,
      $stateParams,
      $translate,
      $sce,
      WebExUserSettingsFact,
      Notification,
      Authinfo,
      Config
    ) {

      // Localize the breadcrumb 
      $state.current.data.displayName = $translate.instant("webexUserSettingLabels.priviligesLable");
      $rootScope.$broadcast('displayNameUpdated');

      $scope.webexAdvancedUrl = Config.getWebexAdvancedEditUrl(WebExUserSettingsFact.getSiteUrl());
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.userEmailParam = $stateParams.currentUser.userName;

      var locale = $translate.use();
      if (locale == "jp_JA") {
        locale = "ja_JP";
      }
      $scope.localeParam = locale;

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()

      this.btnReload2 = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
      }; // btnReload2()

      this.callInTeleconfChkboxClick = function () {
        if (!this.userSettingsModel.telephonyPriviledge.callInTeleconf.value) {
          this.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 0;
          this.userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value = false;
        } else {
          this.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = (
            this.userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled
          ) ? 2 : 1;
        }
      }; // callInTeleconfChkboxClick()

      this.callBackTeleconfChkboxClick = function () {
        var funcName = "callBackTeleconfChkboxClick()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "callBackTeleconf.value=" + this.userSettingsModel.telephonyPriviledge.callBackTeleconf.value + "\n" +
          "callInTeleconf.value=" + this.userSettingsModel.telephonyPriviledge.callInTeleconf.value;
        // $log.log(logMsg);

        if (this.userSettingsModel.telephonyPriviledge.callBackTeleconf.value) {
          if (!this.userSettingsModel.telephonyPriviledge.callInTeleconf.value) {
            this.userSettingsModel.telephonyPriviledge.callInTeleconf.value = true;

            this.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = (
              this.userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled
            ) ? 2 : 1;
          }

          logMsg = funcName + ": " + "\n" +
            "callInTeleconf.value=" + this.userSettingsModel.telephonyPriviledge.callInTeleconf.value + "\n" +
            "selectedCallInTollType=" + this.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType;
          // $log.log(logMsg);
        } else {
          this.userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = false;
        }
      }; // callBackTeleconfChkboxClick()

      this.hiQualVideoChkboxClick = function () {
        if (!this.userSettingsModel.videoSettings.hiQualVideo.value) {
          this.userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value = false;
        }
      }; // hiQualVideoChkboxClick()

      this.btnSave2 = function (form) {
        var funcName = "btnSave2()";
        var logMsg = "";

        WebExUserSettingsFact.updateUserSettings2(form);
      }; // btnSave2()

      this.btnReset2 = function (form) {
        WebExUserSettingsFact.getUserSettingsInfo(form);
      }; // btnReset2()

      //----------------------------------------------------------------------//
      
      $log.log("Show panel4");

      this.userSettingsModel = WebExUserSettingsFact.getUserSettingsModel();
    } // WebExUserSettings2Ctrl()
  ]);
})();
