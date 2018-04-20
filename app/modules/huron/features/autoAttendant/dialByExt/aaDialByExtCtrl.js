(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADialByExtCtrl', AADialByExtCtrl);

  /* @ngInject */
  function AADialByExtCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AALanguageService) {
    var vm = this;

    var runActionName = 'runActionsOnInput';
    var INPUT_TYPE_FOR_ESN = 5;
    var INPUT_TYPE_FOR_DIALBYEXT = 2;

    var languageOption = {
      label: '',
      value: '',
    };
    var voiceOption = {
      label: '',
      value: '',
    };

    var selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.selectRoutingPrefix = $translate.instant('autoAttendant.selectRoutingPrefix');
    vm.uniqueCtrlIdentifer = '';
    vm.aaModel = {};
    vm.menuEntry = {};
    vm.messageInput = '';
    vm.checkBoxDisplayed = false;
    vm.multiSiteState = false;
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

    vm.determineDialByExtensionStatus = determineDialByExtensionStatus;

    vm.saveUiModel = saveUiModel;

    vm.isMediaUploadToggle = isMediaUploadToggle;
    vm.isMultiSiteToggle = isMultiSiteToggle;

    /////////////////////

    function isMediaUploadToggle() {
      return AACommonService.isMediaUploadToggle();
    }

    function isMultiSiteToggle() {
      return AACommonService.isMultiSiteEnabled();
    }

    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), 'label');
      setVoiceOption();
    }

    function setVoiceOption() {
      if (vm.voiceBackup && _.find(vm.voiceOptions, {
        value: vm.voiceBackup.value,
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

      if (!_.isEmpty(vm.menuEntry.actions[0].routingPrefix)) {
        vm.multiSiteState = true;
        vm.selectedRoutingOption = vm.menuEntry.actions[0].routingPrefix;
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

    function setDialByExtensionStatusByRoutingOption(status) {
      AACommonService.setDialByExtensionStatus(status);
      AACommonService.setIsValid(vm.uniqueCtrlIdentifer, status);
    }

    function setRoutingPrefixByMultiSiteState() {
      if (vm.multiSiteState) {
        vm.menuEntry.actions[0].routingPrefix = vm.selectedRoutingOption;
      } else {
        vm.menuEntry.actions[0].routingPrefix = '';
      }
    }

    function determineDialByExtensionStatus() {
      setRoutingPrefixByMultiSiteState();
      if ((vm.multiSiteState) && (_.isEmpty(vm.menuEntry.actions[0].routingPrefix))) {
        setDialByExtensionStatusByRoutingOption(false);
      } else {
        setDialByExtensionStatusByRoutingOption(true);
      }
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
      setRoutingPrefixByMultiSiteState();
      setDialByExtensionStatusByRoutingOption(true);
    }

    function setActionMinMax(action) {
      action.minNumberOfCharacters = 0;
      action.maxNumberOfCharacters = 0;
    }

    function setPhoneMenuMinMaxEntry() {
      var action = vm.menuEntry.actions[0];
      if (_.isUndefined(action.minNumberOfCharacters)) {
        setActionMinMax(action);
      }
    }

    function setInputType(action) {
      if (isMultiSiteToggle()) {
        action.inputType = INPUT_TYPE_FOR_ESN;
      } else {
        action.inputType = INPUT_TYPE_FOR_DIALBYEXT;
      }
    }

    function setActionEntry() {
      if (vm.menuEntry.actions.length === 0) {
        var action = AutoAttendantCeMenuModelService.newCeActionEntry(runActionName, '');
        setInputType(action);

        setActionMinMax(action);

        vm.menuEntry.addAction(action);
      } else {
        // Should not happen, but make sure action is runActionsOnInput not AA, User, extNum, etc
        if (!(vm.menuEntry.actions[0].getName() === runActionName)) {
          vm.menuEntry.actions[0].setName(runActionName);
          vm.menuEntry.actions[0].setValue('');
          setInputType(vm.menuEntry.actions[0]);
          setActionMinMax(vm.menuEntry.actions[0]);
        } // else let saved value be used
      }
    }

    function setRoutingPrefixOptions(routingPrefixOptions) {
      if (_.gt(routingPrefixOptions.length, 1)) {
        vm.checkBoxDisplayed = true;
        vm.routingPrefixOptions = routingPrefixOptions;
      } else {
        vm.checkBoxDisplayed = false;
      }
    }

    function activate() {
      vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.index, AACommonService.getUniqueId());
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
        setRoutingPrefixOptions($scope.routingPrefixOptions);
        setInputType(vm.menuEntry.actions[0]);
        setPhoneMenuMinMaxEntry();
      } else {
        var uiModel = AAUiModelService.getUiModel();
        var uiCombinedMenu = uiModel[$scope.schedule];
        vm.menuEntry = uiCombinedMenu.entries[$scope.index];
        setRoutingPrefixOptions($scope.routingPrefixOptions);
        setActionEntry();
      }

      populateUiModel();
    }

    activate();
  }
})();
