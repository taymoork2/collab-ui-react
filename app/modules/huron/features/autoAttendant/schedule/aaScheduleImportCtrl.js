(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleImportCtrl', AAScheduleImportCtrl);

  /* @ngInject */
  function AAScheduleImportCtrl($modalInstance, AACalendarService, AAICalService, AAModelService, $translate) {

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
      AACalendarService.listCalendars().then(function (data) {
        vm.options = _.map(data, function (obj) {
          return {
            label: obj.scheduleName.split('Calendar for ')[1],
            value: obj.scheduleUrl.split('/schedules/')[1]
          };
        });
      });
    }

    activate();
  }
})();
