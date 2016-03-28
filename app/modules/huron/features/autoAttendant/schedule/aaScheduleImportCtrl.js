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
    vm.selected = {
      value: '',
      label: ''
    };

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
            label: obj.scheduleName,
            value: obj.scheduleUrl.split('/schedules/')[1]
          };
        });
      }, function (response) {
        if (response.status !== 404) {
          Notification.error('autoAttendant.failureImport', {
            status: response.status
          });
        }
      });
    }

    activate();
  }
})();
