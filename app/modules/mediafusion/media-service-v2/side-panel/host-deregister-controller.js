(function () {
  'use strict';

  /* @ngInject */
  function HostDeregisterControllerV2(cluster, connector, orgName, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance, Notification) {
    var vm = this;

    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.deregisterAreYouSure', {
        clusterName: cluster.name,
        organizationName: orgName
      });
    vm.saving = false;

    vm.deregister = function () {
      vm.saving = true;
      MediaClusterServiceV2
        .defuseV2Connector(connector.id)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
          Notification.notify($translate.instant('mediaFusion.deleteNodeSuccess'), 'success');
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
    .controller('HostDeregisterControllerV2', HostDeregisterControllerV2);

}());
