(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswaySelectResourceGroupController', ExpresswaySelectResourceGroupController);

  /* @ngInject */
  function ExpresswaySelectResourceGroupController($stateParams, $translate, FeatureToggleService, ResourceGroupService, Notification) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.clusterId = wizardData.expressway.clusterId;
    vm.loading = true;
    vm.resourceGroupOptions = [{ label: $translate.instant('hercules.resourceGroups.noGroupSelected'), value: '' }];
    vm.selectedResourceGroup = vm.resourceGroupOptions[0];
    vm.next = next;

    init();

    function init() {
      if (!FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)) {
        $stateParams.wizard.next();
        return;
      }
      ResourceGroupService.getAll().then(function (groups) {
        if (groups && groups.length > 0) {
          _.each(groups, function (group) {
            vm.resourceGroupOptions.push({
              label: group.name + (group.releaseChannel ? ' (' + $translate.instant('hercules.fusion.add-resource-group.release-channel.' + group.releaseChannel) + ')' : ''),
              value: group.id
            });
          });
          vm.loading = false;
        } else {
          $stateParams.wizard.next();
        }
      }, function () {
        Notification.error('hercules.genericFailure');
      });
    }

    function next() {
      if (vm.selectedResourceGroup.value !== '') {
        ResourceGroupService.assign(vm.clusterId, vm.selectedResourceGroup.value)
          .then(function () {
            $stateParams.wizard.next();
          }, function () {
            Notification.error('hercules.genericFailure');
          });
      } else {
        $stateParams.wizard.next();
      }
    }
  }
})();
