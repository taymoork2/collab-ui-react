(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AutoAttendantCustomMenuCtrl', AutoAttendantCustomMenuCtrl);

  /* @ngInject */
  function AutoAttendantCustomMenuCtrl($scope, AAModelService, AutoAttendantCeMenuModelService) {
    var vm = this;
    vm.customDialogMenuEntry = {};
    vm.copyMenuOption = copyMenuOption;
    vm.deleteMenu = deleteMenu;
    vm.saveMenuOption = saveMenuOption;

    /////////////////////

    function deleteMenu(menu) {
      if (angular.isUndefined(menu) || menu === null) {
        return;
      }

      AutoAttendantCeMenuModelService.deleteMenu(vm.aaModel.aaRecord, 'regularOpenActions', 'MENU_CUSTOM');
      vm.ui.customMenu = undefined;
      vm.ui.showCustomMenu = false;
    }

    function copyMenuOption(menu, menuEntry) {
      vm.currentMenu = menu;
      vm.currentMenuEntry = menuEntry;
      vm.customDialogMenuEntry = menuEntry.clone();
    }

    function saveMenuOption(dMenuEntry) {
      for (var attr in dMenuEntry) {
        vm.currentMenuEntry[attr] = angular.copy(dMenuEntry[attr]);
      }
      vm.currentMenuEntry.isConfigured = true;

      AutoAttendantCeMenuModelService.updateMenu(vm.aaModel.aaRecord, 'regularOpenActions', vm.currentMenu);
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = $scope.aa.modal;
    }

    activate();
  }
})();
