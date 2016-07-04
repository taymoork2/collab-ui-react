(function () {
  'use strict';

  angular.module('Core')
    .controller('AddServicesCtrl', AddServicesCtrl);
  /* @ngInject */
  function AddServicesCtrl($stateParams) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;
    vm.next = function () {
      $stateParams.wizard.next();
    };
  }
})();
