(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('HybridServicesHostDetailsController', HybridServicesHostDetailsController);

  /* @ngInject */
  function HybridServicesHostDetailsController($modal, $rootScope, $state, $stateParams, $timeout, $translate, HybridServicesClusterService) {
    var cluster;
    var vm = this;
    var type = $stateParams.specificType || $stateParams.connectorType;
    var localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + type);
    vm.deleteExpressway = deleteExpressway;
    vm.goToNodesPage = goToNodesPage;
    vm.showDeregisterHostDialog = showDeregisterHostDialog;
    vm.showNodeLink = showNodeLink;
    vm.showReassignHostDialog = showReassignHostDialog;

    $state.current.data.displayName = localizedConnectorName;
    $rootScope.$broadcast('displayNameUpdated');

    updateCluster();

    function updateCluster() {
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          cluster = _.find(clusters, { id: $stateParams.clusterId });
          vm.clustername = cluster.name;
          vm.host = _.find(cluster.connectors, {
            hostSerial: $stateParams.hostSerial,
            connectorType: type,
          });
          if (vm.host && vm.host.hostname) {
            vm.localizedConnectorSectionHeader = $translate.instant('hercules.connectors.localizedConnectorAndHostHeader', {
              connectorName: localizedConnectorName,
              hostname: vm.host.hostname,
            });
            vm.isHybridContextCluster = (cluster.targetType === 'cs_mgmt');
          }
          $timeout(updateCluster, 30 * 1000);
        });
    }

    function deleteExpressway() {
      $modal.open({
        template: require('modules/hercules/hybrid-services-nodes-page/delete-expressway-host-modal/confirm-deleteHost-dialog.html'),
        type: 'dialog',
        controller: 'ConfirmDeleteHostController',
        controllerAs: 'confirmDeleteHostDialog',
        resolve: {
          hostSerial: function () {
            return vm.host.hostSerial;
          },
          connectorType: function () {
            return vm.host.connectorType;
          },
        },
      });
    }

    /* Only used for Hybrid Media nodes  */
    function showReassignHostDialog() {
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
          },
          connector: function () {
            return vm.host;
          },
        },
        type: 'small',
        controller: 'ReassignClusterControllerV2',
        controllerAs: 'reassignCluster',
        template: require('modules/mediafusion/media-service-v2/side-panel/reassign-node-to-different-cluster/reassign-cluster-dialog.html'),
      })
        .result
        .then(function () {
          $state.go('media-service-v2.list');
        });
    }

    /* Only used for Hybrid Media nodes and Hybrid Data Security nodes  */
    function showDeregisterHostDialog() {
      $modal.open({
        resolve: {
          clusterName: function () {
            return cluster.name;
          },
          connectorId: function () {
            return vm.host.id;
          },
        },
        type: 'dialog',
        controller: 'HostDeregisterControllerV2',
        controllerAs: 'hostDeregister',
        template: require('modules/mediafusion/media-service-v2/side-panel/deregister-node/host-deregister-dialog.html'),
      })
        .result
        .then(function () {
          if (vm.host.connectorType === 'mf_mgmt') {
            $state.go('media-service-v2.list');
          }
          if (vm.host.connectorType === 'hds_app') {
            $state.go('hds.list');
          }
        });
    }

    function showNodeLink() {
      return vm.host.connectorType === 'mf_mgmt';
    }

    function goToNodesPage() {
      $state.go('mediafusion-cluster.nodes', {
        id: cluster.id,
        backState: 'media-service-v2.list',
      });
    }
  }
}());
