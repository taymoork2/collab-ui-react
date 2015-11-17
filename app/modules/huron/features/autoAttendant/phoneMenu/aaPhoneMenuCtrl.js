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

    // TBD means the action isn't supported in the backend yet
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

    // search for a timeout action by its name
    function findTimeoutAction(name) {
      for (var i = 0; i < vm.timeoutActions.length; i++) {
        if (vm.timeoutActions[i].name === name) {
          return vm.timeoutActions[i];
        }
      }
    }

    // search for a key action by its name
    function findKeyAction(name) {
      for (var i = 0; i < vm.keyActions.length; i++) {
        if (vm.keyActions[i].name === name) {
          return vm.keyActions[i];
        }
      }
    }

    // the user has pressed "Add another input digit" to add a key/action pair
    function addKeyAction() {
      var keyAction = new KeyAction();
      keyAction.keys = getAvailableKeys('');
      vm.selectedActions.push(keyAction);
    }

    // the user has pressed the trash can icon for a key/action pair
    function deleteKeyAction(index) {
      vm.selectedActions.splice(index, 1);
      saveUIModel();
    }

    // the user has changed the key for an existing action
    function keyChanged(index, keyValue) {
      vm.selectedActions[index].key = keyValue;
      saveUIModel();
    }

    // the user has changed the action for an existing key
    function keyActionChanged(index, keyAction) {
      vm.selectedActions[index].value = keyAction;
      saveUIModel();
    }

    // the user has changed the timeout/invalid option
    function timeoutActionChanged() {
      var timeout = findTimeoutAction(vm.selectedTimeout.name);
      if (timeout) {
        vm.selectedTimeout.value = timeout.value;
        saveUIModel();
      }
    }

    // determine which keys are still available.
    // selectedKey: a key we want to force into the available list. this is
    // needed because when the user is changing a key we want to show the
    // current key as available even though the model thinks it's in use.
    function getAvailableKeys(selectedKey) {
      var keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'];
      var availableKeys = [];
      // for each key determine if it's in use by looping over all actions.
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === selectedKey) {
          // force this key to be in the available list
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
          // key is not in use to add to the available list
          availableKeys.push(key);
        }
      }

      return availableKeys;
    }

    // update the list of available keys for each action
    function setAvailableKeys() {
      for (var x = 0; x < vm.selectedActions.length; x++) {
        var selectedAction = vm.selectedActions[x];
        selectedAction.keys = getAvailableKeys(selectedAction.key);
      }
    }

    function saveUIModel() {
      var entry = vm.menuEntry;
      if (entry.type == "MENU_OPTION") {
        // this is number of times to repeat the timeout/invalid menu
        entry.attempts = vm.selectedTimeout.value;
        //TODO set language and voice here
        entry.entries = [];
        // add each key/action pair
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
              // some action names are overloaded and are distinguished
              // by inputType
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
          // the only header should be the Say Message announcement
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
          // both timeout options have the same action name so
          // we distinguish by the number of attempts allowed
          if (entry.attempts === 1) {
            vm.selectedTimeout.name = 'phoneMenuContinue';
          } else {
            vm.selectedTimeout.name = 'repeatMenu';
          }
        }
        var entries = entry.entries;
        var headers = entry.headers;
        if (entries.length > 0) {
          // add the key/action pairs
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
        // remove keys that are in use from the selection widget
        setAvailableKeys();
        // handle the Say Message announcement
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
