(function () {
  'use strict';

  angular.module('WebExSiteSetting').controller('WebExSiteSettingCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    '$sce',
    '$timeout',
    'Authinfo',
    'Notification',
    'Config',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      $sce,
      $timeout,
      Authinfo,
      Notification,
      Config
    ) {

      var _this = this;

      _this.funcName = "WebExSiteSettingCtrl()";
      _this.logMsg = "";

      _this.logMsg = _this.funcName + ": " + "\n" +
        "stateParams=" + JSON.stringify($stateParams);
      $log.log(_this.logMsg);

      $scope.siteUrl = $stateParams.siteUrl;
      $scope.categoryId = $stateParams.categoryId;
      $scope.webexPageId = $stateParams.webexPageId;

      $scope.siteSettingId = $stateParams.categoryId + "-" + $stateParams.webexPageId;
      $scope.siteSettingLabel = "webexSiteSettingsLabels.pageId_" + $stateParams.webexPageId;

      $scope.siteSettingsSref = "site-settings({siteUrl:'" + $stateParams.siteUrl + "'})";
      $scope.siteSettingsPageTitle = $translate.instant(
        "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: $scope.siteUrl
        }
      );

      // for iframe request
      $scope.trustIframeUrl = $sce.trustAsResourceUrl($stateParams.settingPageIframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteSettingId=" + $scope.siteSettingId + "\n" +
        "siteSettingLabel=" + $scope.siteSettingLabel + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "adminEmail=" + $scope.adminEmail + "\n" +
        "locale=" + $scope.locale + "\n" +
        "siteSettingsSref=" + $scope.siteSettingsSref + "\n" +
        "siteSettingsPageTitle=" + $scope.siteSettingsPageTitle;
      $log.log(_this.logMsg);

      $timeout(
        function () {
          var submitFormBtn = document.getElementById('submitFormBtn');
          submitFormBtn.click();
        },

        0
      );
    } // function()
  ]); // angular.module().controller()
})(); // function()
