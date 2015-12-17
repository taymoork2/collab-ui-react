(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADialByExtCtrl', AADialByExtCtrl);

  /* @ngInject */
  function AADialByExtCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;

    vm.aaModel = {};
    vm.menuEntry = {};
    vm.placeholder = $translate.instant('autoAttendant.sayMessagePlaceholder');
    vm.message = '';

    vm.saveUiModel = saveUiModel;

    /////////////////////

    function populateUiModel() {
      vm.message = vm.menuEntry.actions[0].value;
    }

    function saveUiModel() {
      vm.menuEntry.actions[0].setValue(vm.message);
    }

    function activate() {

      var uiModel = AAUiModelService.getUiModel();
      var uiCombinedMenu = uiModel[$scope.schedule];
      var uiPhoneMenu = uiCombinedMenu.entries[$scope.index];

      // Read an existing dialByExt entry if exist or initialize it if not
      if ($scope.keyIndex < uiPhoneMenu.entries.length) {
        vm.menuEntry = uiPhoneMenu.entries[$scope.keyIndex];
      } else {
        vm.menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry('runActionsOnInput', '');
        vm.menuEntry.addAction(action);
      }

      populateUiModel();
    }

    activate();

  }
})();
