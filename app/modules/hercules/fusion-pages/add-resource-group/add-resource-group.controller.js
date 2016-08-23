(function () {
  'use strict';

  angular.module('Hercules')
    .controller('AddResourceGroupController', AddResourceGroupController);

  /* @ngInject */
  function AddResourceGroupController($modalInstance, $translate, Notification, ResourceGroupService) {
    var vm = this;
    vm.creating = false;
    vm.name = '';
    vm.releaseChannel = 'stable';
    vm._translation = {
      name: {
        placeholder: $translate.instant('hercules.fusion.add-resource-group.name.placeholder'),
      },
      releaseChannel: {
        stable: $translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
        stableHelpText: $translate.instant('hercules.fusion.add-resource-group.release-channel.stableHelpText'),
        beta: $translate.instant('hercules.fusion.add-resource-group.release-channel.beta'),
        betaHelpText: $translate.instant('hercules.fusion.add-resource-group.release-channel.betaHelpText'),
        latest: $translate.instant('hercules.fusion.add-resource-group.release-channel.latest'),
        latestHelpText: $translate.instant('hercules.fusion.add-resource-group.release-channel.latestHelpText'),
      },
    };
    vm.minlength = 1;
    vm.validationMessages = {
      required: $translate.instant('common.invalidRequired'),
      minlength: $translate.instant('common.invalidMinLength', {
        min: vm.minlength
      })
    };
    vm.createResourceGroup = createResourceGroup;
    vm.canCreate = canCreate;
    vm.handleKeypress = handleKeypress;

    ///////////////

    function createResourceGroup() {
      vm.creating = true;
      ResourceGroupService.create(vm.name, vm.releaseChannel)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function () {
          Notification.error('hercules.fusion.add-resource-group.release-channel.error');
        })
        .finally(function () {
          vm.creating = false;
        });
    }

    function canCreate() {
      return vm.name && vm.name.length >= vm.minlength;
    }

    function handleKeypress(event) {
      if (event.keyCode === 13 && canCreate()) {
        createResourceGroup();
      }
    }
  }
})();
