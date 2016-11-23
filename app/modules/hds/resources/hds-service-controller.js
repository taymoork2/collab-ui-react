(function () {
  'use strict';

  /* @ngInject */
  function HDSServiceController($log, $state, $scope, $translate, HDSClusterService, FusionClusterService, FeatureToggleService) {


    var vm = this;
    vm.state = $state;
    vm.serviceEnabled = null;
    vm.currentServiceType = "hds_app";
    vm.currentServiceId = "spark-hybrid-datasecurity";
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
    vm.clusters = HDSClusterService.getClustersByConnectorType('hds_app');
    vm.getSeverity = HDSClusterService.getRunningStateSeverity;
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

    if (vm.currentServiceId == "spark-hybrid-datasecurity") {
      FusionClusterService.serviceIsSetUp(vm.currentServiceId).then(function (enabled) {
        if (enabled) {
          vm.serviceEnabled = enabled;
        }
      });
    }
    vm.featureToggled = false;
    FeatureToggleService.supports(FeatureToggleService.features.atlasHybridDataSecurity)
      .then(function (reply) {
        vm.featureToggled = reply;
      });

    $log.info('vm.serviceEnabled', vm.serviceEnabled);
    $log.info('vm.featureToggled', vm.featureToggled);
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

  angular
    .module('HDS')
    .controller('HDSServiceController', HDSServiceController);
}());
