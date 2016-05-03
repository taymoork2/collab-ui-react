(function () {
  'use strict';

  angular.module('WebExApp').controller('WebExUserSettingsCtrl', WebExUserSettingsCtrl);

  /* @ngInject */
  function WebExUserSettingsCtrl(
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

    $scope.initPanel = function () {
      WebExUserSettingsFact.getUserSettingsFromWebEx();
    }; // initPanel()

    $scope.getUserSettingsInfo = function (form) {
      WebExUserSettingsFact.getUserSettingsInfo(form);
    }; // getUserSettingsInfo()

    $scope.btnReload = function () {
      var funcName = "btnReload()";
      var logMsg = "";

      logMsg = funcName + ": " + "\n" +
        "sessionTicketErr=" + $scope.userSettingsModel.sessionTicketErr;
      // $log.log(logMsg);

      if ($scope.userSettingsModel.sessionTicketErr) {
        $scope.initPanel();
      } else {
        $scope.getUserSettingsInfo(null);
      }
    }; // btnReload()

    $scope.btnSave = function (form) {
      WebExUserSettingsFact.updateUserSettings(form);
    }; // btnSave()

    $scope.btnReset = function (form) {
      $scope.getUserSettingsInfo(form);
    }; // btnReset()

    //----------------------------------------------------------------------//

    $log.log("Show panel3");

    $scope.userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();
    WebExUserSettingsFact.getUserWebExEntitlementFromAtlas();
    $scope.initPanel();
  } // WebExUserSettingsCtrl()
})();
