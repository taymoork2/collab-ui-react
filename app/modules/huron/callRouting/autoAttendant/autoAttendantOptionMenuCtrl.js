(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AutoAttendantOptionMenuCtrl', AutoAttendantOptionMenuCtrl);

  /* @ngInject */
  function AutoAttendantOptionMenuCtrl($scope, $translate, AAModelService, AutoAttendantCeMenuModelService) {
    var vm = this;
    vm.ui = {};
    vm.ui.ceInfo = {};
    vm.ui.optionMenu = {};

    vm.optionDialogMenuEntry = {};
    vm.showKey = false;
    vm.showPlay = true;
    vm.showActionDescription = false;
    vm.keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
    vm.optionMenuDropdownItems = [
      $translate.instant('autoAttendant.configureMenuOption')
    ];
    vm.optionMenuDefaultActions = [{
      label: $translate.instant('autoAttendant.routeToNumber'),
      value: 2,
      name: 'route',
      id: 'route',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.repeatMenu'),
      value: 4,
      name: 'repeatActionsOnInput',
      id: 'repeatActionsOnInput',
      isDisabled: false
    }];
    vm.optionMenuInputActions = [{
      label: $translate.instant('common.play'),
      value: 1,
      name: 'play',
      id: 'play',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.routeToNumber'),
      value: 2,
      name: 'route',
      id: 'route',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.routeToMailbox'),
      value: 3,
      name: 'routeToMailbox',
      id: 'routeToMailbox',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.repeatMenu'),
      value: 4,
      name: 'repeatActionsOnInput',
      id: 'repeatActionsOnInput',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.routeToDialedNumber'),
      value: 5,
      name: 'routeToDialed',
      id: 'routeToDialed',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.disconnect'),
      value: 6,
      name: 'disconnect',
      id: 'disconnect',
      isDisabled: false
    }, {
      label: $translate.instant('autoAttendant.routeToDialedMailbox'),
      value: 7,
      name: 'routeToDialedMailbox',
      id: 'routeToDialedMailbox',
      isDisabled: false
    }];

    vm.disconnectBusy = {
      label: $translate.instant('autoAttendant.disconnectBusy'),
      value: 'busy',
      name: 'radioBusy',
      id: 'radioBusy'
    };
    vm.disconnectTone = {
      label: $translate.instant('autoAttendant.disconnectTone'),
      value: 'reorder',
      name: 'radioTone',
      id: 'radioTone'
    };
    vm.disconnectNone = {
      label: $translate.instant('autoAttendant.disconnectNone'),
      value: 'none',
      name: 'radioNone',
      id: 'radioNone'
    };
    vm.disconnectDefault = 'reorder';

    vm.deleteMenu = deleteMenu;
    vm.addMenuOption = addMenuOption;
    vm.deleteMenuOption = deleteMenuOption;
    vm.copyMenuOption = copyMenuOption;
    vm.saveMenuOption = saveMenuOption;
    vm.closeMenuOption = closeMenuOption;

    /////////////////////

    function deleteMenu(menu) {
      if (angular.isUndefined(menu) || menu === null) {
        return;
      }

      AutoAttendantCeMenuModelService.deleteMenu(vm.aaModel.aaRecord, 'regularOpenActions', 'MENU_OPTION');
      vm.ui.optionMenu = undefined;
      vm.ui.showOptionMenu = false;
    }

    function addMenuOption() {

      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('configureMenuOption', '');
      menuEntry.isConfigured = false;
      menuEntry.isTouched = false;
      menuEntry.addAction(menuAction);
      menuEntry.setType("MENU_OPTION");
      vm.ui.optionMenu.addEntry(menuEntry);

    }

    function deleteMenuOption(menu, menuEntry) {
      var menuEntries = menu.entries;
      for (var i = 0; i < menuEntries.length; i++) {
        if (menuEntries[i] === menuEntry) {
          menuEntries.splice(i, 1);
          AutoAttendantCeMenuModelService.updateMenu(vm.aaModel.aaRecord, 'regularOpenActions', menu);
          break;
        }
      }
    }

    function copyMenuOption(menu, menuEntry) {
      vm.currentMenu = menu;
      vm.currentMenuEntry = menuEntry;

      vm.optionDialogMenuEntry = menuEntry.clone();

      vm.optionDialogMenuEntry.file = '';
      vm.optionDialogMenuEntry.number = '';
      vm.optionDialogMenuEntry.treatment = vm.disconnectDefault;
      if (menuEntry.actions[0].name === 'play') {
        vm.optionDialogMenuEntry.file = menuEntry.actions[0].value;
      } else if (menuEntry.actions[0].name === 'route' ||
        menuEntry.actions[0].name === 'routeToMailbox') {
        vm.optionDialogMenuEntry.number = menuEntry.actions[0].value;
      } else if (menuEntry.actions[0].name == 'disconnect') {
        vm.optionDialogMenuEntry.treatment = menuEntry.actions[0].value;
      }

      if (menuEntry.getType() === 'MENU_OPTION_ANNOUNCEMENT') {
        vm.showKey = false;
        vm.showPlay = true;
        vm.showActionDescription = true;
        vm.optionMenuEntryActions = vm.optionMenuInputActions;
        vm.selectedAction = vm.optionMenuEntryActions[0];
      } else if (menuEntry.getType() === 'MENU_OPTION_DEFAULT') {
        vm.showKey = false;
        vm.showPlay = false;
        vm.showActionDescription = true;
        vm.optionMenuEntryActions = vm.optionMenuDefaultActions;
        if (vm.optionDialogMenuEntry.actions[0].getName() === 'route') {
          vm.selectedAction = vm.optionMenuEntryActions[0];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'repeatActionsOnInput') {
          vm.selectedAction = vm.optionMenuEntryActions[1];
        } else {
          vm.selectedAction = '';
        }
      } else if (menuEntry.getType() === 'MENU_OPTION_TIMEOUT') {
        vm.showKey = false;
        vm.showPlay = false;
        vm.showActionDescription = true;
        vm.optionMenuEntryActions = vm.optionMenuDefaultActions;
        if (vm.optionDialogMenuEntry.actions[0].getName() === 'route') {
          vm.selectedAction = vm.optionMenuEntryActions[0];
        } else {
          vm.selectedAction = vm.optionMenuEntryActions[1];
        }
      } else {
        vm.showKey = true;
        vm.showPlay = false;
        vm.showActionDescription = false;
        vm.optionMenuEntryActions = vm.optionMenuInputActions;
        if (vm.optionDialogMenuEntry.actions[0].getName() === 'play') {
          vm.selectedAction = vm.optionMenuEntryActions[0];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'route') {
          vm.selectedAction = vm.optionMenuEntryActions[1];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'routeToMailbox') {
          vm.selectedAction = vm.optionMenuEntryActions[2];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'repeatActionsOnInput') {
          vm.selectedAction = vm.optionMenuEntryActions[3];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'routeToDialed') {
          vm.selectedAction = vm.optionMenuEntryActions[4];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'disconnect') {
          vm.selectedAction = vm.optionMenuEntryActions[5];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'routeToDialedMailbox') {
          vm.selectedAction = vm.optionMenuEntryActions[6];
        } else if (vm.optionDialogMenuEntry.actions[0].getName() === 'routeToCollectedNumber') {
          vm.selectedAction = vm.optionMenuEntryActions[7];
        } else {
          vm.selectedAction = '';
        }
        vm.selectedKey = vm.optionDialogMenuEntry.key;
      }

    }

    function closeMenuOption() {
      // mark touched for validation purposes
      vm.currentMenuEntry.isTouched = true;

      // additional code to handle stacked modals
      // keep scrolling enabled for main modal after closing this one
      $("#aaOptionMenuDialog").modal("hide");
      $("body").addClass("modal-open");
    }

    function saveMenuOption(dMenuEntry) {
      for (var attr in dMenuEntry) {
        vm.currentMenuEntry[attr] = angular.copy(dMenuEntry[attr]);
      }
      vm.currentMenuEntry.isConfigured = true;
      vm.currentMenuEntry.isTouched = true;

      if (dMenuEntry.type === 'MENU_OPTION_ANNOUNCEMENT') {
        vm.currentMenuEntry.actions[0].name = 'play';
        vm.currentMenuEntry.actions[0].value = dMenuEntry.file;
      } else if (dMenuEntry.type === 'MENU_OPTION_DEFAULT') {
        if (vm.selectedAction.value === 2) {
          vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
          vm.currentMenuEntry.actions[0].value = dMenuEntry.number;
        } else {
          vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
          vm.currentMenuEntry.actions[0].value = '';
        }
      } else if (dMenuEntry.type === 'MENU_OPTION_TIMEOUT') {
        if (vm.selectedAction.value === 2) {
          vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
          vm.currentMenuEntry.actions[0].value = dMenuEntry.number;
        } else {
          vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
          vm.currentMenuEntry.actions[0].value = '';
        }
      } else if (dMenuEntry.type === 'MENU_OPTION') {
        vm.currentMenuEntry.key = vm.selectedKey;
        if (angular.isDefined(vm.selectedAction)) {
          //play
          if (vm.selectedAction.value === 1) {
            vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
            vm.currentMenuEntry.actions[0].value = dMenuEntry.file;
            //route
          } else if (vm.selectedAction.value === 2 || vm.selectedAction.value === 3) {
            vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
            vm.currentMenuEntry.actions[0].value = dMenuEntry.number;
            // disconnect
          } else {
            vm.currentMenuEntry.actions[0].name = vm.selectedAction.name;
            vm.currentMenuEntry.actions[0].value = dMenuEntry.treatment;
          }
        }
      }

      AutoAttendantCeMenuModelService.updateMenu(vm.aaModel.aaRecord, 'regularOpenActions', vm.currentMenu);
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = $scope.aa.modal;
    }

    activate();
  }
})();
