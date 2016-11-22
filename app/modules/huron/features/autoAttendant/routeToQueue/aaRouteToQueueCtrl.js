(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToQueueCtrl', AARouteToQueueCtrl);


  /* @ngInject */
  function AARouteToQueueCtrl($scope, $translate, $modal, AAUiModelService, AutoAttendantCeMenuModelService, AACommonService) {

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
    var play = 'play';
    var say = 'say';
    var disconnect = 'disconnect';
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
          vm.menuEntry.actions[0].description = vm.menuEntry.actions[0].queueSettings;
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
      vm.queues = JSON.parse($scope.queues);
      if (vm.queueSelected.id == '' && vm.hideQueues && vm.queues.length > 0) {
        vm.queueSelected = vm.queues[0];
        saveUiModel();
      }
      vm.queueSelected.description = _.result(_.find(vm.queues, {
        'id': vm.queueSelected.id
      }), 'description', '');
    }

    function saveUiModel() {
      if (fromRouteCall) {
        vm.menuEntry.actions[0].setValue(vm.queueSelected.id);
      } else {
        vm.menuKeyEntry.actions[0].setValue(vm.queueSelected.id);
      }
      AACommonService.setPhoneMenuStatus(true);
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
      } else {
        vm.menuEntry = AutoAttendantCeMenuModelService.getCeMenu($scope.menuId);
        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
          vm.menuKeyEntry.addAction(action);
        }
        if (_.isUndefined(vm.menuKeyEntry.actions[0].queueSettings)) {
          vm.menuKeyEntry.actions[0].queueSettings = {};
        }
        if (_.isUndefined(vm.menuKeyEntry.actions[0].queueSettings.musicOnHold)) {
          vm.menuKeyEntry.actions[0].queueSettings.musicOnHold = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var mohAction = AutoAttendantCeMenuModelService.newCeActionEntry(play, CISCO_STD_MOH_URL);
          vm.menuKeyEntry.actions[0].queueSettings.musicOnHold.addAction(mohAction);
        }
        if (_.isUndefined(vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement)) {
          vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var iaAction = AutoAttendantCeMenuModelService.newCeActionEntry(say, '');
          vm.menuKeyEntry.actions[0].queueSettings.initialAnnouncement.addAction(iaAction);
        }
        if (_.isUndefined(vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement)) {
          vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var paAction = AutoAttendantCeMenuModelService.newCeActionEntry(say, '');
          paAction.setDescription('45');
          vm.menuKeyEntry.actions[0].queueSettings.periodicAnnouncement.addAction(paAction);
        }
        if (angular.isUndefined(vm.menuKeyEntry.actions[0].queueSettings.fallback)) {
          vm.menuKeyEntry.actions[0].queueSettings.fallback = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var fallbackAction = AutoAttendantCeMenuModelService.newCeActionEntry(disconnect, '');
          vm.menuKeyEntry.actions[0].queueSettings.fallback.addAction(fallbackAction);
        }
        if (angular.isUndefined(vm.menuKeyEntry.actions[0].queueSettings.maxWaitTime)) {
          vm.menuKeyEntry.actions[0].queueSettings.maxWaitTime = maxWaitTime;
        }
      }

      populateUiModel();
    }
    activate();
  }
})();
