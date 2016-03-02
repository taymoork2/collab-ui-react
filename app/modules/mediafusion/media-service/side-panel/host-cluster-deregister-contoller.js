(function () {
  'use strict';

  /* @ngInject */
  function HostClusterDeregisterController(cluster, orgName, MediaClusterService, XhrNotificationService, $translate, $modalInstance, $window, $log, $modal) {
    var vm = this;
    window.x = $window;
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
      MediaClusterService
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
      MediaClusterService
        .deleteCluster(cluster.id)
        .then(function () {
          $modalInstance.close();
          $modal.open({
            resolve: {
              groupName: function () {
                return cluster.properties["mf.group.displayName"];
              }
            },
            controller: 'DeleteClusterController',
            controllerAs: "deleteClust",
            templateUrl: 'modules/mediafusion/media-service/side-panel/delete-cluster-dialog.html'
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
    .controller('HostClusterDeregisterController', HostClusterDeregisterController);

}());
