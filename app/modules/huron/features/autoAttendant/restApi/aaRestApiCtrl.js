(function () {
  'use strict';

  angular
  .module('uc.autoattendant')
  .controller('AARestApiCtrl', AARestApiCtrl);

  /* @ngInject */
  function AARestApiCtrl($modal, $scope, AAUiModelService) {

    var vm = this;

    vm.method = '';
    vm.url = '';
    vm.openConfigureApiModal = openConfigureApiModal;

    /////////////////////

    function openConfigureApiModal() {
      openModal().result.then(function () {
        vm.method = vm.menuEntry.doRest.method;
        vm.url = vm.menuEntry.doRest.url;
        return vm.menuEntry.doRest;
      });
    }

    function openModal() {
      return $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/restApi/aaConfigureApiModal.tpl.html',
        controller: 'AAConfigureApiModalCtrl',
        controllerAs: 'aaConfigureApiModal',
        type: 'full',
        resolve: {
          aa_schedule: function () {
            return $scope.schedule;
          },
          aa_index: function () {
            return $scope.index;
          },
        },
      });
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];
      if (!_.has(vm.menuEntry, 'doRest')) {
        vm.menuEntry.doRest = {};
      }
    }

    activate();
  }
})();
