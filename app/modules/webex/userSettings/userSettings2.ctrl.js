(function () {
  'use strict';

  angular.module('WebExApp').controller('WebExUserSettings2Ctrl', [
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
    'UrlConfig',
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
      Config,
      UrlConfig
    ) {

      // Localize the breadcrumb
      $state.current.data.displayName = $translate.instant("webexUserSettingLabels.priviligesLable");
      $rootScope.$broadcast('displayNameUpdated');

      $scope.webexAdvancedUrl = UrlConfig.getWebexAdvancedEditUrl(WebExUserSettingsFact.getSiteUrl());
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.userEmailParam = $stateParams.currentUser.userName;

      var locale = $translate.use();
      if (locale == "es_LA") { //latin american spanish
        locale = "es_MX"; //mexican spanish
      }
      $scope.localeParam = locale;

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()

      $scope.btnReload2 = function () {
        WebExUserSettingsFact.getUserSettingsInfo();
      }; // btnReload2()

      $scope.callInTeleconfChkboxClick = function () {
        if (!$scope.userSettingsModel.telephonyPriviledge.callInTeleconf.value) {
          $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = 0;
          $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.teleconfViaGlobalCallIn.value = false;
        } else {
          $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = (
            $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled
          ) ? 2 : 1;
        }
      }; // callInTeleconfChkboxClick()

      $scope.callBackTeleconfChkboxClick = function () {
        var funcName = "callBackTeleconfChkboxClick()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "callBackTeleconf.value=" + $scope.userSettingsModel.telephonyPriviledge.callBackTeleconf.value + "\n" +
          "callInTeleconf.value=" + $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.value;
        // $log.log(logMsg);

        if ($scope.userSettingsModel.telephonyPriviledge.callBackTeleconf.value) {
          if (!$scope.userSettingsModel.telephonyPriviledge.callInTeleconf.value) {
            $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.value = true;

            $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType = (
              $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.tollFree.isSiteEnabled
            ) ? 2 : 1;
          }

          logMsg = funcName + ": " + "\n" +
            "callInTeleconf.value=" + $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.value + "\n" +
            "selectedCallInTollType=" + $scope.userSettingsModel.telephonyPriviledge.callInTeleconf.selectedCallInTollType;
          // $log.log(logMsg);
        } else {
          $scope.userSettingsModel.telephonyPriviledge.callBackTeleconf.globalCallBackTeleconf.value = false;
        }
      }; // callBackTeleconfChkboxClick()

      $scope.hiQualVideoChkboxClick = function () {
        if (!$scope.userSettingsModel.videoSettings.hiQualVideo.value) {
          $scope.userSettingsModel.videoSettings.hiQualVideo.hiDefVideo.value = false;
        }
      }; // hiQualVideoChkboxClick()

      $scope.btnSave2 = function (form) {
        var funcName = "btnSave2()";
        var logMsg = "";

        WebExUserSettingsFact.updateUserSettings2(form);
      }; // btnSave2()

      $scope.btnReset2 = function (form) {
        WebExUserSettingsFact.getUserSettingsInfo(form);
      }; // btnReset2()

      //----------------------------------------------------------------------//

      $log.log("Show panel4");

      $scope.userSettingsModel = WebExUserSettingsFact.getUserSettingsModel();
    } // WebExUserSettings2Ctrl()
  ]);
})();
