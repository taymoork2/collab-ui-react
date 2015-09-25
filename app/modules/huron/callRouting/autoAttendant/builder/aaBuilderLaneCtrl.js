(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderLaneCtrl', AABuilderLaneCtrl);

  /* @ngInject */
  function AABuilderLaneCtrl($scope, AAUiModelService, AAModelService, AutoAttendantCeMenuModelService) {

    var vm = this;
    vm.schedule = "";
    vm.entries = [];

    vm.addAction = addAction;

    /////////////////////

    function addAction(index) {
      var uiModel = AAUiModelService.getUiModel();
      var uiMenu = uiModel[vm.schedule];
      var menuEntry;

      menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      uiMenu.addEntryAt(index + 1, menuEntry);
    }

    function activate() {
      vm.schedule = $scope.schedule;
      vm.aaModel = AAModelService.getAAModel();
      vm.uiModel = AAUiModelService.getUiModel();
    }

    activate();
  }
})();
