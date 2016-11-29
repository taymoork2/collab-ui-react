(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSServiceController', HDSServiceController);

  /* @ngInject */
  function HDSServiceController($scope, $translate, ClusterService, FusionClusterService, FeatureToggleService) {


    var vm = this;
    vm.serviceEnabled = null;
    vm.currentServiceType = 'hds_app';
    vm.featureToggled = false;
    vm.backState = 'services-overview';
    vm.pageTitle = 'hds.resources.page_title';
    vm.tabs = [
      {
        title: $translate.instant('common.resources'),
        state: 'hds.list',
      }, {
        title: $translate.instant('common.settings'),
        state: 'hds.settings',
      }
    ];
    vm.clusters = ClusterService.getClustersByConnectorType('hds_app');
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.clusterLength = clusterLength;
    vm.sortByProperty = sortByProperty;
    vm.clusterList = [];

    vm.clusterListGridOptions = {
      data: 'hdsServiceController.clusters',
      enableSorting: false,
      multiSelect: false,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      rowHeight: 75,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          vm.showClusterDetails(row.entity);
        });
      },
      columnDefs: [{
        field: 'groupName',
        displayName: 'HDS Clusters',
        cellTemplate: 'modules/hds/resources/cluster-list-display-name.html',
        width: '35%'
      }, {
        field: 'serviceStatus',
        displayName: 'Service Status',
        cellTemplate: 'modules/hds/resources/cluster-list-status.html',
        width: '65%'
      }]
    };


    FusionClusterService.serviceIsSetUp('spark-hybrid-datasecurity').then(function (enabled) {
      if (enabled) {
        vm.serviceEnabled = enabled;
      }
    });


    FeatureToggleService.supports(FeatureToggleService.features.atlasHybridDataSecurity)
      .then(function (reply) {
        vm.featureToggled = reply;
      });

    function clusterLength() {
      return _.size(vm.clusters);
    }

    /**
     * This will sort the string array based on the property passed.
     */
    function sortByProperty(property) {
      return function (a, b) {
        return a[property].toLocaleUpperCase().localeCompare(b[property].toLocaleUpperCase());
      };
    }

  }
}());
