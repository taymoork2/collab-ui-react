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
      _this.settingPageIframeUrl = $stateParams.settingPageIframeUrl;
      _this.iframeUrl = "https://" + $stateParams.siteUrl + $stateParams.settingPageIframeUrl;
      _this.adminEmail = Authinfo.getPrimaryEmail();
      _this.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      $scope.siteUrl = _this.siteUrl;
      $scope.settingPageIframeUrl = _this.settingPageIframeUrl;
      $scope.iframeUrl = _this.iframeUrl;
      $scope.adminEmail = _this.adminEmail;
      $scope.locale = _this.locale;
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(_this.iframeUrl);

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteUrl=" + $scope.siteUrl + "\n" +
        "settingPageIframeUrl=" + $scope.settingPageIframeUrl + "\n" +
        "iframeUrl=" + $scope.iframeUrl + "\n" +
        "adminEmail=" + $scope.adminEmail + "\n" +
        "locale=" + $scope.locale + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl;
      $log.log(_this.logMsg);

      // var secretIframeBtn = document.getElementById("secretIframeBtn");
      // secretIframeBtn.click();
      $timeout(
        function () {
          var secretIframeBtn = document.getElementById("secretIframeBtn");
          secretIframeBtn.click();
        },

        0
      );

      // _this.siteSettingIframeObj = WebExSiteSettingIframeFact.getSiteSettingIframeObj();
      // _this.siteSettingIframeObj = WebExSiteSettingIframeFact.initSiteSettingIframeObj();
    } // function()
  ]); // angular.module().controller()
})(); // function()
