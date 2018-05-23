(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ConfirmDeleteResourceGroupController', ConfirmDeleteResourceGroupController);

  /* @ngInject */
  function ConfirmDeleteResourceGroupController($modalInstance, resourceGroup, ResourceGroupService, Notification, USSService) {
    var vm = this;
    vm.resourceGroup = resourceGroup;
    vm.confirmRemove = confirmRemove;

    function confirmRemove() {
      USSService.removeAllUsersFromResourceGroup(vm.resourceGroup.id)
        .then(function () {
          ResourceGroupService.remove(vm.resourceGroup.id)
            .then(function () {
              Notification.success('hercules.resourceGroupSettings.deleteSuccess');
              $modalInstance.close();
            })
            .catch(function (response) {
              Notification.errorWithTrackingId(response, 'hercules.genericFailure');
            });
        })
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'hercules.resourceGroupSettings.failedToRemoveUsersFromGroup');
        });
    }
  }
})();
