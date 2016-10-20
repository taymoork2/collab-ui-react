(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADialByExtCtrl', AADialByExtCtrl);

  /* @ngInject */
  function AADialByExtCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AALanguageService) {
    var vm = this;

    var runActionName = 'runActionsOnInput';

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
    vm.messageInput = '';
    vm.messageInputPlaceholder = $translate.instant('autoAttendant.sayMessagePlaceholder');
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

    vm.isMediaUploadToggle = isMediaUploadToggle;

    /////////////////////

    function isMediaUploadToggle() {
      return AACommonService.isMediaUploadToggle();
    }

    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), 'label');
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

    function getMessageLabel() {
      return 'autoAttendant.sayMessage';
    }

    function populateUiModel() {
      var action = vm.menuEntry.actions[0];
      // isMediaUpload not in use? No messageType directive used. Save here.

      if (!isMediaUploadToggle()) {

        vm.messageInput = action.getValue();

        if (vm.isTextOnly) {
          return;
        }

      }

      if (isMediaUploadToggle() && vm.isTextOnly) {
        vm.messageInput = action.getValue();
      }
      vm.languageOptions = _.sortBy(AALanguageService.getLanguageOptions(), 'label');

      vm.voiceOption = AALanguageService.getVoiceOption(vm.menuEntry.getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.menuEntry.getVoice());
      vm.voiceBackup = vm.voiceOption;
      setVoiceOptions();

    }

    function saveUiModel() {

      // if mediaUpload toggled messageInput is handled in the directive..
      if (!isMediaUploadToggle() || vm.isTextOnly) {
        vm.menuEntry.actions[0].setValue(vm.messageInput);
      }

      if (!vm.isTextOnly) {
        vm.menuEntry.actions[0].voice = vm.voiceOption.value;
        vm.menuEntry.actions[0].language = vm.languageOption.value;
      }

      AACommonService.setDialByExtensionStatus(true);

    }

    function setActionMinMax(action) {
      action.minNumberOfCharacters = 0;
      action.maxNumberOfCharacters = 0;
    }

    function setPhoneMenuMinMaxEntry() {
      var action = vm.menuEntry.actions[0];
      if (angular.isUndefined(action.minNumberOfCharacters)) {
        setActionMinMax(action);
      }
    }

    function setActionEntry() {
      if (vm.menuEntry.actions.length === 0) {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry(runActionName, '');
        action.inputType = 2;

        setActionMinMax(action);

        vm.menuEntry.addAction(action);

      } else {
        // Should not happen, but make sure action is runActionsOnInput not AA, User, extNum, etc
        if (!(vm.menuEntry.actions[0].getName() === runActionName)) {
          vm.menuEntry.actions[0].setName(runActionName);
          vm.menuEntry.actions[0].setValue('');
          vm.menuEntry.actions[0].inputType = 2;
          setActionMinMax(vm.menuEntry.actions[0]);
        } // else let saved value be used
      }
    }

    function activate() {
      if ($scope.menuKeyIndex) {
        // called from phone menu, no support for lang/voice/timeout
        var uiPhoneMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        vm.isTextOnly = true;

        // Read an existing dialByExt entry if exist or initialize it if not
        if ($scope.menuKeyIndex < uiPhoneMenu.entries.length) {
          vm.menuEntry = uiPhoneMenu.entries[$scope.menuKeyIndex];
        } else {
          vm.menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(runActionName, '');
          vm.menuEntry.addAction(action);
        }
        setPhoneMenuMinMaxEntry();

      } else {
        var uiModel = AAUiModelService.getUiModel();
        var uiCombinedMenu = uiModel[$scope.schedule];
        vm.menuEntry = uiCombinedMenu.entries[$scope.index];
        setActionEntry();
      }

      populateUiModel();

    }

    activate();

  }
})();
