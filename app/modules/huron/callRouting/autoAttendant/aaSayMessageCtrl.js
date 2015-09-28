(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AASayMessageCtrl', AASayMessageCtrl);

  function AASayMessageCtrl($scope, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;

    vm.menuEntry = {};

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[vm.schedule];
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
