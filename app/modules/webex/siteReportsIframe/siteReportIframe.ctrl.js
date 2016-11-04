(function () {
  'use strict';

  angular.module('WebExApp').controller('ReportsIframeCtrl', ReportsIframeCtrl);

  /* @ngInject */
  function ReportsIframeCtrl(
    $scope,
    $rootScope,
    $log,
    $translate,
    $stateParams,
    $sce,
    $timeout,
    $window,
    Authinfo,
    TokenService,
    WebExUtilsFact
  ) {

    var _this = this;

    _this.funcName = "ReportsIframeCtrl()";
    _this.logMsg = "";

    var siteName = WebExUtilsFact.getSiteName($stateParams.siteUrl);
    var iframeUrlOrig = $stateParams.reportPageIframeUrl;
    // var siteName = "SJSITE14";
    // var iframeUrlOrig = "https://wbxdmz.admin.ciscospark.com/wbxadmin/MeetingsInProgress.do?proxyfrom=atlas&siteurl=SJSITE14";

    $log.log("iframeUrlOrig=" + iframeUrlOrig);

    $scope.isIframeLoaded = false;
    $scope.siteUrl = $stateParams.siteUrl;
    $scope.indexPageSref = "webex-reports({siteUrl:'" + $stateParams.siteUrl + "'})";
    $scope.reportPageId = $stateParams.reportPageId;
    $scope.reportPageTitle = $translate.instant("webexReportsPageTitles." + $scope.reportPageId);
    $scope.reportPageIframeUrl = iframeUrlOrig;

    var iframeUrl = iframeUrlOrig.replace(siteName, siteName.toLowerCase());

    if (iframeUrlOrig != iframeUrl) {
      _this.logMsg = _this.funcName + "\n" +
        "WARNING: mixed case iframe url detected" + "\n" +
        "iframeUrlOrig=" + iframeUrlOrig + "\n" +
        "iframeUrl=" + iframeUrl + "\n" +
        "";
      $log.log(_this.logMsg);
    }

    if (iframeUrl.indexOf("cibtsgsbt31.webex.com") > 0) {
      iframeUrl = iframeUrl.replace($stateParams.siteUrl, "wbxbts.admin.ciscospark.com");
    }

    $scope.reportPageIframeUrl = iframeUrlOrig;

    // for iframe request
    $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
    $scope.adminEmail = Authinfo.getPrimaryEmail();
    $scope.authToken = TokenService.getAccessToken();
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
