(function () {
  'use strict';

  angular.module('ReportIframe').controller('ReportsIframeCtrl', [
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

      _this.funcName = "ReportsIframeCtrl()";
      _this.logMsg = "";

      $scope.showSpinner = (
        ("storage_utilization" == $stateParams.reportPageId) ||
        ("support_center_support_sessions" == $stateParams.reportPageId) ||
        ("support_center_allocation_queue" == $stateParams.reportPageId) ||
        ("support_center_call_volume" == $stateParams.reportPageId) ||
        ("support_center_csr_activity" == $stateParams.reportPageId) ||
        ("support_center_url_referral" == $stateParams.reportPageId)
      ) ? false : true;

      $scope.siteUrl = $stateParams.siteUrl;
      $scope.indexPageSref = "webex-reports({siteUrl:'" + $stateParams.siteUrl + "'})";
      $scope.reportPageId = $stateParams.reportPageId;
      $scope.reportPageTitle = $translate.instant("webexReportsPageTitles." + $scope.reportPageId);
      $scope.reportPageIframeUrl = $stateParams.reportPageIframeUrl;
      $scope.iframeUrl = $stateParams.reportPageIframeUrl;

      // for iframe request
      $scope.trustIframeUrl = $sce.trustAsResourceUrl($scope.iframeUrl);
      $scope.adminEmail = Authinfo.getPrimaryEmail();
      $scope.authToken = $rootScope.token;
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();
      $scope.siteName = $stateParams.siteUrl;
      $scope.fullSparkDNS = window.location.origin;

      _this.logMsg = _this.funcName + ": " + "\n" +
        "siteUrl=" + $scope.siteUrl + "\n" +
        "reportPageId=" + $scope.reportPageId + "\n" +
        "reportPageTitle=" + $scope.reportPageTitle + "\n" +
        "reportPageIframeUrl=" + $scope.reportPageIframeUrl + "\n" +
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
