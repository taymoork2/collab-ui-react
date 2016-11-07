(function () {
  'use strict';

  angular.module('WebExApp').controller('WebExSiteSettingCtrl', WebExSiteSettingCtrl);

  /* @ngInject */
  function WebExSiteSettingCtrl(
    $scope,
    $rootScope,
    $log,
    $translate,
    $stateParams,
    $sce,
    $timeout,
    $window,
    Log,
    Authinfo,
    TokenService,
    WebExUtilsFact
  ) {

    var _this = this;

    _this.funcName = "WebExSiteSettingCtrl()";
    _this.logMsg = "";

    var translateUse = $translate.use();

    _this.logMsg = _this.funcName + "\n" +
      "translateUse=" + translateUse + "\n" +
      "stateParams=" + JSON.stringify($stateParams);
    Log.debug(_this.logMsg);

    var iframeUrlOrig = $stateParams.settingPageIframeUrl;
    var siteUrl = $stateParams.siteUrl;
    // var iframeUrlOrig = "https://wbxbts.admin.ciscospark.com/wbxadmin/sitesetting.do?proxyfrom=atlas&siteurl=T31TEST-ee#anchor_site_option";
    // var siteUrl = "T31TEST-ee.webex.com";

    $scope.isIframeLoaded = false;
    $scope.siteSettingId = $stateParams.webexPageId;
    $scope.siteSettingLabel = $translate.instant("webexSiteSettingsLabels.settingPageLabel_" + $stateParams.webexPageId);
    $scope.siteSettingsBreadcrumbUiSref = "site-list.site-settings({siteUrl:" + "'" + siteUrl + "'" + "})";
    $scope.siteSettingsBreadcrumbLabel = $translate.instant(
      "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
        siteUrl: siteUrl
      }
    );

    var siteName = WebExUtilsFact.getSiteName(siteUrl);
    var iframeUrl = _.replace(iframeUrlOrig, siteName, siteName.toLowerCase());

    if (iframeUrlOrig != iframeUrl) {
      _this.logMsg = _this.funcName + "\n" +
        "WARNING: mixed case iframe url detected" + "\n" +
        "iframeUrlOrig=" + iframeUrlOrig + "\n" +
        "iframeUrl=" + iframeUrl + "\n" +
        "";
      $log.log(_this.logMsg);
    }

    // iframe request variables
    $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
    $scope.adminEmail = Authinfo.getPrimaryEmail();
    $scope.authToken = TokenService.getAccessToken();
    $scope.siteName = siteUrl.toLowerCase();
    $scope.fullSparkDNS = $window.location.origin;
    $scope.locale = ("es_LA" == translateUse) ? "es_MX" : translateUse;

    _this.logMsg = _this.funcName + "\n" +
      "scope.siteSettingLabel=" + $scope.siteSettingLabel + "\n" +
      "scope.trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
      "scope.adminEmail=" + $scope.adminEmail + "\n" +
      "scope.authToken=" + $scope.authToken + "\n" +
      "scope.locale=" + $scope.locale + "\n" +
      "scope.siteSettingsBreadcrumbUiSref=" + $scope.siteSettingsBreadcrumbUiSref + "\n" +
      "scope.siteSettingsBreadcrumbLabel=" + $scope.siteSettingsBreadcrumbLabel;
    Log.debug(_this.logMsg);

    $rootScope.lastSite = siteUrl;
    $log.log("last site " + $rootScope.lastSite);

    var parser = $window.document.createElement('a');
    parser.href = iframeUrl;
    $rootScope.nginxHost = parser.hostname;
    Log.debug("nginxHost " + $rootScope.nginxHost);

    $timeout(
      function loadIframe() {
        var submitFormBtn = $window.document.getElementById('submitFormBtn');
        submitFormBtn.click();
      }, // loadIframe()

      0
    );

    $window.iframeLoaded = function (iframeId) {
      var funcName = "iframeLoaded()";
      var logMsg = funcName;

      var currScope = angular.element(iframeId).scope();
      var phase = currScope.$$phase;

      logMsg = funcName + "\n" +
        "phase=" + phase;
      $log.log(logMsg);

      if (!phase) {
        currScope.$apply(
          function updateScope() {
            currScope.isIframeLoaded = true;
          }
        );
      }
    }; // iframeLoaded()
  } // webexSiteSettingCtrl()
})(); // function()
