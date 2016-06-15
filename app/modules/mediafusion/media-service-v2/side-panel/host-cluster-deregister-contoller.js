(function () {
  'use strict';

  /* @ngInject */
  function HostClusterDeregisterControllerV2(cluster, orgName, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance, $window, $log, $modal) {
    var vm = this;

    vm.deregisterAreYouSure = $translate.instant(
      'mediaFusion.clusters.defuseAreYouSure', {
        clusterName: cluster.name,
        organizationName: orgName
      });

    vm.deregisterItem1 = $translate.instant(
      'mediaFusion.clusters.defuseCausesListItem1', {
        groupName: cluster.properties["mf.group.displayName"]
      });
    vm.saving = false;

    /*vm.deleteCluster = function () {
      MediaClusterServiceV2
        .deleteGroup(cluster.assigned_property_sets)
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
    };*/

    vm.deregister = function () {
      vm.saving = true;
      MediaClusterServiceV2
        .deleteCluster(cluster.id)
        .then(function () {
          $modalInstance.close();
          $modal.open({
            resolve: {
              groupName: function () {
                return cluster.properties["mf.group.displayName"];
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
