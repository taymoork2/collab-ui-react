(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderContainerCtrl', AABuilderContainerCtrl); /* was AutoAttendanMenuCtrl */

  /* @ngInject */
  function AABuilderContainerCtrl($scope, $stateParams, $translate, AutoAttendantCeInfoModelService,
    AutoAttendantCeMenuModelService, AutoAttendantCeService, AAModelService, Notification) {

    var vm = this;
    vm.aaModel = {};
    vm.ui = {};
    vm.ui.ceInfo = {};

    vm.scheduleTitle = "";
    vm.getScheduleTitle = getScheduleTitle;

    vm.openHours = true;
    vm.openHourActions = {};

    vm.closedHours = false;
    vm.closedHourActions = {};

    vm.holidays = false;
    vm.holidayActions = {};

    /////////////////////

    function getScheduleTitle() {
      if (!vm.closedHours && !vm.holidays) {
        return "autoAttendant.scheduleAllDay";
      }

      return "autoAttendant.schedule";
    }

    function setOpenHourActions() {
      vm.openHourActions = AutoAttendantCeMenuModelService.newCeMenu();
      vm.openHourActions.setType('MENU_WELCOME');

      var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      var menuAction = AutoAttendantCeMenuModelService.newCeActionEntry('disconnect', vm.disconnectDefault);
      menuEntry.isConfigured = false;
      menuEntry.addAction(menuAction);
      vm.openHourActions.addEntry(menuEntry);
    }

    function setClosedHourActions() {

    }

    function setHolidayActions() {

    }

    function addAction(schedule, action) {

    }

    function removeAction(schedule, action) {

    }

    function selectAA(aaName) {
      vm.aaModel.aaName = aaName;
      if (angular.isUndefined(vm.aaModel.aaRecord)) {
        if (aaName === '') {
          vm.aaModel.aaRecord = AAModelService.newAARecord();
        } else {
          for (var i = 0; i < vm.aaModel.aaRecords.length; i++) {
            if (vm.aaModel.aaRecords[i].callExperienceName === aaName) {
              // vm.aaModel.aaRecord = angular.copy(vm.aaModel.aaRecords[i]);
              AutoAttendantCeService.readCe(
                vm.aaModel.aaRecords[i].callExperienceURL).then(
                function (data) {
                  vm.aaModel.aaRecord = data;

                  // Workaround for reading the dn number: by copying it from aaRecords[i], until
                  // dn number is officialy stored in ceDefintion.
                  vm.aaModel.aaRecord.assignedResources = angular.copy(vm.aaModel.aaRecords[i].assignedResources);
                },
                function (response) {
                  Notification.notify([$translate.instant('autoAttendant.errorReadCe', {
                    name: aaName,
                    statusText: response.statusText,
                    status: response.status
                  })], 'error');
                });
              return;
            }
          }
        }
      }
    }

    function activate() {
      var aaName = $stateParams.aaName;
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = $scope.aa.modal;

      vm.aaModel.dataReadyPromise.then(function (data) {
        selectAA(aaName);
      }, function (data) {
        selectAA(aaName);
      });

      setOpenHourActions();
      setClosedHourActions();
      setHolidayActions();
    }

    activate();
  }
})();
