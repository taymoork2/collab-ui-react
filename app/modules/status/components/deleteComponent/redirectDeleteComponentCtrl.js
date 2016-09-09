(function () {
  'use strict';

  angular
    .module('Status')
    .controller('RedirectDelComponentCtrl', RedirectDelComponentCtrl);

  /* @ngInject */
  function RedirectDelComponentCtrl(ComponentsService, $stateParams, $state) {
    var vm = this;
    vm.delComponentBtnClicked = delComponentBtnClicked;
    vm.componentName = $stateParams.component.componentName;
    vm.delText = "";

    vm.validation = function () {
      return vm.delText.toLocaleLowerCase() === 'delete';
    };

    function delComponentBtnClicked() {
      if (!vm.validation()) {
        return;
      }
      ComponentsService
        .delComponent($stateParams.component)
        .then(function () {
          $state.go('^');
        });
    }
  }
})();
