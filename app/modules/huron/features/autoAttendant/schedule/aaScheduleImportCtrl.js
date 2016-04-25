(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleImportCtrl', AAScheduleImportCtrl);

  /* @ngInject */
  function AAScheduleImportCtrl($modalInstance, $stateParams, AACalendarService, AAICalService, AAModelService, $translate, Notification) {

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
      var aaName = $stateParams.aaName;

      AACalendarService.listCalendars().then(function (data) {
        vm.options = _.map(data, function (obj) {
          if (obj.scheduleName.localeCompare(aaName) !== 0) {
            return {
              label: obj.scheduleName,
              value: obj.scheduleUrl.split('/schedules/')[1]
            };
          }
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
