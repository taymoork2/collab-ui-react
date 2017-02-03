(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseAccountTypeCtrl', ChooseAccountTypeCtrl);
  /* @ngInject */
  function ChooseAccountTypeCtrl($stateParams) {
    var vm = this;

    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.radioSelect = null;
    vm.isLoading = false;

    vm.isNewPlaceFlow = function () {
      return wizardData.function !== 'addDevice';
    };

    vm.hideBackButton = vm.isNewPlaceFlow() || wizardData.showPersonal;
    vm.hideCancelButton = !vm.isNewPlaceFlow() && !wizardData.showPersonal;

    vm.personal = function () {
      vm.radioSelect = 'personal';
    };

    vm.shared = function () {
      vm.radioSelect = 'shared';
    };

    vm.next = function () {
      vm.isLoading = true;
      $stateParams.wizard.next({
        account: {
          type: vm.radioSelect
        }
      }, vm.radioSelect);

    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

  }
})();
