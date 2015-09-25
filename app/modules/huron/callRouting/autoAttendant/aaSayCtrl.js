(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AASayCtrl', AASayCtrl);

  function AASayCtrl($scope, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;

    vm.menuEntry = {};

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var uiModel = AAUiModelService.getUiModel();
      var uiMenu = uiModel[vm.schedule];
      vm.entries = uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];
      if (vm.menuEntry.actions.length === 0) {
        var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('play', '');
        vm.menuEntry.addAction(menuAction);
      }
    }

    activate();

  }
})();
