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
    WebExApiGatewayService,
    Notification,
    FeatureToggleService,
    WebExSiteRowService
  ) {

    var funcName = "WebExSiteRowCtrl()";
    var logMsg = "";
    var _this = this;

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

    } //init()

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      WebExSiteRowService.stopPolling();
    });

  } // WebExSiteRowCtrl()
})(); // top level function
