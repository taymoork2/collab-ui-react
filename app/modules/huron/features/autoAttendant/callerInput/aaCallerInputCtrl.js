(function () {
  'use strict';

  angular
  .module('uc.autoattendant')
  .controller('AACallerInputCtrl', AACallerInputCtrl);

  /* @ngInject */

  function AACallerInputCtrl($scope, $translate, CustomVariableService, AAModelService, AAUiModelService, AutoAttendantCeMenuModelService, AALanguageService, AACommonService) {

    var vm = this;

    var myId;

    var sessionVarOptions = [];
    var schedules = ['openHours', 'closedHours', 'Holidays'];

    var languageOption = {
      label: '',
      value: '',
    };

    var voiceOption = {
      label: '',
      value: '',
    };

    var runActionName = 'runActionsOnInput';

    var properties = {
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

    var ui;

    vm.maxLengthOptions = [];
    vm.maxStringLength = INPUT_DIGIT_MAX_DEFAULT;
    vm.maxVariableLength = 16;
    vm.minVariableLength = 3;

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
    vm.saveVoiceOption = saveVoiceOption;
    vm.saveNameInput = saveNameInput;


    vm.addKeyAction = addKeyAction;
    vm.deleteKeyAction = deleteKeyAction;
    vm.keyChanged = keyChanged;
    vm.keyInputChanged = keyInputChanged;
    vm.setType = setType;
    vm.setMaxStringLength = setMaxStringLength;

    vm.nameInput = '';

    vm.validationMsgs = {
      maxlength: $translate.instant('autoAttendant.callerInputVariableTooLongMsg'),
      minlength: $translate.instant('autoAttendant.callerInputVariableTooShortMsg'),
      required: $translate.instant('autoAttendant.callerInputVariableRequiredMsg'),
    };

    vm.isWarn = false;

    /////////////////////
    // the user has pressed the trash can icon for a key/action pair
    function deleteKeyAction(index) {
      vm.inputActions.splice(index, 1);

      setAvailableKeys();

      AACommonService.setCallerInputStatus(true);

    }
    // the user has changed the key for an existing action
    function keyChanged(index, whichKey) {
      vm.inputActions[index].key = whichKey;
      setAvailableKeys();
      AACommonService.setCallerInputStatus(true);

    }
    //the user enteres a char into the key input area
    function keyInputChanged(keyIndex, whichKey) {
      vm.inputActions[keyIndex].value = whichKey.value;

      AACommonService.setCallerInputStatus(true);

    }

    function addKeyAction() {
      var keyAction = new KeyAction();

      keyAction.keys = getAvailableKeys('');

      keyAction.key = _.head(keyAction.keys);

      vm.inputActions.push(keyAction);

      setAvailableKeys();
      AACommonService.setCallerInputStatus(true);

    }

    // determine which keys are still available.
    // selectedKey: a key we want to force into the available list. this is
    // needed because when the user is changing a key we want to show the
    // current key as available even though the model thinks it's in use.

    function getAvailableKeys(selectedKey) {
      return AACommonService.keyActionAvailable(selectedKey, vm.inputActions);
    }
    function setType() {
      vm.actionEntry.inputType = vm.convertDigitState ? AACommonService.DIGITS_CHOICE : AACommonService.DIGITS_RAW;
      AACommonService.setCallerInputStatus(true);
    }

    function setMaxStringLength() {
      vm.actionEntry.maxNumberOfCharacters = vm.maxStringLength;
      AACommonService.setCallerInputStatus(true);
    }

    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), properties.LABEL);
      setVoiceOption();
      vm.menuEntry.actions[0].language = vm.languageOption.value;
      AACommonService.setCallerInputStatus(true);
    }

    function setVoiceOption() {
      if (vm.voiceBackup && _.find(vm.voiceOptions, {
        "value": vm.voiceBackup.value,
      })) {
        vm.voiceOption = vm.voiceBackup;
      } else if (_.find(vm.voiceOptions, AALanguageService.getVoiceOption())) {
        vm.voiceOption = AALanguageService.getVoiceOption();
      } else {
        vm.voiceOption = vm.voiceOptions[0];
      }
      saveVoiceOption();
    }

    function saveVoiceOption() {
      vm.menuEntry.actions[0].voice = vm.voiceOption.value;
      AACommonService.setCallerInputStatus(true);
    }

    /*
    * Update voice option in the menu's say-message keys, menu's submenus and its
    * say-message keys.
    */
    function saveNameInput() {

      // if invalid (from html, too short or too long nameInput is undefined
      AACommonService.setIsValid(myId, vm.nameInput);

      vm.actionEntry.variableName = vm.nameInput;

      if (!vm.nameInput) {
        // don't bother with undefined for warnings as other lanes could have invalid inputs also
        return;
      }
      vm.isWarn = !_.isUndefined(sessionVarOptions[vm.nameInput]);

      if (!vm.isWarn) {
        vm.isWarn = collectThisCeVarName(ui).filter(function (value) {
          return _.isEqual(value, vm.nameInput);
        }).length > 1;
      }

      AACommonService.setCallerInputStatus(true);

    }

    function createCallerInputAction() {
      var action = AutoAttendantCeMenuModelService.newCeActionEntry(runActionName, '');

      setActionMinMax(action);

      action.inputType = vm.convertDigitState ? AACommonService.DIGITS_CHOICE : AACommonService.DIGITS_RAW;
      action.inputActions = [];

      action.maxNumberOfCharacters = INPUT_DIGIT_MAX_DEFAULT;
      action.variableName = '';

      return action;

    }

    function getAction(menuEntry) {
      var action;

      action = _.get(menuEntry, 'actions[0]');

      if (_.get(action, 'name', '') === runActionName) {
        return action;
      }

      return undefined;

    }

    function setActionMinMax(action) {
      action.minNumberOfCharacters = 0;
      action.maxNumberOfCharacters = 0;
    }

    function setActionEntry(ui) {
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
      var action = getAction(vm.menuEntry);
      if (!action) {
        action = createCallerInputAction();
        vm.menuEntry.addAction(action);
      }

      vm.actionEntry = action;
    }

    function populateMenu() {

      vm.nameInput = vm.actionEntry.variableName;

      // make it look like 1..20, drop the starting zero
      vm.maxLengthOptions = _.drop(_.times(INPUT_DIGIT_MAX_LENGTH + 1), 1);

      vm.maxStringLength = vm.actionEntry.maxNumberOfCharacters;

      vm.convertDigitState = vm.actionEntry.inputType === AACommonService.DIGITS_CHOICE;

      // if coming back as type 3, DIGITS_RAW, there is no inputActions defined
      if (_.has(vm.actionEntry, 'inputActions')) {
        vm.inputActions = vm.actionEntry.inputActions;
      } else {
        // type 3, make sure is defined if they click for type4
        vm.inputActions = vm.actionEntry.inputActions = [];
      }

      vm.languageOptions = _.sortBy(AALanguageService.getLanguageOptions(), properties.LABEL);

      vm.voiceOption = AALanguageService.getVoiceOption(vm.actionEntry.getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.actionEntry.getVoice());

      vm.voiceBackup = vm.voiceOption;

      setVoiceOptions();

      // remove keys that are in use from the selection widget
      setAvailableKeys();

      AACommonService.setCallerInputStatus(false);

    }
    // update the list of available keys for each action
    function setAvailableKeys() {
      for (var x = 0; x < vm.inputActions.length; x++) {
        var selectedAction = vm.inputActions[x];
        selectedAction.keys = getAvailableKeys(selectedAction.key);
      }
    }
    function getSessionVariables(ceId) {
      // round up all variables except those of this CallerInput
      return CustomVariableService.listCustomVariables(ceId)
        .then(function (data) {
          _.forEach(data, function (entry) {
            // if it is our Ce and the custom variable for this CallerInput, ignore.
            // handle when model is scanned in saveNameInput()

            if (_.isEqual(entry.ce_id, ceId)) {
              return;
            }
            _.forEach(entry.var_name, function (customVar) {
              sessionVarOptions[customVar] = [];
              sessionVarOptions[customVar].push(entry.ce_id);
            });
          });
        });
    }

    function collectVarNames(entry, varNames) {
      _.forEach(entry, function (value, key) {
        if (_.isArray(value)) {
          _.forEach(value, function (nowEntry) {
            return collectVarNames(nowEntry, varNames);
          });
        }
        if (key === 'variableName') {
          varNames.push(value);
        }
        if (AutoAttendantCeMenuModelService.isCeMenuEntry(value)) {
          return collectVarNames(value, varNames);
        }
      });
      return varNames;

    }
    function collectThisCeVarName(ui) {
      var varNames = [];
      // collect all Var names used in the Ce except for this screen

      _.forEach(schedules, function (schedule) {
        varNames = collectVarNames(ui[schedule], varNames);
      });

      return varNames;

    }

    function activate() {
      myId = $scope.schedule + "-" + $scope.index + "-" + AACommonService.getUniqueId();

      ui = AAUiModelService.getUiModel();

      setActionEntry(ui);

      getSessionVariables(AAModelService.getAAModel().aaRecordUUID).finally(function () {
        populateMenu();
      });
    }

    activate();

  }
})();
