(function () {
  'use strict';

  angular.module('Core')
    .controller('NewSharedSpaceCtrl', NewSharedSpaceCtrl);
  /* @ngInject */
  function NewSharedSpaceCtrl($stateParams) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.selected = null;
    vm.radioSelect = null;
    vm.isLoading = false;
    vm.deviceName = (wizardData.account && wizardData.account.name) || "";
    vm.isNameValid = function () {
      return vm.deviceName && vm.deviceName.length < 128;
    };

    vm.next = function () {
      $stateParams.wizard.next({
        account: {
          name: vm.deviceName
        }
      });
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
