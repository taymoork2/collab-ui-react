(function () {
  'use strict';

  angular.module('WebExReports').controller('WebExReportsCtrl', [
    '$scope','$rootScope','$log','$translate','$filter','$state','$stateParams','$sce','reportService','Notification','Authinfo','Config',
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

      this.reportObject = reportService.initReportsObject($stateParams.siteUrl);

      $scope.reportObject = this.reportObject;

      $scope.reportPageId = "pageId_underDevelopment";
      $scope.siteUrl = $stateParams.siteUrl; //this.reportObject.siteUrl;

      var advancedUrl = Config.getWebexAdvancedHomeUrl(this.reportObject.siteUrl);

      // for webex site cross launch: we probably don't need these three lines!
      $scope.reportPageIframeUrl = $sce.trustAsResourceUrl(advancedUrl);
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.localeParam = $translate.use();

      var reportPageUrl = "https://" + $scope.siteUrl + "/dispatcher/AtlasIntegration.do?cmd=GoToSiteAdminEditUserPage";
      $scope.reportPageIframeUrl = $sce.trustAsResourceUrl(reportPageUrl);

      $scope.uiSref =
        "webex-reports.webex-reports-iframe({" +
        "  siteUrl:" + "'" + $scope.siteUrl + "'" + "," +
        "  reportPageId:" + "'" + $scope.reportPageId + "'" + "," +
        "  reportPageIframeUrl:" + "'" + $scope.reportPageIframeUrl + "'" +
        "})";

      // $log.log("ReportsCtrl start");
      // var reports = reportService.getReports(this.reportObject.siteUrl);

      // if (!angular.isUndefined(reports)) {
      //   //$log.log(angular.toJson(reports));
      //   $scope.sections = reports.getSections();
      // }

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()

    }

  ]);
})();
