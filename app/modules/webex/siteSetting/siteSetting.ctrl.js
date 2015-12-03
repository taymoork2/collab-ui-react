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
    'Config',
    function webexSiteSettingCtrl(
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
      Config
    ) {

      var _this = this;

      _this.funcName = "WebExSiteSettingCtrl()";
      _this.logMsg = "";

      var translateUse = $translate.use();
      var iframeUrl = $stateParams.settingPageIframeUrl;

      _this.logMsg = _this.funcName + ": " + "\n" +
        "translateUse=" + translateUse + "\n" +
        "stateParams=" + JSON.stringify($stateParams);
      $log.log(_this.logMsg);

      $scope.showSpinner = false;
      $scope.siteSettingId = $stateParams.webexPageId;
      $scope.siteSettingLabel = $translate.instant("webexSiteSettingsLabels.settingPageLabel_" + $stateParams.webexPageId);

      $scope.siteSettingsBreadcrumbUiSref = "site-settings({siteUrl:" + "'" + $stateParams.siteUrl + "'" + "})";
      $scope.siteSettingsBreadcrumbLabel = $translate.instant(
        "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: $stateParams.siteUrl
        }
      );

      if (
        (null == iframeUrl) ||
        ("null" === iframeUrl) ||
        ("" === iframeUrl)
      ) {

        _this.logMsg = _this.funcName + ": " + "ERROR!!! Iframe URL is empty";
        $log.log(_this.logMsg);

        $scope.iframeUrlType = "invalidIframeUrl";
        iframeUrl = "https://" + $stateParams.siteUrl + "/igotnuthin";
      } else {
        $scope.iframeUrlType = "validIframeUrl";
      }

      // iframe request variables
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.authToken = $rootScope.token;
      $scope.siteName = $stateParams.siteUrl;
      $scope.fullSparkDNS = window.location.origin;

      $scope.locale = (
        "es_LA" == translateUse
      ) ? "es_MX" : translateUse;

      _this.logMsg = _this.funcName + ": " + "\n" +
        "scope.siteSettingLabel=" + $scope.siteSettingLabel + "\n" +
        "scope.trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "scope.adminEmail=" + $scope.adminEmail + "\n" +
        "scope.authToken=" + $scope.authToken + "\n" +
        "scope.locale=" + $scope.locale + "\n" +
        "scope.siteSettingsBreadcrumbUiSref=" + $scope.siteSettingsBreadcrumbUiSref + "\n" +
        "scope.siteSettingsBreadcrumbLabel=" + $scope.siteSettingsBreadcrumbLabel;
      // $log.log(_this.logMsg);

      $timeout(
        function () {
          var submitFormBtn = document.getElementById('submitFormBtn');
          submitFormBtn.click();
        },

        0
      );
    } // webexSiteSettingCtrl()
  ]); // angular.module().controller()
})(); // function()
