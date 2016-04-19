(function () {
  'use strict';

  /* @ngInject */
  function HostDeregisterController(cluster, orgName, MediaClusterService, XhrNotificationService, $translate, $modalInstance, $window, $log) {
    var vm = this;

    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.deregisterAreYouSure', {
        clusterName: cluster.name,
        organizationName: orgName
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
