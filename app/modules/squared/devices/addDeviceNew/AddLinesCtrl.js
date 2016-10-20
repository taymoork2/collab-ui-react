(function () {
  'use strict';

  angular.module('Core')
    .controller('AddLinesCtrl', AddLinesCtrl);
  /* @ngInject */
  function AddLinesCtrl($stateParams) {
    var vm = this;
    vm.wizardData = $stateParams.wizard.state().data;
    vm.next = function () {
      $stateParams.wizard.next();
    };
  }
})();
