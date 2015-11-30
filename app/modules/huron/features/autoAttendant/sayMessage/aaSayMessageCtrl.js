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
    var selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');

    vm.menuEntry = {};
    vm.actionEntry = {};
    vm.isMenuHeader = false;

    vm.messageInput = messageInput;
    vm.messageInputPlaceholder = $translate.instant('autoAttendant.sayMessagePlaceholder');

    vm.languageOption = languageOption;
    vm.languagePlaceholder = selectPlaceholder;
    vm.languageOptions = [];

    vm.voiceOption = voiceOption;
    vm.voiceBackup = voiceOption;
    vm.voicePlaceholder = selectPlaceholder;
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
      vm.messageInput = vm.actionEntry.getValue();
      vm.languageOptions = AALanguageService.getLanguageOptions();

      vm.voiceOption = AALanguageService.getVoiceOption(vm.actionEntry.getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.actionEntry.getVoice());
      vm.voiceBackup = vm.voiceOption;
      setVoiceOptions();
    }

    function saveUiModel() {
      vm.actionEntry.setValue(vm.messageInput);
      vm.actionEntry.setVoice(vm.voiceOption.value);
      vm.voiceBackup = vm.voiceOption;

      if (vm.isMenuHeader) {
        // also set values to be used for service invalid/timeout messages
        vm.menuEntry.headers[0].setLanguage(AALanguageService.getLanguageCode(vm.languageOption));
        vm.menuEntry.headers[0].setVoice(vm.voiceOption.value);
      }
    }

    function setActionEntry() {
      if (vm.isMenuHeader) {
        for (var k = 0; k < vm.menuEntry.headers.length; k++) {
          var header = vm.menuEntry.headers[k];
          if (angular.isDefined(header.actions) && header.actions.length > 0) {
            if (header.type === "MENU_OPTION_ANNOUNCEMENT") {
              vm.actionEntry = header.actions[0];
              break;
            }
          }
        }

        if (vm.actionEntry.name != 'say') {
          var headerEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          headerEntry.setType("MENU_OPTION_ANNOUNCEMENT");
          var headerSayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
          headerEntry.addAction(headerSayAction);
          vm.menuEntry.headers.push(headerEntry);
          vm.actionEntry = headerSayAction;
        }

      } else {
        if (vm.menuEntry.actions.length === 0) {
          var sayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
          vm.menuEntry.addAction(sayAction);
        }
        vm.actionEntry = vm.menuEntry.actions[0];
      }
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];

      if ($scope.isMenuHeader) {
        vm.isMenuHeader = $scope.isMenuHeader;
      }

      setActionEntry();
      populateUiModel();

    }

    activate();

  }
})();
