(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('HDSServiceController', HDSServiceController);

  /* @ngInject */
  function HDSServiceController($modal, $scope, $state, $stateParams, $translate, ClusterService, FusionClusterService, FeatureToggleService) {


    ClusterService.subscribe('data', clustersUpdated, {
      scope: $scope
    });

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
    vm.sortByProperty = sortByProperty;
    vm.clusterList = [];
    vm.showClusterSidepanel = showClusterSidepanel;

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
          $scope.exp.showClusterSidepanel(row.entity);
        });
        if (!_.isUndefined($stateParams.clusterId) && $stateParams.clusterId !== null) {
          showClusterSidepanel(ClusterService.getCluster('hds_app', $stateParams.clusterId));
        }
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

    function showClusterSidepanel(cluster) {
      $state.go('hds-cluster-details', {
        clusterId: cluster.id,
        connectorType: vm.connectorType
      });
    }

    FusionClusterService.serviceIsSetUp('spark-hybrid-datasecurity').then(function (enabled) {
      if (enabled) {
        vm.serviceEnabled = enabled;
      } else {
        firstTimeSetup();
      }
    });

    function clustersUpdated() {
      vm.clusters = ClusterService.getClustersByConnectorType('hds_app');
      vm.clusters.sort(sortByProperty('name'));
    }

    function firstTimeSetup() {
      vm.serviceEnabled = true;
      $modal.open({
        type: 'small',
        controller: 'HDSRedirectAddResourceController',
        controllerAs: 'hdsRedirectAddResourceController',
        templateUrl: 'modules/hds/add-resource/add-resource-modal.html',
        modalClass: 'redirect-add-resource',
        resolve: {
          firstTimeSetup: true,
          proceedSetup: false
        },
      });
    }


    FeatureToggleService.supports(FeatureToggleService.features.atlasHybridDataSecurity)
      .then(function (reply) {
        vm.featureToggled = reply;
      });

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
