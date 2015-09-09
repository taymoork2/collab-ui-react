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
    'WebExSiteSettingIframeFact',
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
      WebExSiteSettingIframeFact,
      Notification
    ) {

      var _this = this;

      _this.funcName = "WebExSiteSettingIframeCtrl()";
      _this.logMsg = "";

      _this.siteUrl = $stateParams.siteUrl;
      _this.settingPageId = $stateParams.settingPageId;
      _this.settingPageTitle = $translate.instant("webexSiteSettingsLabels." + _this.settingPageId);
      _this.settingPageIframeUrl = $stateParams.settingPageIframeUrl;
      _this.iframeUrl = "https://" + $stateParams.siteUrl + $stateParams.settingPageIframeUrl;
      _this.adminEmail = Authinfo.getPrimaryEmail();
      _this.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      $scope.siteUrl = _this.siteUrl;
      $scope.settingPageId = _this.settingPageId;
      $scope.settingPageTitle = _this.settingPageTitle;
      $scope.settingPageIframeUrl = _this.settingPageIframeUrl;
      $scope.iframeUrl = _this.iframeUrl;
      $scope.adminEmail = _this.adminEmail;
      $scope.locale = _this.locale;
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(_this.iframeUrl);

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

      // _this.siteSettingIframeObj = WebExSiteSettingIframeFact.getSiteSettingIframeObj();
      // _this.siteSettingIframeObj = WebExSiteSettingIframeFact.initSiteSettingIframeObj();
    } // function()
  ]); // angular.module().controller()
})(); // function()
