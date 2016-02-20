(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToHGCtrl', AARouteToHGCtrl);

  /* @ngInject */
  function AARouteToHGCtrl($scope, $translate, HuntGroupService, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;

    vm.hgSelected = {
      description: '',
      id: ''
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
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
      vm.hgSelected.id = vm.menuKeyEntry.actions[0].getValue();
      vm.hgSelected.description = _.result(_.find(vm.huntGroups, {
        'id': vm.hgSelected.id
      }), 'description', '');

    }

    function saveUiModel() {
      vm.menuKeyEntry.actions[0].setValue(vm.hgSelected.id);
      AACommonService.setPhoneMenuStatus(true);
    }

    function getHuntGroups() {

      return HuntGroupService.getListOfHuntGroups().then(function (hgPool) {
        _.each(hgPool, function (aHuntGroup) {
          vm.huntGroups.push({
            description: aHuntGroup.name.concat(' (').concat(_.head(_.pluck(aHuntGroup.numbers, 'number'))).concat(')'),
            id: aHuntGroup.uuid
          });
        });
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
