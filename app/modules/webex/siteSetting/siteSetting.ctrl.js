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

      $scope.siteSettingId = $stateParams.webexPageId;
      $scope.siteSettingLabel = $translate.instant("webexSiteSettingsLabels.settingPageLabel_" + $stateParams.webexPageId);

      $scope.siteSettingsBreadcrumbUiSref = "site-settings({siteUrl:" + "'" + $stateParams.siteUrl + "'" + "})";
      $scope.siteSettingsBreadcrumbLabel = $translate.instant(
        "webexSiteSettingsLabels.siteSettingsIndexPageTitleFull", {
          siteUrl: $stateParams.siteUrl
        }
      );

      var iframeUrl = $stateParams.settingPageIframeUrl;

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
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteSettingId=" + $scope.siteSettingId + "\n" +
        "siteSettingLabel=" + $scope.siteSettingLabel + "\n" +
        "iframeUrl=" + iframeUrl + "\n" +
        "trustIframeUrl=" + $scope.trustIframeUrl + "\n" +
        "adminEmail=" + $scope.adminEmail + "\n" +
        "authToken=" + $scope.authToken + "\n" +
        "locale=" + $scope.locale + "\n" +
        "siteSettingsBreadcrumbUiSref=" + $scope.siteSettingsBreadcrumbUiSref + "\n" +
        "siteSettingsBreadcrumbLabel=" + $scope.siteSettingsBreadcrumbLabel;
      // $log.log(_this.logMsg);

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
