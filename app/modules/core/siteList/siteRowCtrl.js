(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExSiteRowCtrl', WebExSiteRowCtrl);

  /*@ngInject*/
  function WebExSiteRowCtrl($scope, WebExSiteRowService) {

    this.showGridData = false;

    WebExSiteRowService.initSiteRows();
    this.gridOptions = WebExSiteRowService.getGridOptions();

    this.showGridData = true;

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      WebExSiteRowService.stopPolling();
      WebExSiteRowService.initSiteRowsObj(); // this will allow re-entry to this page to use fresh content
    });

  } // WebExSiteRowCtrl()
})(); // top level function
