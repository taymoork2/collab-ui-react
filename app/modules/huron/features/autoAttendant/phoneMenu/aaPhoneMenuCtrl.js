(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAPhoneMenuCtrl', AAPhoneMenuCtrl);

  function KeyAction() {
    this.key = '';
    this.name = '';
    this.value = '';
    this.keys = [];
  }

  /* @ngInject */
  function AAPhoneMenuCtrl($scope, $translate, $filter, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService) {

    var vm = this;
    vm.sayMessage = '';
    vm.language = '';
    vm.voice = '';
    vm.selectPlaceholder = $translate.instant('autoAttendant.sayMessageSelectPlaceholder');
    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');
    vm.keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
    vm.selectedActions = [];
    vm.selectedTimeout = {
      name: '',
      value: ''
    };
    vm.menuEntry = {};

    vm.addKeyAction = addKeyAction;
    vm.deleteKeyAction = deleteKeyAction;
    vm.keyChanged = keyChanged;
    vm.keyActionChanged = keyActionChanged;
    vm.timeoutActionChanged = timeoutActionChanged;
    vm.saveUIModel = saveUIModel;
    vm.populateOptionMenu = populateOptionMenu;

    vm.timeoutActions = [{
      label: $translate.instant('autoAttendant.phoneMenuContinue'),
      name: 'phoneMenuContinue',
      action: 'repeatActionsOnInput',
      value: 1
    }, {
      label: $translate.instant('autoAttendant.repeatMenu'),
      name: 'repeatMenu',
      action: 'repeatActionsOnInput',
      value: 2,
      childOptions: vm.repeatOptions
    }];

    vm.repeatOptions = [{
      label: $translate.instant('autoAttendant.phoneMenuRepeatOnce'),
      name: 'phoneMenuRepeatOnce',
      value: 2
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatTwice'),
      name: 'phoneMenuRepeatTwice',
      value: 3
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatThree'),
      name: 'phoneMenuRepeatThree',
      value: 4
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatFour'),
      name: 'phoneMenuRepeatFour',
      value: 5
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatFive'),
      name: 'phoneMenuRepeatFive',
      value: 6
    }];

    vm.keyActions = [{
      label: $translate.instant('autoAttendant.phoneMenuPlaySubmenu'),
      name: 'phoneMenuPlaySubmenu',
      action: 'runActionsOnInput',
      inputType: 1
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRepeatMenu'),
      name: 'phoneMenuRepeatMenu',
      action: 'repeatActionsOnInput'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuDialExt'),
      name: 'phoneMenuDialExt',
      action: 'runActionsOnInput',
      inputType: '2'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      name: 'phoneMenuRouteUser',
      action: 'TBD'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      name: 'phoneMenuRouteHunt',
      action: 'routeToHuntGroup'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      name: 'phoneMenuRouteVM',
      action: 'TBD'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      name: 'phoneMenuRouteAA',
      action: 'goto'
    }];

    function findTimeoutAction(name) {
      for (var i = 0; i < vm.timeoutActions.length; i++) {
        if (vm.timeoutActions[i].name === name) {
          return vm.timeoutActions[i];
        }
      }
    }

    function findKeyAction(name) {
      for (var i = 0; i < vm.keyActions.length; i++) {
        if (vm.keyActions[i].name === name) {
          return vm.keyActions[i];
        }
      }
    }

    function addKeyAction() {
      var keyAction = new KeyAction();
      keyAction.keys = getAvailableKeys('');
      vm.selectedActions.push(keyAction);
    }

    function deleteKeyAction(index) {
      vm.selectedActions.splice(index, 1);
      saveUIModel();
    }

    function keyChanged(index, keyValue) {
      vm.selectedActions[index].key = keyValue;
      saveUIModel();
    }

    function keyActionChanged(index, keyAction) {
      vm.selectedActions[index].value = keyAction;
      saveUIModel();
    }

    function timeoutActionChanged() {
      var timeout = findTimeoutAction(vm.selectedTimeout.name);
      if (timeout) {
        vm.selectedTimeout.value = timeout.value;
        saveUIModel();
      }
    }

    function getAvailableKeys(selectedKey) {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var availableKeys = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === selectedKey) {
          availableKeys.push(key);
          continue;
        }
        var keyInUse = false;
        for (var j = 0; j < vm.selectedActions.length; j++) {
          var actionKey = vm.selectedActions[j].key;
          if (key === actionKey) {
            keyInUse = true;
            break;
          }
        }
        if (!keyInUse) {
          availableKeys.push(key);
        }
      }

      return availableKeys;
    }

    function setAvailableKeys() {
      for (var x = 0; x < vm.selectedActions.length; x++) {
        var selectedAction = vm.selectedActions[x];
        selectedAction.keys = getAvailableKeys(selectedAction.key);
      }
    }

    function saveUIModel() {
      var entry = vm.menuEntry;
      if (entry.type == "MENU_OPTION") {
        entry.attempts = vm.selectedTimeout.value;
        //TODO set language and voice here
        entry.entries = [];
        for (var j = 0; j < vm.selectedActions.length; j++) {
          var selectedAction = vm.selectedActions[j];
          var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          keyEntry.type = "MENU_OPTION";
          var keyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
          var action = findKeyAction(selectedAction.name);
          if (angular.isDefined(action) && selectedAction.key !== '') {
            keyAction.name = action.action;
            keyAction.value = selectedAction.value;
            if (angular.isDefined(action.inputType)) {
              keyAction.inputType = action.inputType;
            }
            keyEntry.key = selectedAction.key;
            keyEntry.description = selectedAction.name;
            keyEntry.addAction(keyAction);
            entry.entries.push(keyEntry);
          }
        }
        setAvailableKeys();
        for (var k = 0; k < entry.headers.length; k++) {
          var header = entry.headers[k];
          if (angular.isDefined(header.actions) && header.actions.length > 0) {
            var headerAction = header.actions[0];
            if (header.type == "MENU_OPTION_ANNOUNCEMENT") {
              headerAction.value = vm.sayMessage;
            }
          }
        }
      }
    }

    function populateOptionMenu() {
      // populate with data from an existing AA
      var entry = vm.menuEntry;
      if (entry.type == "MENU_OPTION") {
        if (angular.isDefined(entry.attempts)) {
          vm.selectedTimeout.value = entry.attempts;
          if (entry.attempts === 1) {
            vm.selectedTimeout.name = 'phoneMenuContinue';
          } else {
            vm.selectedTimeout.name = 'repeatMenu';
          }
        }
        var entries = entry.entries;
        var headers = entry.headers;
        if (entries.length > 0) {
          for (var j = 0; j < entries.length; j++) {
            var menuEntry = entries[j];
            if (menuEntry.actions.length == 1 && menuEntry.type == "MENU_OPTION") {
              var keyAction = new KeyAction();
              keyAction.key = menuEntry.key;
              keyAction.name = menuEntry.description;
              keyAction.value = menuEntry.actions[0].value;
              vm.selectedActions.push(keyAction);
            }
          }
        }
        setAvailableKeys();
        for (var k = 0; k < headers.length; k++) {
          var header = headers[k];
          if (header.actions.length == 1) {
            var action = header.actions[0];
            if (header.type == "MENU_OPTION_ANNOUNCEMENT") {
              vm.sayMessage = action.value;
            }
          }
        }
      }
    }

    function createOptionMenu() {
      // we're adding a new AA so create the CeMenu
      var menu = AutoAttendantCeMenuModelService.newCeMenu();
      menu.type = 'MENU_OPTION';
      vm.entries[$scope.index] = menu;

      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
      keyEntry.addAction(emptyAction);
      menu.entries.push(keyEntry);

      var annc = AutoAttendantCeMenuModelService.newCeMenuEntry();
      annc.type = "MENU_OPTION_ANNOUNCEMENT";
      var anncAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
      annc.addAction(anncAction);
      menu.headers.push(annc);
    }

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[vm.schedule];
      vm.entries = vm.uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];

      if (vm.menuEntry.type === '') {
        createOptionMenu();
      } else if (vm.menuEntry.type === 'MENU_OPTION') {
        populateOptionMenu();
      }
    }

    activate();
  }
})();
