(function () {
  'use strict';

  angular.module('WebExSiteSettings').controller('WebExSiteSettingsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    'WebExSiteSettingsFact',
    'Notification',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      WebExSiteSettingsFact,
      Notification
    ) {

      $scope.hello = "Hello Kitty is here!!!";

      this.siteSettingsObj = WebExSiteSettingsFact.getSiteSettingsObj();

      var funcName = "WebExSiteSettingsCtrl()";
      var logMsg = "";

      this.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();

      logMsg = funcName + ": " + "\n" +
        "viewReady=" + this.siteSettingsObj.viewReady + "; " +
        "siteUrl=" + this.siteSettingsObj.siteUrl + "; " +
        "siteName=" + this.siteSettingsObj.siteName;
      $log.log(logMsg);

      logMsg = funcName + ": " + "\n" +
        "viewReady=" + this.siteSettingsObj.viewReady + "; " +
        "siteUrl=" + this.siteSettingsObj.siteUrl + "; " +
        "siteName=" + this.siteSettingsObj.siteName;
      $log.log(logMsg);
    }
  ]);
})();
