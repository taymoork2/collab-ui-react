(function () {
  'use strict';

  angular.module('WebExReports').controller('ReportsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    '$sce',
    'reportService',
    'Notification',
    'Authinfo',
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
      reportService,
      Notification,
      Authinfo,
      Config
    ) {

      this.reportObject = reportService.initReportsObject();

      $scope.reportPageId = "pageId_underDevelopment";
      $scope.siteUrl = this.reportObject.siteUrl;

      var advancedUrl = Config.getWebexAdvancedHomeUrl(this.reportObject.siteUrl);

      // for webex site cross launch: we probably don't need these three lines!
      $scope.reportPageIframeUrl = $sce.trustAsResourceUrl(advancedUrl);
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.localeParam = $translate.use();

      $scope.reportPageIframeUrl = $sce.trustAsResourceUrl("https://sjsite14.webex.com/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage");

      $scope.uiSref =
        "webex-reports-iframe({" +
        "  siteUrl:" + "'" + this.reportObject.siteUrl + "'" + "," +
        "  reportPageId:" + "'" + $scope.reportPageId + "'" + "," +
        "  reportPageIframeUrl:" + "'" + $scope.reportPageIframeUrl + "'" +
        "})";

      $log.log("ReportsCtrl start");
      var reports = reportService.getReports();

      if (!angular.isUndefined(reports)) {
        //$log.log(angular.toJson(reports));
        $scope.sections = reports.getSections();
      }

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()

    }

  ]);
})();
