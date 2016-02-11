(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayClusterSettingsController', ExpresswayClusterSettingsController)
    .controller('AlarmController', AlarmController)
    .controller('ExpresswayHostDetailsController', ExpresswayHostDetailsController);

  /* @ngInject */
  function ExpresswayClusterSettingsController(ServiceStatusSummaryService, $modal, $stateParams, ClusterService, $scope, XhrNotificationService) {
    var vm = this;
    var clusterId = $stateParams.clusterId;
    var serviceType = $stateParams.serviceType;
    var cluster = ClusterService.getCluster(serviceType, clusterId);
    vm.saving = false;

    vm.serviceNotInstalled = function () {
      return ServiceStatusSummaryService.serviceNotInstalled(serviceType, cluster);
    };

    vm.showDeregisterDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: 'clusterDeregister',
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
      });
    };
  }

  /* @ngInject */
  function AlarmController($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.parseDate = function (timestamp) {
      return new Date(Number(timestamp) * 1000);
    };
  }

  /* @ngInject */
  function ExpresswayHostDetailsController($stateParams, $state, ClusterService, XhrNotificationService) {
    var vm = this;
    var cluster = ClusterService.getCluster($stateParams.serviceType, $stateParams.clusterId);
    vm.host = _.find(cluster.connectors, {
      hostname: $stateParams.host
    });

    vm.deleteHost = function () {
      return ClusterService.deleteHost(cluster.id, vm.host.hostSerial)
        .then(function () {
          if (ClusterService.getCluster($stateParams.serviceType, cluster.id)) {
            $state.go('cluster-details', {
              clusterId: vm.cluster.id
            });
          } else {
            $state.sidepanel.close();
          }
        }, XhrNotificationService.notify);
    };
  }
}());
