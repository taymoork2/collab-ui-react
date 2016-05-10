(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteToQueueCtrl', AARouteToQueueCtrl);

  /* @ngInject */
  function AARouteToQueueCtrl($scope, $translate, QueueHelperService, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;

    vm.queueSelected = {
      description: '',
      id: ''
    };

    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.queues = [];

    vm.aaModel = {};
    vm.uiMenu = {};
    vm.menuEntry = {
      entries: []
    };
    vm.menuKeyEntry = {};

    vm.populateUiModel = populateUiModel;
    vm.saveUiModel = saveUiModel;

    var rtQueue = 'routeToQueue';

    var fromRouteCall = false;

    /////////////////////

    function populateUiModel() {

      if (fromRouteCall) {
        vm.queueSelected.id = vm.menuEntry.actions[0].getValue();
      } else {
        vm.queueSelected.id = vm.menuKeyEntry.actions[0].getValue();
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

    function getQueues() {

      return QueueHelperService.listQueues().then(function (queuePool) {
        _.each(queuePool, function (aaQueueList) {
          vm.queues.push({
            description: aaQueueList.name,
            id: aaQueueList.id
          });
        });
      });

    }

    function activate() {

      vm.aaModel = AAModelService.getAAModel();
      var ui = AAUiModelService.getUiModel();

      vm.uiMenu = ui[$scope.schedule];

      vm.menuEntry = vm.uiMenu.entries[$scope.index];

      if ($scope.fromRouteCall) {
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
        if ($scope.keyIndex < vm.menuEntry.entries.length) {
          vm.menuKeyEntry = vm.menuEntry.entries[$scope.keyIndex];
        } else {
          vm.menuKeyEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
          var action = AutoAttendantCeMenuModelService.newCeActionEntry(rtQueue, '');
          vm.menuKeyEntry.addAction(action);
        }

      }

      getQueues().then(function () {
        populateUiModel();
      });

    }

    activate();

  }
})();
