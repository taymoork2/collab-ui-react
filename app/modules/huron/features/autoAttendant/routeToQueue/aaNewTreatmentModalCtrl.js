(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AANewTreatmentModalCtrl', AANewTreatmentModalCtrl);

  /* @ngInject */
  function AANewTreatmentModalCtrl($rootScope, $modalInstance, $translate, $scope, AALanguageService, AACommonService, AutoAttendantCeMenuModelService, AAUiModelService, aa_schedule, aa_menu_id, aa_index, aa_key_index, aa_from_route_call, aa_from_decision) {
    var vm = this;
    var conditional = 'conditional';

    var properties = {
      LABEL: 'label',
    };

    vm.showLanguageAndVoiceOptions = false;

    var languageOption = {
      label: '',
      value: '',
    };

    var voiceOption = {
      label: '',
      value: '',
    };

    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');

    vm.destinationOptions = [{
      label: $translate.instant('autoAttendant.destinations.Disconnect'),
      action: 'disconnect',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteHunt'),
      action: 'routeToHuntGroup',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteAA'),
      action: 'goto',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteUser'),
      action: 'routeToUser',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteVM'),
      action: 'routeToVoiceMail',
    }, {
      label: $translate.instant('autoAttendant.phoneMenuRouteToExtNum'),
      action: 'route',
    }];
    vm.destination = vm.destinationOptions[0];
    vm.musicOnHold = '';
    vm.menuEntry = undefined;
    vm.ok = ok;
    vm.cancel = cancel;
    vm.isSaveEnabled = isSaveEnabled;
    vm.uploadMohTrigger = uploadMohTrigger;

    vm.destination = '';
    vm.maxWaitTime = '';

    vm.languageOption = languageOption;
    vm.voiceOption = voiceOption;

    vm.languageOptions = AALanguageService.getLanguageOptions();
    vm.voiceOptions = AALanguageService.getVoiceOptions();

    vm.setVoiceOptions = setVoiceOptions;

    vm.periodicMinutes = [];
    vm.periodicSeconds = [];
    vm.periodicSecond = {};
    vm.periodicMinute = {};
    vm.minutes = [];

    vm.changedPeriodicMinValue = changedPeriodicMinValue;

    vm.isDisabled = isDisabled;

    vm.MAX_FILE_SIZE_IN_BYTES = 120 * 1024 * 1024;

    vm.mediaState = {};

    var mohPlayAction = undefined;
    var fallbackAction = undefined;
    var paAction = undefined;

    var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';
    var DEFAULT_MOH = 'musicOnHoldDefault';
    var CUSTOM_MOH = 'musicOnHoldUpload';

    //////////////////////////////////
    function chkDecision(action) {
      if (_.get(action, 'name') === conditional) {
        action = action.then;
      }
      return action;
    }

    function ok() {
      updateLanguageVoice();
      updateMaxWaitTime();
      updatePeriodicTime();
      updateFallback();
      autoValidate();
      AACommonService.setQueueSettingsStatus(true);
      $rootScope.$broadcast('AASaveQueueSettings');
      $modalInstance.close();
    }

    function cancel() {
      $rootScope.$broadcast('AACancelQueueSettings');
      $modalInstance.dismiss();
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
      //disconnect is not an action so needs to be re-init
      if (vm.destination.action === 'disconnect') {
        vm.menuEntry.actions[0].queueSettings.fallback.actions[0] = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', '');
      }
    }

    function updateLanguageVoice() {
      var action;

      if (vm.showLanguageAndVoiceOptions) {
        action = chkDecision(vm.menuEntry.actions[0]);

        action.queueSettings.language = vm.languageOption.value;
        action.queueSettings.voice = vm.voiceOption.value;
      }
    }

    function updatePeriodicTime() {
      var periodicMinutes = (vm.periodicMinute * 60);
      var periodicTime = periodicMinutes + vm.periodicSecond;

      paAction.interval = periodicTime;
    }

    function updateMaxWaitTime() {
      var action;

      action = chkDecision(vm.menuEntry.actions[0]);

      action.queueSettings.maxWaitTime = vm.maxWaitTime;
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
      return _.isEqual(vm.periodicMinute, 5);
    }

    function changedPeriodicMinValue() {
      if (_.isEqual(vm.periodicMinute, 0)) {
        // remove 'zero' from selection
        if (_.isEqual(vm.periodicSeconds[0], 0)) {
          vm.periodicSeconds.splice(0, 1);
        }

        if (_.isEqual(vm.periodicSecond, 0)) {
          vm.periodicSecond = vm.periodicSeconds[0];
        }
        return;
      }

      if (_.indexOf(vm.periodicSeconds, 5) === -1) {
        vm.periodicSeconds.splice(0, 1, 5);
      }

      if (_.indexOf(vm.periodicSeconds, 0) === -1) {
        vm.periodicSeconds.splice(0, 0, 0);
      }

      if (_.isEqual(vm.periodicMinute, 5)) {
        vm.periodicSecond = vm.periodicSeconds[0];
      }
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
        value: vm.voiceBackup.value,
      })) {
        vm.voiceOption = vm.voiceBackup;
      } else if (_.find(vm.voiceOptions, AALanguageService.getVoiceOption())) {
        vm.voiceOption = AALanguageService.getVoiceOption();
      } else {
        vm.voiceOption = vm.voiceOptions[0];
      }
    }

    function populateLanguageVoice() {
      var action;

      if (vm.showLanguageAndVoiceOptions) {
        vm.languageOptions.sort(AACommonService.sortByProperty(properties.LABEL));
        vm.voiceOptions.sort(AACommonService.sortByProperty(properties.LABEL));
        action = chkDecision(vm.menuEntry.actions[0]);

        var voice = action.queueSettings.voice;

        vm.voiceOption = AALanguageService.getVoiceOption(voice);
        vm.languageOption = AALanguageService.getLanguageOption(voice);
        vm.voiceBackup = vm.voiceOption;
        setVoiceOptions();
      }
    }

    function populatePeriodicTime() {
      vm.periodicMinutes = _.range(6);

      vm.periodicSeconds = _.range(0, 60, 5);

      if (!_.isEqual(paAction.interval, '')) {
        vm.periodicMinute = parseInt(paAction.interval / 60, 10);
        vm.periodicSecond = paAction.interval - (vm.periodicMinute * 60);
      } else {
        vm.periodicMinute = vm.periodicMinutes[0];
        vm.periodicSecond = vm.periodicSeconds[8];
      }
      vm.periodicSeconds.splice(0, 1);
    }

    function populateMaxWaitTime() {
      //1-60 increment by 1, then 75, 90, 105, 120
      vm.minutes = _.concat(vm.minutes, _.range(1, 61), _.range(75, 121, 15));
    }

    //populating fallback drop down in sorted order
    function populateFallbackDropDown() {
      vm.destinationOptions.sort(AACommonService.sortByProperty(properties.LABEL));

      vm.destination = _.find(vm.destinationOptions, function (option) {
        return (_.isEqual(option.action, fallbackAction.name));
      });
    }

    function populateMohRadio() {
      if (_.isEqual(mohPlayAction.description, '')) { //no metadata set, so no file uploaded
        vm.musicOnHold = DEFAULT_MOH;
      } else {
        vm.musicOnHold = CUSTOM_MOH;
      }
    }

    //get queueSettings menuEntry -> inner menu entry type (moh, initial, periodic...)
    function setUpEntry() {
      var action;

      if ($scope.keyIndex && $scope.menuId && !$scope.fromRouteCall) { //came from a phone menu
        var phMenu = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        vm.menuEntry = phMenu.entries[$scope.keyIndex];
      } else { //came from a route call or decision
        var ui = AAUiModelService.getUiModel();
        var rcMenu = ui[$scope.schedule];
        vm.menuEntry = rcMenu.entries[$scope.index];
        vm.showLanguageAndVoiceOptions = true;
      }

      action = chkDecision(vm.menuEntry.actions[0]);

      mohPlayAction = action.queueSettings.musicOnHold.actions[0];
      paAction = action.queueSettings.periodicAnnouncement.actions[0];
      fallbackAction = action.queueSettings.fallback.actions[0];
      vm.maxWaitTime = action.queueSettings.maxWaitTime;
    }

    function populateScope() {
      $scope.schedule = aa_schedule;
      $scope.index = aa_index;
      $scope.menuId = aa_menu_id;
      $scope.keyIndex = aa_key_index;
      $scope.fromRouteCall = aa_from_route_call;
      $scope.fromDecision = aa_from_decision;
    }

    function initializeView() {
      populateLanguageVoice();
      populateMohRadio();
      populatePeriodicTime();
      populateMaxWaitTime();
      populateFallbackDropDown();
    }

    function setFeatureToggles() {
      if (AACommonService.isRouteSIPAddressToggle()) {
        vm.destinationOptions.push({
          label: $translate.instant('autoAttendant.phoneMenuRouteToSipEndpoint'),
          action: 'routeToSipEndpoint',
        });
      }
    }

    function populateUiModel() {
      setFeatureToggles();
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
