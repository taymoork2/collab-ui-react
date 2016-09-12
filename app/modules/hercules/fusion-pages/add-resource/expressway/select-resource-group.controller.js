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
    vm.resourceGroupOptions = [{ label: $translate.instant('hercules.addResourceDialog.selectGroup'), value: '' }];
    vm.selectedResourceGroup = vm.resourceGroupOptions[0];
    vm.assignToResourceGroup = 'no';
    vm._translation = {
      assignYes: $translate.instant('hercules.addResourceDialog.assignYes'),
      assignNo: $translate.instant('hercules.addResourceDialog.assignNo'),
    };
    vm.next = next;
    vm.canGoNext = canGoNext;

    init();

    function init() {
      if (!FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)) {
        $stateParams.wizard.next();
        return;
      }
      ResourceGroupService.getAllAsOptions().then(function (options) {
        if (options.length > 0) {
          vm.resourceGroupOptions = vm.resourceGroupOptions.concat(options);
          vm.loading = false;
        } else {
          $stateParams.wizard.next();
        }
      }, function () {
        Notification.error('hercules.genericFailure');
      });
    }

    function canGoNext() {
      return !vm.loading && (vm.assignToResourceGroup === 'no' || vm.selectedResourceGroup.value !== '');
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
