(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayHostDetailsController', ExpresswayHostDetailsController);

  /* @ngInject */
  function ExpresswayHostDetailsController($scope, $stateParams, $state, ClusterService, XhrNotificationService, $translate) {
    var cluster;
    var vm = this;
    vm.deleteHost = deleteHost;

    vm.getSeverity = ClusterService.getRunningStateSeverity;

    $scope.$watch(function () {
      return ClusterService.getCluster($stateParams.connectorType, $stateParams.clusterId);
    }, function (newValue) {
      cluster = newValue;
      vm.clustername = cluster.name;
      vm.host = _.find(cluster.connectors, {
        hostname: $stateParams.host
      });
      vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.host.connectorType);
      vm.localizedConnectorSectionHeader = $translate.instant('hercules.connectors.localizedConnectorAndHostHeader', {
        connectorName: vm.localizedConnectorName,
        hostname: vm.host.hostname
      });
    }, true);

    function deleteHost() {
      return ClusterService.deleteHost(cluster.id, vm.host.hostSerial)
        .then(function () {
          if (ClusterService.getCluster($stateParams.connectorType, cluster.id)) {
            $state.go('cluster-details', {
              clusterId: cluster.id
            });
          } else {
            $state.sidepanel.close();
          }
        }, XhrNotificationService.notify);
    }
  }
}());
