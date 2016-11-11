(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AANewTreatmentModalCtrl', AANewTreatmentModalCtrl);

  /* @ngInject */
  function AANewTreatmentModalCtrl($modalInstance, $translate, $scope, AALanguageService, AACommonService, AutoAttendantCeMenuModelService, AAUiModelService, aa_schedule, aa_menu_id, aa_index, aa_key_index, aa_from_route_call) {
    var vm = this;

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
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.destinationOptions = [{
      label: $translate.instant('autoAttendant.destinations.Disconnect'),
      name: 'Disconnect',
      action: 'disconnect',
      level: 0
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
    vm.mohPlayAction = undefined;
    vm.iaAction = undefined;
    vm.ok = ok;
    vm.isSaveEnabled = isSaveEnabled;
    vm.uploadMohTrigger = uploadMohTrigger;
    vm.setUpEntry = setUpEntry;
//    vm.populateScope = populateScope;
//    vm.populateUiModel = populateUiModel;
    vm.populateMohRadio = populateMohRadio;

    vm.languageOption = languageOption;
    vm.voiceOption = voiceOption;

    vm.languageOptions = AALanguageService.getLanguageOptions();
    vm.voiceOptions = AALanguageService.getVoiceOptions();

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
      if (_.isEqual(vm.musicOnHold, DEFAULT_MOH)) {
        defaultMoh();
      }
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
      vm.mohPlayAction.value = CISCO_STD_MOH_URL;
      vm.mohPlayAction.description = '';
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
      vm.maxWaitTime = vm.minutes[14];
    }

    //populating fallback drop down in sorted order
    function populateDropDown() {
      vm.destinationOptions.sort(AACommonService.sortByProperty('label'));
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

    //get queueSettings menuEntry -> inner menu entry type (moh, initial, periodic...)
    function setUpEntry() {
      if ($scope.keyIndex && $scope.menuId) { //came from a phone menu
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
      populateMaxTime();
      populateDropDown();
    }

    function populateUiModel() {
      populateScope();
      setUpEntry();
      initializeView();
    }

    function activate() {
      populateUiModel();
    }
    activate();
  }
})();
