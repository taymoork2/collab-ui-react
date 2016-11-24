(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToQueueCtrl', AARouteToQueueCtrl);


  /* @ngInject */
  function AARouteToQueueCtrl($scope, $translate, $modal, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService, AANotificationService) {

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

    var CISCO_STD_MOH_URL = 'http://hosting.tropo.com/5046133/www/audio/CiscoMoH.wav';
    var periodicTime = '45';

    var maxWaitTime = {
      index: '14',
      label: '15'
    };

    /////////////////////


    function openQueueTreatmentModal() {
      // deep copy used to roll back from the modal changes
      var master = angular.copy(fromRouteCall ? vm.menuEntry.actions[0] : vm.menuKeyEntry.actions[0]);
      openQueueSettings().result.then(function () {
        // keep changes as modal was resolved with close
        if (fromRouteCall) {
          vm.menuEntry.actions[0].description = {
            periodicAnnouncementType: vm.menuEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].name,
            initialAnnouncementType: vm.menuEntry.actions[0].queueSettings.initialAnnouncement.actions[0].name,
            fallback: vm.menuEntry.actions[0].queueSettings.fallback.actions[0].name
          };
        } else {
          vm.menuKeyEntry.actions[0].description = {
            periodicAnnouncementType: vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement.actions[0].name,
            initialAnnouncementType: vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement.actions[0].name,
            fallback: vm.menuKeyEntry.actions[0].queueSettings.fallback.actions[0].name
          };
        }
      }, function () {
        // discard changes as modal was dismissed
        if (fromRouteCall) {
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
          }
        },
        modalClass: 'aa-queue-settings-modal'
      });
    }

    function populateUiModel() {

      if (fromRouteCall) {
        vm.queueSelected.id = vm.menuEntry.actions[0].getValue();
      } else {
        vm.queueSelected.id = vm.menuKeyEntry.actions[0].getValue();
      }
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
      if (fromRouteCall) {
        vm.menuEntry.actions[0].setValue(vm.queueSelected.id);
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.queueSelected.id);
      }
      AACommonService.setPhoneMenuStatus(true);
    }

    // This function is called from activateQueueSettings.
    // It adds the appropriate action (i.e. say or play) to the queueSettings.
    function createAction(obj, type, sayOrPlayOrDisconnect) {
      var action;
      obj[type] = AutoAttendantCeMenuModelService.newCeMenuEntry();
      action = AutoAttendantCeMenuModelService.newCeActionEntry(sayOrPlayOrDisconnect, '');
      obj[type].addAction(action);
    }

    // This function is called from activate.
    // It is checking and creating queueSettings (i.e. MoH, IA, PA, FB).
    function activateQueueSettings(menuEntryParam) {
      var queueSettings = _.get(menuEntryParam, 'actions[0].queueSettings');

      if (!_.has(queueSettings, 'musicOnHold')) {
        createAction(queueSettings, 'musicOnHold', 'play');
        var musicOnHold = _.get(queueSettings, 'musicOnHold.actions[0');
        musicOnHold.setValue(CISCO_STD_MOH_URL);
      }
      if (!_.has(queueSettings, 'initialAnnouncement')) {
        createAction(queueSettings, 'initialAnnouncement', 'say');
      }
      if (!_.has(queueSettings, 'periodicAnnouncement')) {
        createAction(queueSettings, 'periodicAnnouncement', 'say');
        var periodicAnnouncement = _.get(queueSettings, 'periodicAnnouncement.actions[0');
        periodicAnnouncement.setDescription(periodicTime);
      }
      if (!_.has(queueSettings, 'fallback')) {
        createAction(queueSettings, 'fallback', 'Disconnect');
      }
      if (!_.has(queueSettings, 'maxWaitTime')) {
        queueSettings.maxWaitTime = maxWaitTime; //default, 15 mins.
      }
    }

    function activate() {
      if ($scope.fromRouteCall) {
        var ui = AAUiModelService.getUiModel();
        vm.uiMenu = ui[$scope.schedule];
        vm.menuEntry = vm.uiMenu.entries[$scope.index];
        fromRouteCall = true;

        if (vm.menuEntry.actions.length === 0) {
          action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
          vm.menuEntry.addAction(action);
        } else {
          // make sure action is HG not AA, User, extNum, etc
          if (!(vm.menuEntry.actions[0].getName() === rtQueue)) {
            vm.menuEntry.actions[0].setName(rtQueue);
            vm.menuEntry.actions[0].setValue('');
          } // else let saved value be used
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

      populateUiModel();
    }
    activate();
  }
})();
