(function () {
  'use strict';

  /* @ngInject */
  function HostClusterDeregisterControllerV2(cluster, orgName, connector, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance, $modal) {
    var vm = this;

    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.defuseAreYouSure', {
        clusterName: cluster.name,
        organizationName: orgName
      });

    vm.deregister = function () {
      vm.saving = true;
      MediaClusterServiceV2
        .defuseV2Connector(connector.id)
        .then(function () {
          $modalInstance.close();
          $modal.open({
            resolve: {
              groupName: function () {
                return cluster.name;
              },
              clusterId: function () {
                return cluster.id;
              }
            },
            controller: 'DeleteClusterControllerV2',
            controllerAs: "deleteClust",
            templateUrl: 'modules/mediafusion/media-service-v2/side-panel/delete-cluster-dialog.html'
          });

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
    .controller('HostClusterDeregisterControllerV2', HostClusterDeregisterControllerV2);

}());
