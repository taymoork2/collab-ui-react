(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAPhoneMenuCtrl', AAPhoneMenuCtrl);

  function KeyAction() {
    this.key = '';
    this.value = '';
    this.keys = [];
    this.action = {
      name: '',
      label: ''
    };
  }

  /* @ngInject */
  function AAPhoneMenuCtrl($scope, $translate, $filter, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService, Config) {

    var vm = this;
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
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
    vm.populateOptionMenu = populateOptionMenu;
    vm.createOptionMenu = createOptionMenu;

    // TBD means the action isn't supported in the backend yet
    /**
     * This include the list of feature which are production ready.
     * Adding option here lets it be visible in production. If option is not production ready
     * add it under function addAvailableFeature.
     */
    vm.keyActions = [
      // {
      //   label: $translate.instant('autoAttendant.phoneMenuPlaySubmenu'),
      //   name: 'phoneMenuPlaySubmenu',
      //   action: 'runActionsOnInput',
      //   inputType: 1
      // },
      {
        label: $translate.instant('autoAttendant.phoneMenuRepeatMenu'),
        name: 'phoneMenuRepeatMenu',
        action: 'repeatActionsOnInput'
      }, {
        label: $translate.instant('autoAttendant.actionSayMessage'),
        name: 'phoneMenuSayMessage',
        action: 'say'
      }, {
        label: $translate.instant('autoAttendant.phoneMenuDialExt'),
        name: 'phoneMenuDialExt',
        action: 'runActionsOnInput',
        inputType: 2
      }, {
        label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
        name: 'phoneMenuRouteHunt',
        action: 'routeToHuntGroup'
      }, {
        label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
        name: 'phoneMenuRouteAA',
        action: 'goto'
      }, {
        label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
        name: 'phoneMenuRouteUser',
        action: 'routeToUser'
      }, {
        label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
        name: 'phoneMenuRouteMailbox',
        action: 'routeToVoiceMail'
      }, {
        label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
        name: 'phoneMenuRouteToExtNum',
        action: 'route'
      }
    ];

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
      keyAction.key = _.head(keyAction.keys);
      vm.selectedActions.push(keyAction);

      // update global UI Model
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var action = AutoAttendantCeMenuModelService.newCeActionEntry('', '');
      menuEntry.addAction(action);
      menuEntry.setType('MENU_OPTION');
      menuEntry.key = keyAction.key;
      vm.menuEntry.entries.push(menuEntry);

      // remove key that is in use from creating the new key entry
      setAvailableKeys();
      setPhonemenuFormDirty();
    }

    // the user has pressed the trash can icon for a key/action pair
    function deleteKeyAction(index) {
      vm.selectedActions.splice(index, 1);
      vm.menuEntry.entries.splice(index, 1);
      setAvailableKeys();
      setPhonemenuFormDirty();
    }

    // the user has changed the key for an existing action
    function keyChanged(index, keyValue) {
      vm.selectedActions[index].key = keyValue;
      vm.menuEntry.entries[index].key = keyValue;
      setAvailableKeys();
      setPhonemenuFormDirty();
    }

    // the user has changed the action for an existing key
    function keyActionChanged(index, keyAction) {
      var _keyAction = findKeyAction(keyAction.name);
      if (angular.isDefined(_keyAction)) {
        var phoneMenuEntry = vm.menuEntry.entries[index];
        // Phone menu option now could have multiple actions in it, e.g., say message.
        // When switching between phone menu options, clear the actions array to
        // make sure no old option data are carried over to the new option.
        phoneMenuEntry.actions = [];
        phoneMenuEntry.actions[0] = AutoAttendantCeMenuModelService.newCeActionEntry('', '');
        var action = phoneMenuEntry.actions[0];
        action.name = keyAction.action;
        if (angular.isDefined(_keyAction.inputType)) {
          // some action names are overloaded and are distinguished
          // by inputType
          action.inputType = _keyAction.inputType;
        }
        setPhonemenuFormDirty();
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

    function populateOptionMenu() {
      // populate with data from an existing AA
      var entry = vm.menuEntry;

      if (entry.type == "MENU_OPTION") {

        var entries = entry.entries;
        if (entries.length > 0) {
          // add the key/action pairs
          for (var j = 0; j < entries.length; j++) {
            var menuEntry = entries[j];

            if (menuEntry.actions.length > 0 && menuEntry.type == "MENU_OPTION") {
              var keyAction = new KeyAction();
              keyAction.key = menuEntry.key;
              if (angular.isDefined(menuEntry.actions[0].name) && menuEntry.actions[0].name.length > 0) {
                keyAction.action = _.find(vm.keyActions, function (keyAction) {
                  return this === keyAction.action;
                }, menuEntry.actions[0].name);
              } else {
                keyAction.action = {};
                keyAction.action.name = "";
                keyAction.action.label = "";
              }
              vm.selectedActions.push(keyAction);
            }
          }
        }
        // remove keys that are in use from the selection widget
        setAvailableKeys();
      }
    }

    function createOptionMenu() {
      // we're adding a new AA so create the CeMenu
      var menu = AutoAttendantCeMenuModelService.newCeMenu();
      menu.type = 'MENU_OPTION';
      vm.entries[$scope.index] = menu;

      var keyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      keyEntry.type = "MENU_OPTION";
      keyEntry.key = _.head(getAvailableKeys(''));
      var emptyAction = AutoAttendantCeMenuModelService.newCeActionEntry();
      keyEntry.addAction(emptyAction);
      menu.entries.push(keyEntry);

      // remove key that is in use from creating the new key entry
      setAvailableKeys();
    }

    function setPhonemenuFormDirty() {
      AACommonService.setPhoneMenuStatus(true);
    }

    /**
     * This include the list of feature which are not production ready yet
     */
    function addAvailableFeatures() {
      if (Config.isDev() || Config.isIntegration()) {
        // push features here
        vm.keyActions.push({
          label: $translate.instant('autoAttendant.phoneMenuRouteQueue'),
          name: 'phoneMenuRouteQueue',
          action: 'routeToQueue'
        });

      }
    }

    /////////////////////

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[vm.schedule];
      vm.entries = vm.uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];
      addAvailableFeatures();
      vm.keyActions.sort(AACommonService.sortByProperty('name'));
      if (vm.menuEntry.type === '') {
        createOptionMenu();
      } else if (vm.menuEntry.type === 'MENU_OPTION') {
        populateOptionMenu();
      }
    }

    activate();
  }
})();
