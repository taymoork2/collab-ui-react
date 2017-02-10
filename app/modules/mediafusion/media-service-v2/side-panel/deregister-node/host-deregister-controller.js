(function () {
  'use strict';

  /* @ngInject */
  function HostDeregisterControllerV2(cluster, connector, MediaClusterServiceV2, $translate, $modalInstance, Notification) {
    var vm = this;

    vm.saving = false;

    vm.deregister = function () {
      vm.saving = true;
      MediaClusterServiceV2
        .defuseV2Connector(connector.id)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
          Notification.success('mediaFusion.deleteNodeSuccess');
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name
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
