(function () {
  'use strict';

  /* @ngInject */
  function DeleteClusterControllerV2(groupName, MediaClusterServiceV2, XhrNotificationService, $translate, $modalInstance, $window, $log) {
    var vm = this;

    vm.groupDetail = null;

    vm.deleteAreYouSure = $translate.instant(
      'mediaFusion.deleteGroup.message', {
        groupName: groupName
      });
    vm.saving = false;

    vm.delete = function () {
      vm.saving = true;
      MediaClusterServiceV2.getGroups().then(function (group) {
        _.each(group, function (group) {
          if (group.name == groupName) {
            vm.groupDetail = group;
          }
        });
        vm.deleteCluster();
      }, function (err) {
        vm.error = $translate.instant('mediaFusion.deleteGroup.errorMessage', {
          groupName: groupName,
          errorMessage: XhrNotificationService.getMessages(err).join(', ')
        });
        vm.saving = false;
      });
      return false;
    };

    vm.deleteCluster = function () {
      MediaClusterServiceV2
        .deleteGroup(vm.groupDetail.id)
        .then(function () {
          $modalInstance.close();
          vm.saving = false;
        }, function (err) {
          vm.error = $translate.instant('mediaFusion.deleteGroup.errorMessage', {
            groupName: groupName,
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
    .controller('DeleteClusterControllerV2', DeleteClusterControllerV2);

}());
