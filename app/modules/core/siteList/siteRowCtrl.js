(function () {
  'use strict';

  angular.module('Core').controller('WebExSiteRowCtrl', WebExSiteRowCtrl);

  /*@ngInject*/
  function WebExSiteRowCtrl(
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

    var funcName = "WebExSiteRowCtrl()";
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

      //$log.log("***" + JSON.stringify(_this.gridOptions));
      //$log.log("***" + _this.showGridData);

    } //init()

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      WebExSiteRowService.stopPolling();
    });

  } // WebExSiteRowCtrl()
})(); // top level function
