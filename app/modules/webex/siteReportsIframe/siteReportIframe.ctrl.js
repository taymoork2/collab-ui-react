(function () {
  'use strict';

  angular.module('WebExApp').controller('ReportsIframeCtrl', ReportsIframeCtrl);

  /* @ngInject */
  function ReportsIframeCtrl(
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
    Notification,
    Config,
    Storage,
    WebExUtilsFact
  ) {

    var _this = this;

    _this.funcName = "ReportsIframeCtrl()";
    _this.logMsg = "";

    $scope.isIframeLoaded = false;
    $scope.siteUrl = $stateParams.siteUrl;
    $scope.indexPageSref = "webex-reports({siteUrl:'" + $stateParams.siteUrl + "'})";
    $scope.reportPageId = $stateParams.reportPageId;
    $scope.reportPageTitle = $translate.instant("webexReportsPageTitles." + $scope.reportPageId);
    $scope.reportPageIframeUrl = $stateParams.reportPageIframeUrl;
    $scope.iframeUrl = $stateParams.reportPageIframeUrl;

    // for iframe request
    if ($scope.iframeUrl.indexOf("cibtsgsbt31.webex.com") > 0)
      $scope.iframeUrl = $scope.iframeUrl.replace($stateParams.siteUrl, "wbxbts.admin.ciscospark.com");
    $scope.trustIframeUrl = $sce.trustAsResourceUrl($scope.iframeUrl);
    $scope.adminEmail = Authinfo.getPrimaryEmail();
    $scope.authToken = Storage.get('accessToken');
    $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();
    $scope.siteName = $stateParams.siteUrl;
    $scope.siteName2 = WebExUtilsFact.getSiteName($stateParams.siteUrl);
    $scope.fullSparkDNS = $window.location.origin;

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

    $rootScope.lastSite = $stateParams.siteUrl;
    $log.log("last site " + $rootScope.lastSite);

    var parser = $window.document.createElement('a');
    parser.href = $scope.iframeUrl;
    $rootScope.nginxHost = parser.hostname;
    $log.log("nginxHost " + $rootScope.nginxHost);

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
  } // reportsIframeCtrl()
})(); // function()
