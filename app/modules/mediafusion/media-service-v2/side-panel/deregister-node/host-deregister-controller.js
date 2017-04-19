(function () {
  'use strict';

  /* @ngInject */
  function HostDeregisterControllerV2(cluster, connector, ClusterService, $translate, $modalInstance, Notification) {
    var vm = this;

    vm.saving = false;

    vm.deregister = function () {
      vm.saving = true;
      ClusterService
        .deleteHost(connector.hostSerial)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
          Notification.success('mediaFusion.deleteNodeSuccess');
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name,
          });
          Notification.errorWithTrackingId(err, vm.error);
          vm.saving = false;
        });
      return false;
    };
  }

  angular
    .module('Mediafusion')
    .controller('HostDeregisterControllerV2', HostDeregisterControllerV2);

}());
