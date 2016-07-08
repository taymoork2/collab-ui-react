(function () {
  'use strict';

  angular.module('Core')
    .controller('ChooseAccountTypeCtrl', ChooseAccountTypeCtrl);
  /* @ngInject */
  function ChooseAccountTypeCtrl($stateParams) {
    var vm = this;

    vm.wizardData = $stateParams.wizard.state().data;
    vm.radioSelect = null;

    vm.personal = function () {
      vm.radioSelect = 'personal';
    };

    vm.shared = function () {
      vm.radioSelect = 'shared';
    };

    vm.next = function () {
      $stateParams.wizard.next({
        accountType: vm.radioSelect
      }, vm.radioSelect);

    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

  }
})();
