(function () {
  'use strict';

  angular
  .module('uc.autoattendant')
  .controller('AASayMessageCtrl', AASayMessageCtrl);

  /* @ngInject */
  function AASayMessageCtrl($scope, $translate, AAUiModelService, AutoAttendantCeMenuModelService, AALanguageService, AACommonService) {

    var vm = this;


    var properties = {
      NAME: ["play", "say"],
      REPEAT_NAME: "repeatActionsOnInput",
      LABEL: "label",
      VALUE: "value",
      HEADER_TYPE: "MENU_OPTION_ANNOUNCEMENT"
    };

    var sayMessageType = {
      ACTION: 1,
      MENUHEADER: 2,
      MENUKEY: 3,
      SUBMENU_HEADER: 4
    };

    var languageOption = {
      label: '',
      value: ''
    };

    var voiceOption = {
      label: '',
      value: ''
    };


    var actionType = {
      PLAY: 0,
      SAY: 1,
    };

    var saveAction = {};

    var selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.menuEntry = {};
    vm.actionEntry = {};
    vm.sayMessageType = sayMessageType.ACTION;

    vm.messageInput = '';
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
    vm.updateVoiceOption = updateVoiceOption;

    vm.messageOption = {
      label: '',
      value: ''
    };

    vm.messageOptions = [{
      "label": $translate.instant('autoAttendant.uploadedFile'),
      "value": "uploadFile"
    }, {
      "label": $translate.instant('autoAttendant.actionSayMessage'),
      "value": "sayMessage"
    }];

    vm.uploadedFile = undefined;
    vm.uploadedDate = undefined;
    vm.setMessageOptions = setMessageOptions;

    vm.isMediaUploadToggle = isMediaUploadToggle;

    /////////////////////

    //the media upload only is set for the say message action,
    //not for phone menu, dial by ext, or submenu at this point
    //and is also feature toggled
    function isMediaUploadToggle() {
      var mediaUploadOn = false;
      if (vm.sayMessageType == sayMessageType.ACTION && (AACommonService.isMediaUploadToggle())) {
        mediaUploadOn = true;
      }

      return mediaUploadOn;
    }

    function setMessageOptions() {

      var action = vm.actionEntry;

      angular.copy(action, saveAction[action.name]);

      if (vm.messageOption.value === 'sayMessage') {

        angular.copy(saveAction['say'], action);

        vm.messageInput = action.getValue();
      } else {
        angular.copy(saveAction['play'], action);
      }
    }

    function setVoiceOptions() {
      vm.voiceOptions = _.sortBy(AALanguageService.getVoiceOptions(vm.languageOption), properties.LABEL);
      setVoiceOption();
    }

    function getFooter() {
      switch (vm.sayMessageType) {
        case sayMessageType.MENUKEY:
        case sayMessageType.SUBMENU_HEADER:
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
        case sayMessageType.SUBMENU_HEADER:
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

      vm.languageOptions = _.sortBy(AALanguageService.getLanguageOptions(), properties.LABEL);

      vm.voiceOption = AALanguageService.getVoiceOption(vm.actionEntry.getVoice());
      vm.languageOption = AALanguageService.getLanguageOption(vm.actionEntry.getVoice());

      vm.messageOption = vm.messageOptions[_.get(actionType, vm.actionEntry.name.toUpperCase())];

      vm.voiceBackup = vm.voiceOption;
      setVoiceOptions();
    }

    /*
    * Update voice option in the menu's say-message keys, menu's submenus and its
    * say-message keys.
    */
    function updateVoiceOption(menu) {
      if (menu.entries) {
        _.each(menu.entries, function (entry) {
          if (AutoAttendantCeMenuModelService.isCeMenu(entry)) {
            var submenuHeader = getSayActionHeader(entry);
            if (submenuHeader) {
              submenuHeader.setLanguage(AALanguageService.getLanguageCode(vm.languageOption));
              submenuHeader.setVoice(vm.voiceOption.value);
              var submenuKeyAction = getSayAction(submenuHeader);
              if (submenuKeyAction) {
                submenuKeyAction.setVoice(vm.voiceOption.value);
              }
            }
            vm.updateVoiceOption(entry);
          } else {
            var keyAction = getSayAction(entry);
            if (keyAction) {
              keyAction.setVoice(vm.voiceOption.value);
            }
          }
        });
      }
    }

    function saveUiModel() {
      if (vm.messageOption.value === 'uploadFile') {
        return;
      }

      vm.actionEntry.setValue(vm.messageInput);
      AACommonService.setSayMessageStatus(true);

      if (vm.sayMessageType === sayMessageType.SUBMENU_HEADER) {
        return;
      }

      vm.actionEntry.setVoice(vm.voiceOption.value);
      saveAction['say'].setVoice(vm.voiceOption.value);

      switch (vm.sayMessageType) {
        case sayMessageType.MENUHEADER:
          {
          // set values to be used for service invalid/timeout messages
            var header = getSayActionHeader(vm.menuEntry);
            header.setLanguage(AALanguageService.getLanguageCode(vm.languageOption));
            header.setVoice(vm.voiceOption.value);

            vm.updateVoiceOption(vm.menuEntry);
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
      menuEntry.addAction(createSayAction(actionType.SAY));
      return menuEntry;
    }

    function createSayAction(which) {
      return AutoAttendantCeMenuModelService.newCeActionEntry(properties.NAME[which], '');
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
          return _.indexOf(properties.NAME, action.name) >= 0;
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
      var ui;

      switch (vm.sayMessageType) {
        case sayMessageType.MENUHEADER:
        case sayMessageType.SUBMENU_HEADER:
          {
            vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
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

              if (vm.sayMessageType === sayMessageType.SUBMENU_HEADER) {
                // For new submenu, copy voice option from main menu
                ui = AAUiModelService.getUiModel();
                var uiMenu = ui[$scope.schedule];
                var mainMenu = uiMenu.entries[$scope.index];
                var mainMenuSayHeader = getSayActionHeader(mainMenu);

                headerEntry.setVoice(mainMenuSayHeader.getVoice());
                vm.actionEntry.setVoice(mainMenuSayHeader.getVoice());

              }
            }
            return;
          }
        case sayMessageType.MENUKEY:
          {
            vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
            if (vm.menuEntry.entries.length > $scope.menuKeyIndex && vm.menuEntry.entries[$scope.menuKeyIndex]) {
              var keyAction = getSayAction(vm.menuEntry.entries[$scope.menuKeyIndex]);
              if (keyAction) {
                vm.actionEntry = keyAction;
              } else {
                vm.actionEntry = createSayAction(actionType.SAY);
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
            ui = AAUiModelService.getUiModel();
            uiMenu = ui[$scope.schedule];
            vm.menuEntry = uiMenu.entries[$scope.index];
            var sayAction = getSayAction(vm.menuEntry);
            if (!sayAction) {
              sayAction = createSayAction(actionType.SAY);
              vm.menuEntry.addAction(sayAction);
            }
            vm.actionEntry = sayAction;
            angular.copy(sayAction, saveAction[sayAction.name]);

            return;
          }
      }
    }

    function activate() {
      if ($scope.isMenuHeader) {
        vm.sayMessageType = sayMessageType.MENUHEADER;
      } else if ($scope.menuId && (!$scope.menuKeyIndex || $scope.menuKeyIndex <= -1)) {
        vm.sayMessageType = sayMessageType.SUBMENU_HEADER;
      } else if ($scope.menuKeyIndex && $scope.menuKeyIndex > -1) {
        vm.sayMessageType = sayMessageType.MENUKEY;
      }

      saveAction['say'] = createSayAction(actionType.SAY);
      saveAction['play'] = createSayAction(actionType.PLAY);
      setActionEntry();
      populateUiModel();
    }

    activate();

  }
})();
