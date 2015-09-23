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
      $scope.settingPageLabel = $stateParams.settingPageLabel;
      $scope.settingPageIframeUrl = $stateParams.settingPageIframeUrl;

      $scope.siteSettingIndexPageTitle = $translate.instant(
        "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: $scope.siteUrl
        }
      );
      $scope.indexPageSref = "site-settings({siteUrl:'" + $stateParams.siteUrl + "'})";

      // for iframe request
      $scope.trustIframeUrl = $sce.trustAsResourceUrl($scope.settingPageIframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteUrl=" + $scope.siteUrl + "\n" +
        "siteSettingIndexPageTitle=" + $scope.siteSettingIndexPageTitle + "\n" +
        "settingPageLabel=" + $scope.settingPageLabel + "\n" +
        "settingPageIframeUrl=" + $scope.settingPageIframeUrl + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "adminEmail=" + $scope.adminEmail + "\n" +
        "locale=" + $scope.locale;
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
