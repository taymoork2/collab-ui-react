(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARestApiCtrl', AARestApiCtrl);

  /* @ngInject */
  function AARestApiCtrl($modal, $scope, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {
    var vm = this;

    var doREST = 'doREST';
    var action;
    vm.variables = [];

    vm.method = '';
    vm.url = '';
    vm.uniqueCtrlIdentifer = '';

    vm.openConfigureApiModal = openConfigureApiModal;

    /////////////////////

    function openConfigureApiModal() {
      openModal().result.then(function () {
        vm.method = action.method;
        vm.url = action.url;
        vm.variables = action.variableSet;
        if (!_.isEmpty(vm.method) && !_.isEmpty(vm.url)) {
          AACommonService.setRestApiStatus(true);
          AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
        }
      });
    }

    $scope.$on(
      '$destroy',
      function () {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
      }
    );

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

    function populateUiModel() {
      vm.method = action.method;
      vm.url = action.url;
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];
      action = _.get(vm.menuEntry, 'actions[0]', '');
      vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, AACommonService.getUniqueId());
      if (!action || action.getName() !== doREST) {
        action = AutoAttendantCeMenuModelService.newCeActionEntry(doREST, '');
        action.url = '';
        action.method = '';
        vm.menuEntry.addAction(action);
        AACommonService.setRestApiStatus(false);
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, false);
      }

      populateUiModel();
    }

    activate();
  }
})();
