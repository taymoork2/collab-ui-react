(function () {
  'use strict';

  angular
  .module('uc.autoattendant')
  .controller('AACallerInputCtrl', AACallerInputCtrl);

  /* @ngInject */
  function AACallerInputCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AALanguageService, AACommonService) {

    var vm = this;

    var languageOption = {
      label: '',
      value: ''
    };

    var voiceOption = {
      label: '',
      value: ''
    };

    var properties = {
      NAME: ["play", "say"],
      REPEAT_NAME: "repeatActionsOnInput",
      LABEL: "label",
    };
    var selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    var INPUT_DIGIT_MAX_LENGTH = 20;
    var INPUT_DIGIT_MAX_DEFAULT = 16;

    function KeyAction() {
      this.key = '';
      this.value = '';
      this.keys = [];
    }

    vm.maxLengthOptions = [];
    vm.maxOptionLength = INPUT_DIGIT_MAX_DEFAULT;

    vm.menuEntry = {};
    vm.actionEntry = {};

    vm.languageOption = languageOption;
    vm.languagePlaceholder = selectPlaceholder;
    vm.languageOptions = [];

    vm.voiceOption = voiceOption;
    vm.voiceBackup = voiceOption;
    vm.voicePlaceholder = selectPlaceholder;
    vm.voiceOptions = [];
    vm.inputActions = [];
    vm.convertDigitState = false;
    vm.setVoiceOptions = setVoiceOptions;
    vm.saveUiModel = saveUiModel;
    vm.addKeyAction = addKeyAction;
    vm.deleteKeyAction = deleteKeyAction;
    vm.keyChanged = keyChanged;

    /////////////////////
    // the user has pressed the trash can icon for a key/action pair
    function deleteKeyAction(index) {
      vm.inputActions.splice(index, 1);
      setAvailableKeys();
      setCallerInputFormDirty();
    }
    // the user has changed the key for an existing action
    function keyChanged(index, keyValue) {
      vm.inputActions[index].key = keyValue;
      setAvailableKeys();
      setCallerInputFormDirty();
    }

    function setCallerInputFormDirty() {
      AACommonService.setCallerInputStatus(true);
    }

    function addKeyAction() {
      var keyAction = new KeyAction();

      keyAction.keys = getAvailableKeys('');

      keyAction.key = _.head(keyAction.keys);

      vm.inputActions.push(keyAction);

      setAvailableKeys();
    }

    // determine which keys are still available.
    // selectedKey: a key we want to force into the available list. this is
    // needed because when the user is changing a key we want to show the
    // current key as available even though the model thinks it's in use.

    function getAvailableKeys(selectedKey) {
      return AACommonService.keyActionAvailable(selectedKey, vm.inputActions);
    }

    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), properties.LABEL);
      setVoiceOption();
    }

    function setVoiceOption() {
      if (vm.voiceBackup && _.find(vm.voiceOptions, {
        "value": vm.voiceBackup.value
      })) {
        vm.voiceOption = vm.voiceBackup;
      } else if (_.find(vm.voiceOptions, AALanguageService.getVoiceOption())) {
        vm.voiceOption = AALanguageService.getVoiceOption();
      } else {
        vm.voiceOption = vm.voiceOptions[0];
      }
    }

    function populateUiModel() {
      vm.maxLengthOptions = _.drop(_.times(INPUT_DIGIT_MAX_LENGTH), 1);

      vm.languageOptions = _.sortBy(AALanguageService.getLanguageOptions(), properties.LABEL);

      vm.voiceOption = AALanguageService.getVoiceOption(vm.actionEntry.getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.actionEntry.getVoice());

      vm.voiceBackup = vm.voiceOption;
      setVoiceOptions();
    }

    /*
    * Update voice option in the menu's say-message keys, menu's submenus and its
    * say-message keys.
    */
    function saveUiModel() {
      vm.actionEntry.setVoice(vm.voiceOption.value);

    }

    function createAction(action) {
      return AutoAttendantCeMenuModelService.newCeActionEntry(action, '');
    }

    function getAction(menuEntry) {
      var action;
      // at this point in the development (UI only) there are no actions
      // this is a work in progress. Gets plumbed later

      action = _.get(menuEntry, 'actions[0]');

      if (action) {
        if (_.indexOf(properties.NAME, action.name) >= 0) {
          return action;
        }
      }

      return undefined;

    }
    function setActionEntry() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
      var action = getAction(vm.menuEntry);
      if (!action) {
        action = createAction('play'); //default is now play
        vm.menuEntry.addAction(action);
      }

      vm.actionEntry = action;

      return;
    }

    function populateOptionMenu() {

      // remove keys that are in use from the selection widget
      setAvailableKeys();
    }
    // update the list of available keys for each action
    function setAvailableKeys() {
      for (var x = 0; x < vm.inputActions.length; x++) {
        var selectedAction = vm.inputActions[x];
        selectedAction.keys = getAvailableKeys(selectedAction.key);
      }
    }

    function activate() {
      setActionEntry();
      populateUiModel();
      populateOptionMenu();
    }

    activate();
  }

})();
