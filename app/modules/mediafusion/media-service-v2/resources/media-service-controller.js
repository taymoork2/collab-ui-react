(function () {
  'use strict';

  /* @ngInject */
  function MediaServiceControllerV2($state, $modal, $scope, $translate, MediaClusterServiceV2, FusionClusterService) {

    MediaClusterServiceV2.subscribe('data', clustersUpdated, {
      scope: $scope
    });

    var vm = this;
    vm.loading = true;
    vm.state = $state;
    vm.selectedRow = -1;
    vm.pollHasFailed = false;
    vm.showInfoPanel = true;
    vm.deleteClusterId = null;
    vm.deleteSerial = null;
    vm.showPreview = true;
    vm.deleteConnectorName = null;
    vm.serviceEnabled = null; // when we don't know yet, otherwise the value is true or false
    vm.currentServiceType = "mf_mgmt";
    vm.currentServiceId = "squared-fusion-media";
    vm.featureToggled = false;
    vm.backState = 'services-overview';

    // Added for cs-page-header
    vm.pageTitle = $translate.instant('mediaFusion.page_title');
    vm.tabs = [
      /*{
            title: $translate.instant('common.metrics'),
            state: 'media-service.metrics',
          },*/
      {
        title: $translate.instant('common.resources'),
        state: 'media-service-v2.list',
      }, {
        title: $translate.instant('common.settings'),
        state: 'media-service-v2.settings',
      }
    ];
    vm.clusters = MediaClusterServiceV2.getClustersByConnectorType('mf_mgmt'); //_.values(MediaClusterServiceV2.getClusters());
    //vm.aggregatedClusters = _.values(MediaClusterServiceV2.getAggegatedClusters());
    vm.getSeverity = MediaClusterServiceV2.getRunningStateSeverity;
    vm.clusterLength = clusterLength;
    vm.showClusterDetails = showClusterDetails;
    vm.sortByProperty = sortByProperty;
    vm.addResourceButtonClicked = addResourceButtonClicked;
    vm.clusterList = [];
    vm.clustersUpdated = clustersUpdated;

    vm.clusterListGridOptions = {
      data: 'med.clusters',
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
        displayName: 'Media Clusters',
        cellTemplate: 'modules/mediafusion/media-service-v2/resources/cluster-list-display-name.html',
        width: '35%'
      }, {
        field: 'serviceStatus',
        displayName: 'Service Status',
        cellTemplate: 'modules/mediafusion/media-service-v2/resources/cluster-list-status.html',
        width: '65%'
      }]
    };

    if (vm.currentServiceId == "squared-fusion-media") {
      FusionClusterService.serviceIsSetUp(vm.currentServiceId).then(function (enabled) {
        if (enabled) {
          vm.serviceEnabled = enabled;
        } else {
          firstTimeSetup();
        }
      });
    }

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

    function clustersUpdated() {

      vm.clusters = MediaClusterServiceV2.getClustersByConnectorType('mf_mgmt');
      vm.clusters.sort(sortByProperty('name'));
      vm.loadingClusters = false;

    }

    function showClusterDetails(cluster) {
      if (vm.showPreview) {
        $state.go('connector-details-v2', {
          clusterName: cluster.name,
          nodes: cluster.connectors,
          cluster: cluster
        });
      }
      vm.showPreview = true;
    }

    function addResourceButtonClicked() {
      $modal.open({
        resolve: {
          firstTimeSetup: false,
          yesProceed: true,
        },
        type: 'small',
        controller: 'RedirectAddResourceControllerV2',
        controllerAs: 'redirectResource',
        templateUrl: 'modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html',
        modalClass: 'redirect-add-resource'
      });
    }

    function firstTimeSetup() {
      vm.serviceEnabled = true;
      $modal.open({
        resolve: {
          firstTimeSetup: true,
          yesProceed: false
        },
        type: 'small',
        controller: 'RedirectAddResourceControllerV2',
        controllerAs: 'redirectResource',
        templateUrl: 'modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html',
        modalClass: 'redirect-add-resource'
      });
    }

  }

  /* @ngInject */
  function MediaAlarmControllerV2($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.host = $stateParams.host;
  }

  /* @ngInject */
  function MediaClusterSettingsControllerV2($modal, $stateParams, MediaClusterServiceV2) {
    var vm = this;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.cluster = MediaClusterServiceV2.getClusters()[vm.clusterId];
    vm.saving = false;

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.showDeregisterDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: "clusterDeregister",
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
      });
    };
  }

  angular
    .module('Mediafusion')
    .controller('MediaServiceControllerV2', MediaServiceControllerV2)
    .controller('MediaClusterSettingsControllerV2', MediaClusterSettingsControllerV2)
    .controller('MediaAlarmControllerV2', MediaAlarmControllerV2);
}());
