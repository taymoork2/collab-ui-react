(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToQueueCtrl', AARouteToQueueCtrl);


  /* @ngInject */
  function AARouteToQueueCtrl($scope, $translate, $modal, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AANotificationService, AALanguageService) {

    var vm = this;
    vm.hideQueues = true;
    vm.queueSelected = {
      description: '',
      id: ''
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.queues = [];

    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};


    vm.openQueueTreatmentModal = openQueueTreatmentModal;


    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;


    var rtQueue = 'routeToQueue';
    var fromRouteCall = false;
    var fromDecision = false;


    var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';
    var periodicTime = '45';

    var maxWaitTime = {
      index: '14',
      label: '15'
    };

    /////////////////////


    function openQueueTreatmentModal() {
      // deep copy used to roll back from the modal changes
      var master = angular.copy(fromRouteCall || fromDecision ? vm.menuEntry.actions[0] : vm.menuKeyEntry.actions[0]);
      openQueueSettings().result.then(function () {
        // keep changes as modal was resolved with close
        if (fromRouteCall || fromDecision) {
          vm.menuEntry.actions[0].description = {
            musicOnHoldDescription: vm.menuEntry.actions[0].queueSettings.musicOnHold.actions[0].description,
            periodicAnnouncementType: vm.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].name,
            periodicAnnouncementDescription: vm.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].description,
            initialAnnouncementType: vm.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0].name,
            initialAnnouncementDescription: vm.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0].description
          };
        } else {
          vm.menuKeyEntry.actions[0].description = {
            musicOnHoldDescription: vm.menuKeyEntry.actions[0].queueSettings.musicOnHold.actions[0].description,
            periodicAnnouncementType: vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].name,
            periodicAnnouncementDescription: vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].description,
            initialAnnouncementType: vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement.actions[0].name,
            initialAnnouncementDescription: vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement.actions[0].description
          };
        }
      }, function () {
        // discard changes as modal was dismissed
        if (fromRouteCall || fromDecision) {
          vm.menuEntry.actions[0] = master;
        } else {
          vm.menuKeyEntry.actions[0] = master;
        }
      });
    }

    function openQueueSettings() {
      return $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/routeToQueue/aaNewTreatmentModal.tpl.html',
        controller: 'AANewTreatmentModalCtrl',
        controllerAs: 'aaNewTreatmentModalCtrl',
        type: 'full',
        resolve: {
          aa_schedule: function () {
            return $scope.schedule;
          },
          aa_menu_id: function () {
            return $scope.menuId;
          },
          aa_index: function () {
            return $scope.index;
          },
          aa_key_index: function () {
            return $scope.keyIndex;
          },
          aa_from_route_call: function () {
            return $scope.fromRouteCall;
          },
          aa_from_decision: function () {
            return $scope.fromDecision;
          }
        },
        modalClass: 'aa-queue-settings-modal'
      });
    }

    function populateUiModel() {
      var action;

      if (fromRouteCall || fromDecision) {
        action = vm.menuEntry.actions[0];
      } else {
        action = vm.menuKeyEntry.actions[0];
      }

      if (_.get(action, 'name') === 'decision') {
        action = action.then;
      }

      vm.queueSelected.id = action.getValue();

      try {
        vm.queues = JSON.parse($scope.queues);
        if (vm.queueSelected.id == '' && vm.hideQueues && vm.queues.length > 0) {
          vm.queueSelected = vm.queues[0];
          saveUiModel();
        }
        vm.queueSelected.description = _.result(_.find(vm.queues, {
          'id': vm.queueSelected.id
        }), 'description', '');
      } catch (e) {
        AANotificationService.error('No valid queue configured to display Call Queue option.');
      }
    }

    function saveUiModel() {
      var action;
      if (fromRouteCall || fromDecision) {
        action = vm.menuEntry.actions[0];
        if (_.get(action, 'name') === 'decision') {
          action.then.setValue(vm.queueSelected.id);
        } else {
          action.setValue(vm.queueSelected.id);
        }
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.queueSelected.id);
        if (!_.isEmpty(vm.menuEntry.headers[0].voice)) {
          var queueSettings = _.get(vm.menuKeyEntry, 'actions[0].queueSettings');
          queueSettings.language = vm.menuEntry.headers[0].language;
          queueSettings.voice = vm.menuEntry.headers[0].voice;
        }
      }
      AACommonService.setPhoneMenuStatus(true);
    }

    // This function is called from activateQueueSettings.
    // It adds the appropriate action (i.e. say or play) to the queueSettings.
    function createAction(settings, type, sayOrPlayOrDisconnect) {
      var action;
      settings[type] = AutoAttendantCeMenuModelService.newCeMenuEntry();
      action = AutoAttendantCeMenuModelService.newCeActionEntry(sayOrPlayOrDisconnect, '');
      settings[type].addAction(action);
    }

    // This function is called from activate.
    // It is checking and creating queueSettings (i.e. MoH, IA, PA, FB).
    function activateQueueSettings(menuEntryParam) {
      var action = _.get(menuEntryParam, 'actions[0]');

      if (_.get(action, 'name') === 'decision') {
        action = action.then;
      }

      var queueSettings = _.get(action, 'queueSettings');

      if (!_.has(queueSettings, 'musicOnHold')) {
        createAction(queueSettings, 'musicOnHold', 'play');
        var musicOnHold = _.get(queueSettings, 'musicOnHold.actions[0]');
        musicOnHold.setValue(CISCO_STD_MOH_URL);
      }
      if (!_.has(queueSettings, 'initialAnnouncement')) {
        createAction(queueSettings, 'initialAnnouncement', 'play');
      }
      if (!_.has(queueSettings, 'periodicAnnouncement')) {
        createAction(queueSettings, 'periodicAnnouncement', 'play');
        var periodicAnnouncement = _.get(queueSettings, 'periodicAnnouncement.actions[0]');
        periodicAnnouncement.setDescription("");
        periodicAnnouncement.interval = periodicTime;
      }
      if (!_.has(queueSettings, 'fallback')) {
        createAction(queueSettings, 'fallback', 'disconnect');
      }
      if (!_.has(queueSettings, 'maxWaitTime')) {
        queueSettings.maxWaitTime = maxWaitTime; //default, 15 mins.
      }
      if (!_.has(queueSettings, 'language')) {
        var languageOption = AALanguageService.getLanguageOption();
        queueSettings.language = languageOption.value;//default English(US).
      }
      if (!_.has(queueSettings, 'voice')) {
        var voiceOption = AALanguageService.getVoiceOption();
        queueSettings.voice = voiceOption.value; //default Vanessa.
      }
    }

    function checkForRouteToQueue(action) {

      // make sure action is route To Q not External Number, User, etc
      if (!(action.getName() === rtQueue)) {
        action.setName(rtQueue);
        action.setValue('');
        delete action.queueSettings;
      }
    }

    function activate() {

      var ui = AAUiModelService.getUiModel();

      if ($scope.fromDecision) {
        var decisionAction;
        fromDecision = true;

        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        decisionAction = _.get(vm.menuEntry, 'actions[0]', '');
        if (!decisionAction) {
          decisionAction = AutoAttendantCeMenuModelService.newCeActionEntry('decision', '');
        }
        if (!decisionAction.then) {
          decisionAction.then = {};
          decisionAction.then = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
        } else {
          checkForRouteToQueue(decisionAction.then);
        }

        if (!_.has(decisionAction.then, 'queueSettings')) {
          decisionAction.then.queueSettings = {};
        }

        activateQueueSettings(vm.menuEntry);

      } else {

        if ($scope.fromRouteCall) {
          vm.uiMenu = ui[$scope.schedule];
          vm.menuEntry = vm.uiMenu.entries[$scope.index];
          fromRouteCall = true;

          if (vm.menuEntry.actions.length === 0) {
            action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
            vm.menuEntry.addAction(action);
          } else {
            checkForRouteToQueue(vm.menuEntry.actions[0]);
          }
          if (!_.has(_.get(vm.menuEntry, 'actions[0]'), 'queueSettings')) {
            vm.menuEntry.actions[0].queueSettings = {};
          }

          activateQueueSettings(vm.menuEntry);

        } else {
          vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
          if ($scope.keyIndex < vm.menuEntry.entries.length) {
            vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
          } else {
            vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
            var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
            vm.menuKeyEntry.addAction(action);
          }
          if (!_.has(_.get(vm.menuKeyEntry, 'actions[0]'), 'queueSettings')) {
            vm.menuKeyEntry.actions[0].queueSettings = {};
          }
          activateQueueSettings(vm.menuKeyEntry);
        }
      }

      populateUiModel();
    }
    activate();
  }
})();
