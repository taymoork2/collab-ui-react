(function () {
  'use strict';

  angular.module('Core').controller('SiteRowCtrl', SiteRowCtrl);

  /*@ngInject*/
  function SiteRowCtrl(
    $q,
    $translate,
    $log,
    $scope,
    $interval,
    Authinfo,
    Userservice,
    SiteListService,
    WebExApiGatewayService,
    Notification,
    FeatureToggleService,
    WebExSiteRowService
  ) {

    var funcName = "SiteRowCtrl()";
    var logMsg = "";
    var _this = this;

    _this.gridOptions = WebExSiteRowService.getGridOptions();
    _this.showGridData = WebExSiteRowService.getShowGridData();

    $q.all([FeatureToggleService.supports(FeatureToggleService.features.webexCSV)])
      .then(function (result) {
        WebExSiteRowService.showCSVIconAndResults = result;
      });

    init();

    ////////////////

    function init() {
      WebExSiteRowService.getConferenceServices();
      WebExSiteRowService.configureGrid();

      _this.gridOptions = WebExSiteRowService.getGridOptions();
      _this.showGridData = WebExSiteRowService.getShowGridData();

      $log.log("***" + JSON.stringify(_this.gridOptions));
      $log.log("***" + _this.showGridData);

    } //init()

    $scope.csvExport = function (siteRow) {
      var funcName = "SiteRowCtrl.csvExport()";
      var logMsg = "";
      var siteUrl = siteRow.license.siteUrl;

      logMsg = funcName + "\n" +
        "siteRow=" + JSON.stringify(siteRow);
      // $log.log(logMsg);

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      // $log.log(logMsg);

      WebExApiGatewayService.csvExport(
        siteUrl,
        siteRow.csvMock.mockExport
      ).then(

        function success(response) {
          Notification.success($translate.instant('siteList.exportStartedToast'));

          SiteListService.updateCSVStatusInRow(siteRow);
        },

        function error(response) {
          Notification.error($translate.instant('siteList.csvRejectedToast-' + response.errorCode));

          SiteListService.updateCSVStatusInRow(siteRow);
        }
      ).catch(
        function catchError(response) {
          var funcName = "SiteRowCtrl.csvExport().catchError()";
          var logMsg = "";

          logMsg = funcName + "\n" +
            "response=" + JSON.stringify(response);
          $log.log(logMsg);

          Notification.error($translate.instant('siteList.exportRejectedToast'));

          SiteListService.updateCSVStatusInRow(siteRow);
        }
      ); // WebExApiGatewayService.csvExport()
    }; // csvExport()

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      WebExSiteRowService.stopPolling();
    });

  } // SiteRowCtrl()
})(); // top level function
