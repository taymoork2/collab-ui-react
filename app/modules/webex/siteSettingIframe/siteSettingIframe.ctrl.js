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

      // _this.siteSettingIframeObj = WebExSiteSettingIframeFact.getSiteSettingIframeObj();
      // _this.siteSettingIframeObj = WebExSiteSettingIframeFact.initSiteSettingIframeObj();
      // WebExSiteSettingIframeFact.loadIframe();
    } // function()
  ]); // angular.module().controller()
})(); // function()
