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
      name: 'disconnect',
      action: 'disconnect'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      name: 'destinationMenuRouteHunt',
      action: 'routeToHuntGroup'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      name: 'destinationMenuRouteAA',
      action: 'goto'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      name: 'destinationMenuRouteUser',
      action: 'routeToUser'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      name: 'destinationMenuRouteMailbox',
      action: 'routeToVoiceMail'
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      name: 'destinationMenuRouteToExtNum',
      action: 'route'
    }];
    vm.destination = vm.destinationOptions[0];
    vm.musicOnHold = '';
    vm.menuEntry = undefined;
    vm.ok = ok;
    vm.isSaveEnabled = isSaveEnabled;
    vm.uploadMohTrigger = uploadMohTrigger;

    vm.destination = '';

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

    var mohPlayAction = undefined;
    var fallbackAction = undefined;
    var paAction = undefined;
    var periodicTime = '';

    var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';
    var DEFAULT_MOH = 'musicOnHoldDefault';
    var CUSTOM_MOH = 'musicOnHoldUpload';

    //////////////////////////////////

    //else the dismiss was called
    function ok() {
      updateMaxWaitTime();
      updateFallback();
      autoValidate();
      AACommonService.setQueueSettingsStatus(true);
      $modalInstance.close();
    }

    function autoValidate() {
      if (_.isEqual(mohPlayAction.value, '')) {
        vm.musicOnHold = DEFAULT_MOH;
      }
      if (_.isEqual(vm.musicOnHold, DEFAULT_MOH)) {
        defaultMoh();
      }
    }

    function updateFallback() {
      fallbackAction.setName(vm.destination.action);
    }

    function updateMaxWaitTime() {
      vm.menuEntry.actions[0].queueSettings.maxWaitTime = vm.maxWaitTime;
    }

    //auto set the radio option
    function uploadMohTrigger() {
      vm.musicOnHold = CUSTOM_MOH;
    }

    //the queueSettings save gets linked to main save
    function isSaveEnabled() {
      return (AACommonService.isValid() && isDestinationValid());
    }

    function defaultMoh() {
      mohPlayAction.setValue(CISCO_STD_MOH_URL);
      mohPlayAction.setDescription('');
    }

    function isDisabled() {
      return vm.periodicMinute.label == '5';
    }

    function isDestinationValid() {
      var isValid = true;
      if (!_.isEqual(vm.destination.action, 'disconnect') && _.isEmpty(fallbackAction.value)) {
        isValid = false;
      }

      return isValid;
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
      if (!_.isEqual(paAction.interval, '')) {
        var periodicMinute = parseInt(paAction.interval / 60, 10);
        vm.periodicMinute = {
          index: periodicMinute,
          label: periodicMinute
        };
        var periodicSecond = paAction.interval - (periodicMinute * 60);
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

    function populateMaxWaitTime() {
      vm.minutes = [];
      _.times(60, function (i) {
        vm.minutes.push({
          index: i,
          label: i + 1
        });
      });
    }

    //populating fallback drop down in sorted order
    function populateFallbackDropDown() {
      vm.destinationOptions.sort(AACommonService.sortByProperty('label'));

      vm.destination = _.find(vm.destinationOptions, function (option) {
        return (_.isEqual(option.action, fallbackAction.name));
      });

      vm.languageOptions.sort(AACommonService.sortByProperty('label'));
      vm.voiceOptions.sort(AACommonService.sortByProperty('label'));

      vm.languageOption = AALanguageService.getLanguageOption();
      vm.voiceOption = AALanguageService.getVoiceOption();
    }

    function populateMohRadio() {
      if (_.isEqual(mohPlayAction.description, '')) { //no metadata set, so no file uploaded
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
      paAction.interval = periodicTime;
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
      paAction.interval = periodicTime;
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
      mohPlayAction = vm.menuEntry.actions[0].queueSettings.musicOnHold.actions[0];
      paAction = vm.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0];
      fallbackAction = vm.menuEntry.actions[0].queueSettings.fallback.actions[0];
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
      populateMaxWaitTime();
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
