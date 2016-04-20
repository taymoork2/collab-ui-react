(function () {
  'use strict';

  /* @ngInject */
  function DeleteClusterController(groupName, MediaClusterService, XhrNotificationService, $translate, $modalInstance, $window, $log) {
    var vm = this;
    window.x = $window;
    vm.groupDetail = null;

    vm.deleteAreYouSure = $translate.instant(
      'mediaFusion.deleteGroup.message', {
        groupName: groupName
      });
    vm.saving = false;

    vm.delete = function () {
      vm.saving = true;
      MediaClusterService.getGroups().then(function (group) {
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
      MediaClusterService
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
    .controller('DeleteClusterController', DeleteClusterController);

}());
