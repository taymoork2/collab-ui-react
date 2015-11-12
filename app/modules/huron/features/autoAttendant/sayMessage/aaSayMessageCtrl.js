(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AASayMessageCtrl', AASayMessageCtrl);

  /* @ngInject */
  function AASayMessageCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AALanguageService) {

    var vm = this;
    var messageInput = '';
    var languageOption = {
      label: '',
      value: ''
    };
    var voiceOption = {
      label: '',
      value: ''
    };

    vm.uiMenu = {};
    vm.menuEntry = {};

    vm.messageInput = messageInput;
    vm.messageInputPlaceholder = $translate.instant('autoAttendant.sayMessagePlaceholder');

    vm.languageOption = languageOption;
    vm.languagePlaceholder = $translate.instant('autoAttendant.sayMessageSelectPlaceholder');
    vm.languageOptions = [];

    vm.voiceOption = voiceOption;
    vm.voiceBackup = voiceOption;
    vm.voicePlaceholder = $translate.instant('autoAttendant.sayMessageSelectPlaceholder');
    vm.voiceOptions = [];

    vm.setVoiceOptions = setVoiceOptions;
    vm.saveUiModel = saveUiModel;

    /////////////////////

    function setVoiceOptions() {
      vm.voiceOptions = AALanguageService.getVoiceOptions(vm.languageOption);

      if (vm.voiceBackup && _.findWhere(vm.voiceOptions, {
          "value": vm.voiceBackup.value
        })) {
        vm.voiceOption = vm.voiceBackup;
        return;
      }

      vm.voiceOption = {
        label: '',
        value: ''
      };
    }

    function populateUiModel() {
      if (vm.menuEntry.actions.length === 0) {
        var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
        vm.menuEntry.addAction(menuAction);
      }

      vm.messageInput = vm.menuEntry.actions[0].getValue();
      vm.languageOptions = AALanguageService.getLanguageOptions();

      vm.voiceOption = AALanguageService.getVoiceOption(vm.menuEntry.actions[0].getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.menuEntry.actions[0].getVoice());
      vm.voiceBackup = vm.voiceOption;
      setVoiceOptions();
    }

    function saveUiModel() {
      vm.menuEntry.actions[0].setValue(vm.messageInput);
      vm.menuEntry.actions[0].setVoice(vm.voiceOption.value);
      vm.voiceBackup = vm.voiceOption;

      // todo: phone menu support
      //if (vm.uiMenu.getType() === 'MENU_OPTIONS') {
      // if entry for language provided, save it in the menu header
      //vm.uiMenu.setLanguage(AALanguageService.getLanguageCode(vm.language));
      //}
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();

      // todo: handle any differences between WELCOME and OPTIONS menus
      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];

      populateUiModel();
    }

    activate();

  }
})();
