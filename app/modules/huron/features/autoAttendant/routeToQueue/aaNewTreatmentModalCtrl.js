(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AANewTreatmentModalCtrl', AANewTreatmentModalCtrl);

  /* @ngInject */
  function AANewTreatmentModalCtrl($modalInstance, $translate, $scope, AALanguageService, AACommonService, AutoAttendantCeMenuModelService, AAUiModelService, aa_schedule, aa_menu_id, aa_index, aa_key_index, aa_from_route_call) {
    var vm = this;

    var properties = {
      LABEL: "label"
    };

    vm.actionEntry = {};

    vm.showLanguageAndVoiceOptions = false;

    var languageOption = {
      label: '',
      value: ''
    };

    var voiceOption = {
      label: '',
      value: ''
    };

    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    vm.destinationOptions = [{
      label: $translate.instant('autoAttendant.destinations.Disconnect'),
      name: 'Disconnect',
      action: 'disconnect',
      treatment: ''
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      name: 'destinationMenuRouteHunt',
      action: 'routeToHuntGroup',
      id: ''
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      name: 'destinationMenuRouteAA',
      action: 'goto',
      id: ''
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      name: 'destinationMenuRouteUser',
      action: 'routeToUser',
      id: ''
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      name: 'destinationMenuRouteMailbox',
      action: 'routeToVoiceMail',
      id: ''
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      name: 'destinationMenuRouteToExtNum',
      number: '',
      action: 'route',
      id: ''
    }];
    vm.destination = vm.destinationOptions[0];
    vm.musicOnHold = '';
    vm.menuEntry = undefined;
    vm.mohPlayAction = undefined;
    vm.iaAction = undefined;
    vm.paAction = undefined;
    vm.ok = ok;
    vm.isSaveEnabled = isSaveEnabled;
    vm.uploadMohTrigger = uploadMohTrigger;

    vm.destination = '';
    vm.fallbackAction = undefined;
    vm.updateFallback = updateFallback;
    vm.updateMaxWaitTime = updateMaxWaitTime;
    vm.saveMoh = saveMoh;

    vm.activate = activate;
    vm.populateMohRadio = populateMohRadio;

    vm.languageOption = languageOption;
    vm.voiceOption = voiceOption;

    vm.languageOptions = AALanguageService.getLanguageOptions();
    vm.voiceOptions = AALanguageService.getVoiceOptions();

    vm.setVoiceOptions = setVoiceOptions;

    vm.periodicMinutes = [];
    vm.periodicSeconds = [];
    vm.changedPeriodicMinValue = changedPeriodicMinValue;
    vm.changedPeriodicSecValue = changedPeriodicSecValue;
    vm.areSecondsDisabled = isDisabled;
    var periodicTime = '';

    var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';
    var DEFAULT_MOH = 'musicOnHoldDefault';
    var CUSTOM_MOH = 'musicOnHoldUpload';

    //////////////////////////////////

    //else the dismiss was called
    function ok() {
      autoValidate();
      AACommonService.setQueueSettingsStatus(true);
      $modalInstance.close();
    }

    function autoValidate() {
      if (_.isEqual(vm.mohPlayAction.value, '')) {
        vm.musicOnHold = DEFAULT_MOH;
      }
      if (_.isEqual(vm.musicOnHold, DEFAULT_MOH)) {
        defaultMoh();
      }
      if (_.isEqual(vm.fallbackAction.description, 'fallback')) {
        vm.fallbackAction.name.id = vm.fallbackAction.getValue();
      }
    }

    function updateFallback() {
      //clearing already stored values when new action is choosen from dropdown
      vm.fallbackAction.setName('');
      vm.fallbackAction.setValue('');
      vm.fallbackAction.setName(vm.destination);
      vm.fallbackAction.setDescription("fallback");
    }

    function updateMaxWaitTime() {
      vm.menuEntry.actions[0].queueSettings.maxWaitTime = vm.maxWaitTime;
    }

    function saveMoh() {
      vm.mohPlayAction.setValue('');
      vm.mohPlayAction.setDescription(vm.musicOnHold);
    }

    //auto set the radio option
    function uploadMohTrigger() {
      vm.musicOnHold = CUSTOM_MOH;
    }

    //the queueSettings save gets linked to main save
    function isSaveEnabled() {
      return AACommonService.isValid();
    }

    function defaultMoh() {
      vm.mohPlayAction.setValue(CISCO_STD_MOH_URL);
      vm.mohPlayAction.setDescription('');
    }

    function isDisabled() {
      return vm.periodicMinute.label == '5';
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

    function populatePeriodicTime() {
      _.times(6, function (i) {
        vm.periodicMinutes.push({
          index: i,
          label: i
        });
      });
      _.times(11, function (i) {
        vm.periodicSeconds.push({
          index: i,
          label: (i + 1) * 5
        });
      });
      if (!_.isEqual(vm.paAction.description, '')) { //no metadata set, so no file uploaded
        var periodicMinute = parseInt(vm.paAction.description / 60, 10);
        vm.periodicMinute = {
          index: periodicMinute,
          label: periodicMinute
        };
        var periodicSecond = vm.paAction.description - (periodicMinute * 60);
        vm.periodicSecond = {
          index: parseInt(periodicSecond / 5, 10) - 1,
          label: periodicSecond
        };
        if (periodicMinute == '5') {
          vm.areSecondsDisabled = false;
        }
      } else {
        vm.periodicMinute = vm.periodicMinutes[0];
        vm.periodicSecond = vm.periodicSeconds[8];
      }
    }

    function populateMaxTime() {
      vm.minutes = [];
      _.times(60, function (i) {
        vm.minutes.push({
          index: i,
          label: i + 1
        });
      });
      //setting maxWaitTime's default value
      if (_.isEqual(vm.fallbackAction.description, '')) {
        vm.maxWaitTime = vm.minutes[14];
      } else {
        vm.maxWaitTime = vm.maxWaitTime;
      }
    }

    //populating fallback drop down in sorted order
    function populateFallbackDropDown() {
      vm.destinationOptions.sort(AACommonService.sortByProperty('label'));
      if (_.isEqual(vm.fallbackAction.description, '')) {
        vm.destination = vm.destinationOptions[0];
      } else {
        vm.destination = vm.fallbackAction.getName();
      }
      vm.languageOptions.sort(AACommonService.sortByProperty('label'));
      vm.voiceOptions.sort(AACommonService.sortByProperty('label'));

      vm.languageOption = AALanguageService.getLanguageOption();
      vm.voiceOption = AALanguageService.getVoiceOption();
    }

    function populateMohRadio() {
      if (_.isEqual(vm.mohPlayAction.description, '')) { //no metadata set, so no file uploaded
        vm.musicOnHold = DEFAULT_MOH;
      } else {
        vm.musicOnHold = CUSTOM_MOH;
      }
    }

    function changedPeriodicMinValue() {
      if (vm.periodicMinute.index == '0') {
        vm.periodicSeconds.splice(0, 1);
        if (vm.periodicSecond.label == 0) {
          vm.periodicSecond = vm.periodicSeconds[0];
        }
        vm.areSecondsDisabled = true;
      } else {
        if (vm.periodicSeconds[0].label != '0') {
          vm.periodicSeconds.splice(0, 0, { index: 0, label: 0 });
        }
        vm.areSecondsDisabled = true;
      }
      if (vm.periodicMinute.index == '5') {
        vm.periodicSecond = vm.periodicSeconds[0];
        vm.areSecondsDisabled = false;
      }
      var periodicMinutes = (vm.periodicMinute.label * 60);
      periodicTime = periodicMinutes + vm.periodicSecond.label;
      vm.paAction.setDescription(periodicTime);
    }

    function changedPeriodicSecValue() {
      if ((vm.periodicSecond.index == 0) && (vm.periodicMinute.index == 0)) {
        if (vm.periodicSeconds[0].label == 0) {
          vm.periodicSeconds.splice(0, 1);
        }
        vm.periodicSecond = vm.periodicSeconds[0];
        vm.areSecondsDisabled = true;
      }
      var periodicSeconds = (vm.periodicMinute.label * 60);
      periodicTime = periodicSeconds + vm.periodicSecond.label;
      vm.paAction.setDescription(periodicTime);
    }

    //get queueSettings menuEntry -> inner menu entry type (moh, initial, periodic...)
    function setUpEntry() {
      if ($scope.keyIndex && $scope.menuId && !$scope.fromRouteCall) { //came from a phone menu
        var phMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        vm.menuEntry = phMenu.entries[$scope.keyIndex];
      } else { //came from a route call
        var ui = AAUiModelService.getUiModel();
        var rcMenu = ui[$scope.schedule];
        vm.menuEntry = rcMenu.entries[$scope.index];
        vm.showLanguageAndVoiceOptions = true;
      }
      vm.mohPlayAction = vm.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
      vm.iaAction = vm.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0];
      vm.paAction = vm.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0];
      vm.fallbackAction = vm.menuEntry.actions[0].queueSettings.fallback.actions[0];
      vm.maxWaitTime = vm.menuEntry.actions[0].queueSettings.maxWaitTime;
    }

    function populateScope() {
      $scope.schedule = aa_schedule;
      $scope.index = aa_index;
      $scope.menuId = aa_menu_id;
      $scope.keyIndex = aa_key_index;
      $scope.fromRouteCall = aa_from_route_call;
    }

    function initializeView() {
      populateMohRadio();
      populatePeriodicTime();
      populateMaxTime();
      populateFallbackDropDown();
    }

    function populateUiModel() {
      populateScope();
      setUpEntry();
      initializeView();
      setVoiceOptions();
    }

    function activate() {
      populateUiModel();
    }
    activate();
  }
})();
