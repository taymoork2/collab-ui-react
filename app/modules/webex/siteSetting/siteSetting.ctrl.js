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

      $scope.siteSettingId = ((null === $stateParams.cardId) || ("" === $stateParams.cardId)) ? $stateParams.webexPageId : $stateParams.cardId + "-" + $stateParams.webexPageId;
      $scope.siteSettingLabel = ((null === $stateParams.cardLabel) || ("" === $stateParams.cardLabel)) ? $stateParams.webexPageLabel : $stateParams.cardLabel + " | " + $stateParams.webexPageLabel;

      $scope.siteSettingsBreadcrumbUiSref = "site-settings({siteUrl:'" + $stateParams.siteUrl + "'})";
      $scope.siteSettingsBreadcrumbLabel = $translate.instant(
        "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: $stateParams.siteUrl
        }
      );

      // for iframe request
      $scope.trustIframeUrl = $sce.trustAsResourceUrl($stateParams.settingPageIframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.authToken = $rootScope.token;
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteSettingId=" + $scope.siteSettingId + "\n" +
        "siteSettingLabel=" + $scope.siteSettingLabel + "\n" +
        "settingPageIframeUrl=" + $stateParams.settingPageIframeUrl + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "adminEmail=" + $scope.adminEmail + "\n" +
        "authToken=" + $scope.authToken + "\n" +
        "locale=" + $scope.locale + "\n" +
        "siteSettingsBreadcrumbUiSref=" + $scope.siteSettingsBreadcrumbUiSref + "\n" +
        "siteSettingsBreadcrumbLabel=" + $scope.siteSettingsBreadcrumbLabel + "\n" +
        "webexPageBreadcrumbLabel=" + $scope.webexPageBreadcrumbLabel;
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
