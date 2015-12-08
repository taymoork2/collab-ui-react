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
    vm.isMenuKey = false;

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
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), "label");
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

      if (vm.isMenuHeader) {
        // set values to be used for service invalid/timeout messages
        vm.menuEntry.headers[0].setLanguage(AALanguageService.getLanguageCode(vm.languageOption));
        vm.menuEntry.headers[0].setVoice(vm.voiceOption.value);

        // set values for any say messages mapped to phone menu keys
        if (vm.menuEntry.entries) {
          _.each(vm.menuEntry.entries, function (entry) {
            if (entry.name && entry.name === 'say') {
              entry.voice = vm.voiceOption.value;
            }
          });
        }
      }
    }

    function getNewMenuEntry() {
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var sayAction = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
      menuEntry.addAction(sayAction);
      return menuEntry;
    }

    function setActionEntry() {
      if (vm.isMenuHeader) {
        // say message as phone menu header
        _.find(vm.menuEntry.headers, function (header) {
          if (header.type && header.type === "MENU_OPTION_ANNOUNCEMENT") {
            if (angular.isDefined(header.actions) && header.actions.length > 0) {
              vm.actionEntry = header.actions[0];
              return;
            }
          }
        });

       if (!vm.actionEntry || vm.actionEntry.name != 'say') {
         var headerEntry = getNewMenuEntry();
         headerEntry.setType("MENU_OPTION_ANNOUNCEMENT");
         vm.menuEntry.headers.push(headerEntry);

         vm.actionEntry = headerEntry.actions[0];
       }
     } else if (vm.isMenuKey) {
        // say message mapped to phone menu key
        if (vm.menuEntry.entries.length > vm.menuKeyIndex && vm.menuEntry.entries[$scope.menuKeyIndex]) {

          vm.actionEntry = vm.menuEntry.entries[$scope.menuKeyIndex];
        } else {
          vm.menuEntry.entries[0] = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry('say', '');
          action.setVoice(vm.menuEntry.headers[0].getVoice());
          vm.menuEntry.entries[0].addAction(action);
          vm.actionEntry = action;
        }

      } else {
        // say message as top level action
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

      if ($scope.menuKeyIndex && $scope.menuKeyIndex > 0) {
        vm.isMenuKey = true;
      }

      setActionEntry();
      populateUiModel();

    }

    activate();

  }
})();
