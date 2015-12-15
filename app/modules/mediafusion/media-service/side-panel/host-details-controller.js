'use strict';

angular.module('Mediafusion')
  .controller('HostDetailsController',

    /* @ngInject */
    function ($stateParams, $state, MediaClusterService, XhrNotificationService) {
      var vm = this;
      vm.host = $stateParams.host;
      vm.cluster = MediaClusterService.getClusters()[$stateParams.clusterId];
      vm.clusterId = $stateParams.clusterId;
      vm.serviceType = $stateParams.serviceType;
      vm.roleSelected = $stateParams.role;

      vm.connector = function () {
        var service = _.find(vm.cluster.services, {
          service_type: vm.serviceType
        });
        return _.find(service.connectors, function (connector) {
          return connector.host.serial == vm.host.serial;
        });
      };

      vm.deleteHost = function () {
        return MediaClusterService.deleteHost(vm.cluster.id, vm.connector().host.serial).then(function () {
          if (MediaClusterService.getClusters()[vm.cluster.id]) {
            $state.go('connector-details', {
              clusterId: vm.cluster.id
            });
          } else {
            $state.sidepanel.close();
          }
        }, XhrNotificationService.notify);
      };
    }
  );
