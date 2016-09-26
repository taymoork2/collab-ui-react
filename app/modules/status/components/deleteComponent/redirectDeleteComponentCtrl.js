(function () {
  'use strict';

  angular
    .module('Status')
    .controller('RedirectDelComponentCtrl', RedirectDelComponentCtrl);

  /* @ngInject */
  function RedirectDelComponentCtrl(ComponentsService, $stateParams, $state) {
    var vm = this;
    vm.componentName = $stateParams.component.componentName;
    vm.delText = "";

    vm.validation = function () {
      return vm.delText === 'DELETE';
    };

    vm.delComponentBtnClicked = function () {
      if (!vm.validation()) {
        return;
      }
      ComponentsService
        .delComponent($stateParams.component)
        .then(function () {
          $state.go('^');
        });
    };
  }
})();
