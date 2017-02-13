(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('HybridServicesHostDetailsController', HybridServicesHostDetailsController);

  /* @ngInject */
  function HybridServicesHostDetailsController($scope, $state, $stateParams, ClusterService, $translate, $modal, FusionClusterStatesService) {
    var cluster;
    var vm = this;
    vm.deleteHost = deleteHost;

    vm.getSeverity = FusionClusterStatesService.getSeverity;

    $scope.$watch(function () {
      return ClusterService.getCluster($stateParams.connectorType, $stateParams.clusterId);
    }, function (newValue) {
      cluster = newValue;
      vm.clustername = cluster.name;
      vm.host = _.find(cluster.connectors, {
        hostSerial: $stateParams.hostSerial
      });
      if (vm.host && vm.host.hostname) {
        vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.host.connectorType);
        vm.localizedConnectorSectionHeader = $translate.instant('hercules.connectors.localizedConnectorAndHostHeader', {
          connectorName: vm.localizedConnectorName,
          hostname: vm.host.hostname
        });
      }
    }, true);

    function deleteHost() {
      $modal.open({
        templateUrl: 'modules/hercules/cluster-sidepanel/host-details/confirm-deleteHost-dialog.html',
        type: 'dialog',
        controller: 'ConfirmDeleteHostController',
        controllerAs: 'confirmDeleteHostDialog',
        resolve: {
          cluster: function () {
            return cluster;
          },
          hostSerial: function () {
            return vm.host.hostSerial;
          },
          connectorType: function () {
            return vm.host.connectorType;
          },
        }
      });
    }

    vm.showReassignHostDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
          },
          connector: function () {
            return vm.host;
          }
        },
        type: 'small',
        controller: 'ReassignClusterControllerV2',
        controllerAs: 'reassignClust',
        templateUrl: 'modules/mediafusion/media-service-v2/side-panel/reassign-node-to-different-cluster/reassign-cluster-dialog.html',
      })
        .result
        .then(function () {
          if (vm.host.connectorType === 'mf_mgmt') {
            $state.go('media-service-v2.list');
          }
        });
    };

    vm.showDeregisterHostDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
          },
          connector: function () {
            return vm.host;
          }
        },
        type: 'small',
        controller: 'HostDeregisterControllerV2',
        controllerAs: 'hostDeregister',
        templateUrl: 'modules/mediafusion/media-service-v2/side-panel/deregister-node/host-deregister-dialog.html',
      })
        .result
        .then(function () {
          if (vm.host.connectorType === 'mf_mgmt') {
            $state.go('media-service-v2.list');
          }
        });
    };

    vm.showMoveNodeAction = function () {
      return vm.host.connectorType === 'mf_mgmt';
    };

    vm.showDeregisterNodeAction = function () {
      return vm.host.connectorType === 'mf_mgmt';
    };

    vm.showDeleteNodeAction = function () {
      return (vm.host.state === 'offline' && vm.host.connectorType === 'c_mgmt');
    };
  }
}());
