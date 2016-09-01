(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ConfirmChangeReleaseChannelController', ConfirmChangeReleaseChannelController);

  /* @ngInject */
  function ConfirmChangeReleaseChannelController($modalInstance, resourceGroup, releaseChannel, ResourceGroupService, Notification, $translate) {
    var vm = this;
    vm.resourceGroup = resourceGroup;
    vm.releaseChannel = releaseChannel;
    vm.releaseChannelName = $translate.instant('hercules.fusion.add-resource-group.release-channel.' + releaseChannel);
    vm.confirmChange = confirmChange;

    function confirmChange() {
      ResourceGroupService.setReleaseChannel(vm.resourceGroup.id, vm.releaseChannel)
        .then(function () {
          Notification.success('hercules.resourceGroupSettings.groupReleaseChannelSaved');
          $modalInstance.close();
        }, function () {
          Notification.error('hercules.genericFailure');
        });
    }
  }
})();
