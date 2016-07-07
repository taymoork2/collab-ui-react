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

    var fromRouteCall = false;

    /////////////////////

    function populateUiModel() {

      if (fromRouteCall) {
        vm.hgSelected.id = vm.menuEntry.actions[0].getValue();
      } else {
        vm.hgSelected.id = vm.menuKeyEntry.actions[0].getValue();
      }

      vm.hgSelected.description = _.result(_.find(vm.huntGroups, {
        'id': vm.hgSelected.id
      }), 'description', '');

    }

    function saveUiModel() {
      if (fromRouteCall) {
        vm.menuEntry.actions[0].setValue(vm.hgSelected.id);
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.hgSelected.id);
      }

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

      if ($scope.fromRouteCall) {
        fromRouteCall = true;

        if (vm.menuEntry.actions.length === 0) {
          action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
          vm.menuEntry.addAction(action);
        } else {
          // make sure action is HG not AA, User, extNum, etc
          if (!(vm.menuEntry.actions[0].getName() === rtHG)) {
            vm.menuEntry.actions[0].setName(rtHG);
            vm.menuEntry.actions[0].setValue('');
          } // else let saved value be used
        }
      } else {
        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtHG, '');
          vm.menuKeyEntry.addAction(action);
        }

      }

      getHuntGroups().then(function () {
        vm.huntGroups.sort(AACommonService.sortByProperty('description'));
        populateUiModel();
      });

    }

    activate();

  }
})();
