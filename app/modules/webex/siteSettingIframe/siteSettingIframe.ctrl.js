(function () {
  'use strict';

  angular.module('WebExSiteSettingIframe').controller('WebExSiteSettingIframeCtrl', [
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
      Notification
    ) {

      var _this = this;

      _this.funcName = "WebExSiteSettingIframeCtrl()";
      _this.logMsg = "";

      $scope.siteUrl = $stateParams.siteUrl;
      $scope.indexPageSref = "site-settings({siteUrl:'" + $stateParams.siteUrl + "'})";
      $scope.settingPageId = $stateParams.settingPageId;
      $scope.settingPageTitle = $translate.instant("webexSiteSettingsLabels." + $scope.settingPageId);
      $scope.settingPageIframeUrl = $stateParams.settingPageIframeUrl;
      $scope.iframeUrl = "https://" + $stateParams.siteUrl + $stateParams.settingPageIframeUrl;

      // for iframe request
      $scope.trustIframeUrl = $sce.trustAsResourceUrl($scope.iframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteUrl=" + $scope.siteUrl + "\n" +
        "settingPageId=" + $scope.settingPageId + "\n" +
        "settingPageTitle=" + $scope.settingPageTitle + "\n" +
        "settingPageIframeUrl=" + $scope.settingPageIframeUrl + "\n" +
        "iframeUrl=" + $scope.iframeUrl + "\n" +
        "adminEmail=" + $scope.adminEmail + "\n" +
        "locale=" + $scope.locale + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl;
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
