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
    Log,
    Authinfo,
    FeatureToggleService,
    TokenService,
    WebExUtilsFact
  ) {
    var _this = this;

    _this.funcName = 'ReportsIframeCtrl()';
    _this.logMsg = '';

    var translateUse = $translate.use();

    _this.logMsg = _this.funcName + '\n' +
      'translateUse=' + translateUse + '\n' +
      'stateParams=' + JSON.stringify($stateParams);
    Log.debug(_this.logMsg);

    var iframeUrlOrig = $stateParams.reportPageIframeUrl;
    var siteUrl = $stateParams.siteUrl;
    // var iframeUrlOrig = 'https://wbxbts.admin.ciscospark.com/wbxadmin/MeetingsInProgress.do?proxyfrom=atlas&siteurl=T31Test-ee';
    // var siteUrl = 'T31Test-ee.webex.com';

    $scope.isIframeLoaded = false;
    $scope.siteUrl = siteUrl;
    $scope.indexPageSref = 'reports.webex({siteUrl:"' + siteUrl + '"})';
    $scope.reportPageId = $stateParams.reportPageId;
    $scope.titleName = 'webexReportsPageTitles.' + $scope.reportPageId;
    $scope.reportPageTitle = $translate.instant($scope.titleName);
    $scope.reportPageIframeUrl = iframeUrlOrig;

    var siteName = WebExUtilsFact.getSiteName(siteUrl);
    var iframeUrl = _.replace(iframeUrlOrig, siteName, siteName.toLowerCase());

    if (iframeUrlOrig != iframeUrl) {
      _this.logMsg = _this.funcName + '\n' +
        'WARNING: mixed case iframe url detected' + '\n' +
        'iframeUrlOrig=' + iframeUrlOrig + '\n' +
        'iframeUrl=' + iframeUrl + '\n' +
        '';
      $log.log(_this.logMsg);
    }

    // iframe request variables
    $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
    $scope.adminEmail = Authinfo.getPrimaryEmail();
    $scope.authToken = TokenService.getAccessToken();
    $scope.locale = ('es_CO' == translateUse) ? 'es_MX' : translateUse;
    $scope.siteName = siteUrl.toLowerCase();
    $scope.fullSparkDNS = $window.location.origin;

    _this.logMsg = _this.funcName + ': ' + '\n' +
      'siteUrl=' + $scope.siteUrl + '\n' +
      'reportPageId=' + $scope.reportPageId + '\n' +
      'reportPageTitle=' + $scope.reportPageTitle + '\n' +
      'reportPageIframeUrl=' + $scope.reportPageIframeUrl + '\n' +
      'iframeUrl=' + $scope.iframeUrl + '\n' +
      'adminEmail=' + $scope.adminEmail + '\n' +
      'locale=' + $scope.locale + '\n' +
      'trustIframeUrl=' + $scope.trustIframeUrl;
    Log.debug(_this.logMsg);

    // $scope.classicLink = getWebexClassicLink();
    getWebexClassicLink();

    function getWebexClassicLink() {
      FeatureToggleService.webexMetricsGetStatus().then(function (isWebexMetricsOn) {
        var classicLink = 'reports.webex';
        if (isWebexMetricsOn) {
          classicLink = 'reports.webex-metrics.classic';
        }
        classicLink += '({siteUrl:' + siteUrl + '})';
        $scope.classicLink = classicLink;
        return classicLink;
      });
      /*var isClassicOn = FeatureToggleService.webexMetricsGetStatus();
      var classicLink = 'reports.webex-metrics.classic';
      if (isClassicOn) {
        classicLink = 'reports.webex';
      }
      classicLink += '({siteUrl:' + siteUrl + '})';
      return classicLink;*/
    }

    $rootScope.lastSite = siteUrl;
    $log.log('last site ' + $rootScope.lastSite);

    var parser = $window.document.createElement('a');
    parser.href = $scope.iframeUrl;
    $rootScope.nginxHost = parser.hostname;
    Log.debug('nginxHost ' + $rootScope.nginxHost);

    $timeout(
      function loadIframe() {
        var submitFormBtn = $window.document.getElementById('submitFormBtn');
        submitFormBtn.click();
      }, // loadIframe()

      0
    );

    $scope.iframeLoaded = function (currScope) {
      var funcName = 'iframeLoaded()';
      var logMsg = funcName;
      var phase = currScope.$$phase;

      logMsg = funcName + '\n' +
        'phase=' + phase;
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
