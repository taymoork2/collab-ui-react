(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('AlarmController', AlarmController)
    .controller('ExpresswayHostDetailsController', ExpresswayHostDetailsController);

  /* @ngInject */
  function AlarmController($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.parseDate = function (timestamp) {
      return new Date(Number(timestamp) * 1000);
    };
  }

  /* @ngInject */
  function ExpresswayHostDetailsController($stateParams, $state, ClusterService, XhrNotificationService, $translate) {
    var vm = this;
    var cluster = ClusterService.getCluster($stateParams.connectorType, $stateParams.clusterId);
    vm.clustername = cluster.name;
    vm.host = _.find(cluster.connectors, {
      hostname: $stateParams.host
    });
    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.host.connectorType);
    vm.localizedConnectorSectionHeader = $translate.instant('hercules.connectors.localizedConnectorAndHostHeader', {
      connectorName: vm.localizedConnectorName,
      hostname: vm.host.hostname
    });
    vm.getSeverity = ClusterService.getRunningStateSeverity;

    vm.deleteHost = function () {
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
    };

  }
}());
