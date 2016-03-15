(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADialByExtCtrl', AADialByExtCtrl);

  /* @ngInject */
  function AADialByExtCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AALanguageService) {
    var vm = this;

    var label = 'label';

    var runActionName = 'runActionsOnInput';

    var messageInput = '';
    var languageOption = {
      label: '',
      value: ''
    };
    var voiceOption = {
      label: '',
      value: ''
    };

    var selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');

    vm.aaModel = {};
    vm.menuEntry = {};
    vm.messageInput = messageInput;
    vm.messageInputPlaceholder = $translate.instant('autoAttendant.sayMessagePlaceholder');

    vm.textAreaRows = "5";

    vm.languageOption = languageOption;
    vm.languagePlaceholder = selectPlaceholder;
    vm.languageOptions = [];

    vm.getMessageLabel = getMessageLabel;
    vm.voiceOption = voiceOption;
    vm.voiceBackup = voiceOption;
    vm.voicePlaceholder = selectPlaceholder;
    vm.voiceOptions = [];

    vm.setVoiceOptions = setVoiceOptions;

    vm.saveUiModel = saveUiModel;

    /////////////////////

    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), label);
      setVoiceOption();
    }

    function setVoiceOption() {
      if (vm.voiceBackup && _.findWhere(vm.voiceOptions, {
          "value": vm.voiceBackup.value
        })) {
        vm.voiceOption = vm.voiceBackup;
      } else if (_.findWhere(vm.voiceOptions, AALanguageService.getVoiceOption())) {
        vm.voiceOption = AALanguageService.getVoiceOption();
      } else {
        vm.voiceOption = vm.voiceOptions[0];
      }
    }

    function getMessageLabel() {
      return 'autoAttendant.sayMessage';
    }

    function populateUiModel() {
      var action = vm.menuEntry.actions[0];

      vm.messageInput = action.getValue();

      if (vm.isTextOnly) {
        return;
      }
      vm.languageOptions = AALanguageService.getLanguageOptions();

      vm.voiceOption = AALanguageService.getVoiceOption(vm.menuEntry.getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.menuEntry.getVoice());
      vm.voiceBackup = vm.voiceOption;
      setVoiceOptions();

    }

    function saveUiModel() {

      vm.menuEntry.actions[0].setValue(vm.messageInput);

      if (!vm.isTextOnly) {
        vm.menuEntry.actions[0].voice = vm.voiceOption.value;
        vm.menuEntry.actions[0].language = vm.languageOption.value;
      }

      AACommonService.setActionStatus(true);

    }

    function setActionEntry() {

      if (vm.menuEntry.actions.length === 0) {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry(runActionName, '');
        action.inputType = 2;
        vm.menuEntry.addAction(action);
      } else {
        // Should not happen, but make sure action is runActionsOnInput not AA, User, extNum, etc
        if (!(vm.menuEntry.actions[0].getName() === runActionName)) {
          vm.menuEntry.actions[0].setName(runActionName);
          vm.menuEntry.actions[0].setValue('');
          vm.menuEntry.actions[0].inputType = 2;
        } // else let saved value be used
      }
    }

    function activate() {

      var action;

      var uiModel = AAUiModelService.getUiModel();
      var uiCombinedMenu = uiModel[$scope.schedule];
      var uiPhoneMenu = uiCombinedMenu.entries[$scope.index];

      if ($scope.isTextOnly) {
        // called from phone menu, no support for lang/voice/timeout
        vm.isTextOnly = true;
        vm.textAreaRows = "4"; // 5 for larger Dial By extension screen, 4 for phone menu
        // Read an existing dialByExt entry if exist or initialize it if not
        if ($scope.keyIndex < uiPhoneMenu.entries.length) {
          vm.menuEntry = uiPhoneMenu.entries[$scope.keyIndex];
        } else {
          vm.menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          action = AutoAttendantCeMenuModelService.newCeActionEntry(runActionName, '');
          vm.menuEntry.addAction(action);
        }
      } else {
        vm.menuEntry = uiCombinedMenu.entries[$scope.index];

        setActionEntry();

      }

      populateUiModel();

    }

    activate();

  }
})();
