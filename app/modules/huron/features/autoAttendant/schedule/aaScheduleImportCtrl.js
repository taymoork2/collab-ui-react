(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleImportCtrl', AAScheduleImportCtrl);

  /* @ngInject */
  function AAScheduleImportCtrl($modalInstance, AutoAttendantCeInfoModelService, AutoAttendantCeService, AACalendarService, AAICalService, AAModelService, $translate) {

    var vm = this;
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectAA');
    vm.options = [];
    vm.continueImport = continueImport;

    function continueImport() {
      AACalendarService.readCalendar(vm.selected.value).then(function (calendar) {
        var allHours = AAICalService.getHoursRanges(calendar);
        $modalInstance.close(allHours);
      });
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      AACalendarService.readSchedules().then(function (data) {
        data.forEach(function (value) {
          var obj = {};
          obj.label = value.scheduleName.split('Calendar for ')[1];
          obj.value = value.scheduleUrl.split('/schedules/')[1];
          vm.options.push(obj);
        });
      });
    }

    activate();
  }
})();
