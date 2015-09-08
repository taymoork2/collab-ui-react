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
    'FeatureToggleService',
    'Userservice',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      WebExUserSettingsFact,
      Notification,
      FeatureToggleService,
      Userservice
    ) {
      var that = this;
      // Update the breadcrumb with site url
      $state.current.data.displayName = $stateParams.site;
      $rootScope.$broadcast('displayNameUpdated');
      this.gsxFeature = false;

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

      Userservice.getUser('me', function (data, status) {

        FeatureToggleService.getFeatureForUser(data.id, 'gsxdemo').then(function (value) {
          that.gsxFeature = value;
          if (value) {
            that.defaultSystem = 1;
          }
        }).finally(function () {
          that.initPanel();
        });
      });
    } // WebExUserSettingsCtrl()
  ]);
})();
