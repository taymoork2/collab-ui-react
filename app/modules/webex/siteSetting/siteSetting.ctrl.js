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
    '$window',
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
      $window,
      Authinfo,
      Config
    ) {

      var _this = this;

      _this.funcName = "WebExSiteSettingCtrl()";
      _this.logMsg = "";

      var translateUse = $translate.use();
      var iframeUrl = $stateParams.settingPageIframeUrl;

      _this.logMsg = _this.funcName + "\n" +
        "translateUse=" + translateUse + "\n" +
        "stateParams=" + JSON.stringify($stateParams);
      $log.log(_this.logMsg);

      $scope.isIframeLoaded = false;
      $scope.siteSettingId = $stateParams.webexPageId;
      $scope.siteSettingLabel = $translate.instant("webexSiteSettingsLabels.settingPageLabel_" + $stateParams.webexPageId);

      $scope.siteSettingsBreadcrumbUiSref = "site-settings({siteUrl:" + "'" + $stateParams.siteUrl + "'" + "})";
      $scope.siteSettingsBreadcrumbLabel = $translate.instant(
        "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: $stateParams.siteUrl
        }
      );

      if (
        (null != iframeUrl) &&
        ("null" !== iframeUrl) &&
        ("" !== iframeUrl)
      ) {
        $scope.iframeUrlType = "validIframeUrl";
      } else {
        _this.logMsg = _this.funcName + "\n" +
          "ERROR!!! Iframe URL is empty";
        $log.log(_this.logMsg);

        $scope.iframeUrlType = "invalidIframeUrl";
        iframeUrl = "https://" + $stateParams.siteUrl + "/igotnuthin";
      }

      // iframe request variables
      if (iframeUrl.indexOf("cibtsgsbt31.webex.com") > 0)
        iframeUrl = iframeUrl.replace($stateParams.siteUrl, "wbxbts.admin.ciscospark.com");
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.authToken = $rootScope.token;
      $scope.siteName = $stateParams.siteUrl;
      var index = $stateParams.siteUrl.indexOf(".");
      $scope.siteName2 = $stateParams.siteUrl.slice(0, index);
      $scope.fullSparkDNS = window.location.origin;

      $scope.locale = (
        "es_LA" == translateUse
      ) ? "es_MX" : translateUse;

      _this.logMsg = _this.funcName + "\n" +
        "scope.siteSettingLabel=" + $scope.siteSettingLabel + "\n" +
        "scope.trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "scope.adminEmail=" + $scope.adminEmail + "\n" +
        "scope.authToken=" + $scope.authToken + "\n" +
        "scope.locale=" + $scope.locale + "\n" +
        "scope.siteSettingsBreadcrumbUiSref=" + $scope.siteSettingsBreadcrumbUiSref + "\n" +
        "scope.siteSettingsBreadcrumbLabel=" + $scope.siteSettingsBreadcrumbLabel;
      // $log.log(_this.logMsg);

      $rootScope.lastSite = $stateParams.siteUrl;
      $log.log("last site " + $rootScope.lastSite);

      var parser = document.createElement('a');
      parser.href = iframeUrl;
      $rootScope.nginxHost = parser.hostname;
      $log.log("nginxHost " + $rootScope.nginxHost);

      $timeout(
        function loadIframe() {
          var submitFormBtn = document.getElementById('submitFormBtn');
          submitFormBtn.click();
        }, // loadIframe()

        0
      );

      $window.iframeLoaded = function (iframeId) {
        var funcName = "iframeLoaded()";
        var logMsg = funcName;

        logMsg = funcName + "\n" +
          'iframeId=' + iframeId;
        $log.log(logMsg);

        var currScope = angular.element(iframeId).scope();

        currScope.$apply(
          function updateScope() {
            currScope.isIframeLoaded = true;
          }
        );
      }; // iframeLoaded()
    } // webexSiteSettingCtrl()
  ]); // angular.module().controller()
})(); // function()
