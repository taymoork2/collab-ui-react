(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('HybridServicesHostDetailsController', HybridServicesHostDetailsController);

  /* @ngInject */
  function HybridServicesHostDetailsController($modal, $rootScope, $scope, $state, $stateParams, $translate, ClusterService, HybridServicesClusterStatesService, hasNodesViewFeatureToggle) {
    var cluster;
    var vm = this;
    var type = $stateParams.specificType || $stateParams.connectorType;
    var localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + type);
    vm.actions = [];
    vm.deleteExpressway = deleteExpressway;
    vm.goToNodesPage = goToNodesPage;
    vm.showDeregisterHostDialog = showDeregisterHostDialog;
    vm.showNodeLink = showNodeLink;
    vm.showReassignHostDialog = showReassignHostDialog;

    vm.getSeverity = HybridServicesClusterStatesService.getSeverity;

    $state.current.data.displayName = localizedConnectorName;
    $rootScope.$broadcast('displayNameUpdated');

    $scope.$watch(function () {
      return ClusterService.getCluster(type, $stateParams.clusterId);
    }, function (newValue) {
      cluster = newValue;
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
        vm.actions = getActionsButton();
      }
    }, true);

    function deleteExpressway() {
      $modal.open({
        templateUrl: 'modules/hercules/cluster-sidepanel/host-details/confirm-deleteHost-dialog.html',
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
        templateUrl: 'modules/mediafusion/media-service-v2/side-panel/reassign-node-to-different-cluster/reassign-cluster-dialog.html',
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
        templateUrl: 'modules/mediafusion/media-service-v2/side-panel/deregister-node/host-deregister-dialog.html',
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
      return vm.host.connectorType === 'mf_mgmt' && hasNodesViewFeatureToggle;
    }

    function goToNodesPage() {
      $state.go('mediafusion-cluster.nodes', {
        id: cluster.id,
      });
    }

    function getActionsButton() {
      var actions = [];
      if (!hasNodesViewFeatureToggle && vm.host.connectorType !== 'mf_mgmt') {
        actions.push({
          href: 'https://' + vm.host.hostname + '/',
          textKey: 'hercules.connectors.goToHost',
        });
      }
      if (!hasNodesViewFeatureToggle && vm.host.connectorType === 'mf_mgmt') {
        actions.push({
          click: showReassignHostDialog,
          textKey: 'hercules.connectors.moveNode',
        });
      }
      if (!hasNodesViewFeatureToggle && (vm.host.connectorType === 'mf_mgmt' || vm.host.connectorType === 'hds_app')) {
        actions.push({
          click: showDeregisterHostDialog,
          textKey: 'hercules.connectors.deregisterNode',
        });
      }
      if (!hasNodesViewFeatureToggle && vm.host.state === 'offline' && vm.host.connectorType === 'c_mgmt') {
        actions.push({
          click: deleteExpressway,
          textKey: 'hercules.connectors.removeNode',
        });
      }
      return actions;
    }
  }
}());
