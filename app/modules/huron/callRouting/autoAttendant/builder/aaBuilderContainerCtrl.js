(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderContainerCtrl', AABuilderContainerCtrl);

  /* @ngInject */
  function AABuilderContainerCtrl($scope, $stateParams, AutoAttendantCeInfoModelService,
    AutoAttendantCeMenuModelService, AutoAttendantCeService, AAModelService) {

    var vm = this;
    vm.aaModel = {};

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

    function activate() {
      var aaName = $stateParams.aaName;
      vm.aaModel = AAModelService.getAAModel();

      setOpenHourActions();
      setClosedHourActions();
      setHolidayActions();
    }

    activate();
  }
})();
