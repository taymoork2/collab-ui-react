(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ConfirmDeleteResourceGroupController', ConfirmDeleteResourceGroupController);

  /* @ngInject */
  function ConfirmDeleteResourceGroupController($modalInstance, resourceGroup, ResourceGroupService, Notification) {
    var vm = this;
    vm.resourceGroup = resourceGroup;
    vm.confirmRemove = confirmRemove;

    function confirmRemove() {
      ResourceGroupService.remove(vm.resourceGroup.id).then(function () {
        Notification.success('hercules.resourceGroupSettings.deleteSuccess');
        $modalInstance.close();
      }).catch(function () {
        Notification.error('hercules.genericFailure');
      });
    }
  }
})();
