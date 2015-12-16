(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToHGCtrl', AARouteToHGCtrl);

  /* @ngInject */
  function AARouteToHGCtrl($scope, $translate, HuntGroupService, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;

    vm.hgSelected = {
      description: '',
      id: ''
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectHGPlaceHolder');
    vm.huntGroups = [];

    vm.aaModel = {};
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    var rtHG = 'routeToHuntGroup';

    /////////////////////

    function populateUiModel() {
      vm.hgSelected.description = vm.menuKeyEntry.actions[0].getDescription();
      vm.hgSelected.id = vm.menuKeyEntry.actions[0].getValue();
    }

    function saveUiModel() {
      vm.menuKeyEntry.actions[0].setValue(vm.hgSelected.id);
      vm.menuKeyEntry.actions[0].setDescription(vm.hgSelected.description);
    }

    function getHuntGroups() {

      return HuntGroupService.getListOfHuntGroups().then(function (hgPool) {
        for (var i = 0; i < hgPool.length; i++) {
          var hg = {
            description: hgPool[i].name.concat(' (').concat(hgPool[i].numbers[0]).concat(')'),
            id: hgPool[i].uuid
          };
          vm.huntGroups.push(hg);
        }
      });

    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      var ui = AAUiModelService.getUiModel();

      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];

      if ($scope.keyIndex < vm.menuEntry.entries.length) {
        vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
      } else {
        vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
        vm.menuKeyEntry.addAction(action);
      }

      getHuntGroups().then(function () {
        populateUiModel();
      });

    }

    activate();

  }
})();
