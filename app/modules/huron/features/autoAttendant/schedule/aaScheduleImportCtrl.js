(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleImportCtrl', AAScheduleImportCtrl);

  /* @ngInject */
  function AAScheduleImportCtrl($modalInstance, Analytics, AAMetricNameService, AACalendarService, AAICalService, AAModelService, $translate, AANotificationService) {

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
        //where the copy schedule modal is open && user selected AA + clicked 'continue'
        var type = 'continue';
        //register the metric property of 'continue' to Analytics
        Analytics.trackEvent(AAMetricNameService.IMPORT_SCHEDULE_FEATURE, {
          type: type
        });
      });
    }

    function activate() {
      var aaModel = AAModelService.getAAModel();

      var aaRecordScheduleID = aaModel.aaRecord.scheduleId;

      AACalendarService.listCalendars().then(function (data) {
        var filtered = _.filter(data, function (obj) {
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

        });

        vm.options = _.map(filtered, function (obj) {
          return {
            label: obj.scheduleName,
            value: obj.scheduleUrl.split('/schedules/')[1]
          };
        });

        // Sort the schedule names using case-insensitive
        vm.options = _.sortBy(vm.options,
          function (covertToLowerCase) {
            return covertToLowerCase.label.toLowerCase();
          });

      }, function (response) {
        if (response.status !== 404) {
          AANotificationService.error('autoAttendant.failureImport', {
            status: response.status
          });
        }
      });
      //on event trigger 'copy schedule'
      var type = 'open';
      //register the metric propety of 'open' to Analytics
      Analytics.trackEvent(AAMetricNameService.IMPORT_SCHEDULE_FEATURE, {
        type: type
      });
    }

    activate();
  }
})();
