(function () {
  'use strict';

  /* @ngInject */
  function HostDeregisterController(cluster, MediaClusterService, XhrNotificationService, $translate, $modalInstance, $window) {
    var vm = this;
    window.x = $window;
    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.deregisterAreYouSure', {
        clusterName: cluster.name
      });
    vm.saving = false;
    vm.deregister = function () {
      vm.saving = true;
      MediaClusterService
        .deleteCluster(cluster.id)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.clusters.deregisterErrorGeneric', {
            clusterName: cluster.name,
            errorMessage: XhrNotificationService.getMessages(err).join(', ')
          });
          vm.saving = false;
        });
      return false;
    };

    vm.close = $modalInstance.close;
  }

  angular
    .module('Mediafusion')
    .controller('HostDeregisterController', HostDeregisterController);

}());
