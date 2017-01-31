(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayHostDetailsController', ExpresswayHostDetailsController);

  /* @ngInject */
  function ExpresswayHostDetailsController($scope, $stateParams, ClusterService, $translate, $modal, FusionClusterStatesService) {
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
      vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.host.connectorType);
      vm.localizedConnectorSectionHeader = $translate.instant('hercules.connectors.localizedConnectorAndHostHeader', {
        connectorName: vm.localizedConnectorName,
        hostname: vm.host.hostname
      });
    }, true);

    function deleteHost() {
      $modal.open({
        templateUrl: 'modules/hercules/cluster-sidepanel/confirm-deleteHost-dialog.html',
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
  }
}());
