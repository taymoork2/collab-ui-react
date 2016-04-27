(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleImportCtrl', AAScheduleImportCtrl);

  /* @ngInject */
  function AAScheduleImportCtrl($modalInstance, AACalendarService, AAICalService, AAModelService, $translate, Notification) {

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
      var aaModel = AAModelService.getAAModel();

      var aaRecordScheduleID = aaModel.aaRecord.scheduleId;

      AACalendarService.listCalendars().then(function (data) {
        vm.options = _.map(_.filter(data, function (obj) {
          var scheduleID;

          /* remove bad URLs here */
          if (!obj.scheduleUrl) {
            return false;
          }

          scheduleID = obj.scheduleUrl.split('/schedules/')[1];

          if (scheduleID && scheduleID.localeCompare(aaRecordScheduleID) !== 0) {
            return true;
          }

          return false;

        }), function (obj) {
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
