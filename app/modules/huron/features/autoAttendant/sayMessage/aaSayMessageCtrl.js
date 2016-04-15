(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AASayMessageCtrl', AASayMessageCtrl);

  /* @ngInject */
  function AASayMessageCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AALanguageService, AACommonService, Notification) {

    var vm = this;
    var properties = {
      NAME: "say",
      REPEAT_NAME: "repeatActionsOnInput",
      LABEL: "label",
      VALUE: "value",
      HEADER_TYPE: "MENU_OPTION_ANNOUNCEMENT"
    };
    var sayMessageType = {
      ACTION: 1,
      MENUHEADER: 2,
      MENUKEY: 3
    };

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
    vm.sayMessageType = sayMessageType.ACTION;

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
    vm.getFooter = getFooter;
    vm.getMessageLabel = getMessageLabel;
    vm.isMessageInputOnly = isMessageInputOnly;

    /////////////////////
    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), properties.LABEL);
      setVoiceOption();
    }

    function getFooter() {
      switch (vm.sayMessageType) {
      case sayMessageType.MENUKEY:
        return '';
      case sayMessageType.ACTION:
        return 'autoAttendant.sayMessageUninterrupt';
      case sayMessageType.MENUHEADER:
        return 'autoAttendant.phoneMenuListening';
      }
    }

    function getMessageLabel() {
      return 'autoAttendant.sayMessage';
    }

    function isMessageInputOnly() {
      switch (vm.sayMessageType) {
      case sayMessageType.MENUKEY:
        return true;
      case sayMessageType.ACTION:
      case sayMessageType.MENUHEADER:
        return false;
      }
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
      AACommonService.setSayMessageStatus(true);

      switch (vm.sayMessageType) {
      case sayMessageType.MENUHEADER:
        {
          // set values to be used for service invalid/timeout messages
          var header = getSayActionHeader(vm.menuEntry);
          header.setLanguage(AALanguageService.getLanguageCode(vm.languageOption));
          header.setVoice(vm.voiceOption.value);

          // set values for any say messages mapped to phone menu keys
          if (vm.menuEntry.entries) {
            _.each(vm.menuEntry.entries, function (entry) {
              var keyAction = getSayAction(entry);
              if (keyAction) {
                keyAction.setVoice(vm.voiceOption.value);
              }
            });
          }
          return;
        }
      case sayMessageType.MENUKEY:
        {
          // add the default repeat menu action as needed
          if (!getRepeatAction(vm.menuEntry.entries[$scope.menuKeyIndex])) {
            var repeatAction = AutoAttendantCeMenuModelService.newCeActionEntry(properties.REPEAT_NAME, '');
            vm.menuEntry.entries[$scope.menuKeyIndex].addAction(repeatAction);
          }
          return;
        }
      case sayMessageType.ACTION:
        // no special handling
      }
    }

    function createMenuEntry() {
      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      menuEntry.addAction(createSayAction());
      return menuEntry;
    }

    function createSayAction() {
      return AutoAttendantCeMenuModelService.newCeActionEntry(properties.NAME, '');
    }

    function getSayActionHeader(menuEntry) {
      if (menuEntry && menuEntry.headers && menuEntry.headers.length > 0) {
        var header = _.find(menuEntry.headers, function (header) {
          return header.type === properties.HEADER_TYPE;
        });
        return header;
      }
    }

    function getSayAction(menuEntry) {
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        var action = _.find(menuEntry.actions, function (action) {
          return action.name === properties.NAME;
        });
        return action;
      }
    }

    function getRepeatAction(menuEntry) {
      if (menuEntry && menuEntry.actions && menuEntry.actions.length > 0) {
        var action = _.find(menuEntry.actions, function (action) {
          return action.name === properties.REPEAT_NAME;
        });
        return action;
      }
    }

    function setActionEntry() {
      switch (vm.sayMessageType) {
      case sayMessageType.MENUHEADER:
        {
          var actionHeader = getSayActionHeader(vm.menuEntry);
          var action = getSayAction(actionHeader);
          if (action) {
            // existing say action from the existing header
            vm.actionEntry = action;
          } else {
            // reset the headers and add new entry with say action
            var headerEntry = createMenuEntry();
            headerEntry.setType(properties.HEADER_TYPE);
            vm.menuEntry.headers = [];
            vm.menuEntry.headers.push(headerEntry);
            vm.actionEntry = headerEntry.actions[0];
          }
          return;
        }
      case sayMessageType.MENUKEY:
        {
          if (vm.menuEntry.entries.length > $scope.menuKeyIndex && vm.menuEntry.entries[$scope.menuKeyIndex]) {
            var keyAction = getSayAction(vm.menuEntry.entries[$scope.menuKeyIndex]);
            if (keyAction) {
              vm.actionEntry = keyAction;
            } else {
              vm.actionEntry = createSayAction();
              vm.menuEntry.entries[$scope.menuKeyIndex].actions[0] = vm.actionEntry;
            }
          } else {
            vm.menuEntry.entries[$scope.menuKeyIndex] = createMenuEntry();
            vm.actionEntry = vm.menuEntry.entries[$scope.menuKeyIndex].actions[0];
          }

          // set the voice from the menu header as needed
          if (!vm.actionEntry.getVoice()) {
            var sayHeader = getSayActionHeader(vm.menuEntry);
            var headerSayAction = getSayAction(sayHeader);
            if (angular.isDefined(headerSayAction)) {
              vm.actionEntry.setVoice(headerSayAction.getVoice());
            }
          }
          return;
        }
      case sayMessageType.ACTION:
        {
          var sayAction = getSayAction(vm.menuEntry);
          if (!sayAction) {
            sayAction = createSayAction();
            vm.menuEntry.addAction(sayAction);
          }
          vm.actionEntry = sayAction;
          return;
        }
      }
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];

      if ($scope.isMenuHeader) {
        vm.sayMessageType = sayMessageType.MENUHEADER;
      } else if ($scope.menuKeyIndex && $scope.menuKeyIndex > -1) {
        vm.sayMessageType = sayMessageType.MENUKEY;
      }

      setActionEntry();
      populateUiModel();
    }

    activate();

  }
})();
