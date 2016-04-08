(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUiScheduleService', AAUiScheduleService);

  /* @ngInject */
  function AAUiScheduleService($q, AutoAttendantCeInfoModelService, AACalendarService, AAICalService) {

    var service = {
      create9To5Schedule: create9To5Schedule
    };

    return service;

    /////////////////////

    function getRange8To5() {
      var calendar = AAICalService.createCalendar();
      var _starttime = new Date('', '', '', '08', '00', '00');
      var _endtime = new Date('', '', '', '17', '00', '00');
      var defaultRange = [{
        days: [{
          label: 'Monday',
          index: 1,
          active: true
        }, {
          label: 'Tuesday',
          index: 2,
          active: true
        }, {
          label: 'Wednesday',
          index: 3,
          active: true
        }, {
          label: 'Thursday',
          index: 4,
          active: true
        }, {
          label: 'Friday',
          index: 5,
          active: true
        }, {
          label: 'Saturday',
          index: 6,
          active: false
        }, {
          label: 'Sunday',
          index: 0,
          active: false
        }],
        starttime: _starttime,
        endtime: _endtime
      }];
      _.each(defaultRange, function (hours) {
        AAICalService.addHoursRange('open', calendar, hours);
      });
      return calendar.toString();
    }

    function createSchedule(ceName, calendar) {
      var calName = ceName;
      var deferred = $q.defer();
      AACalendarService.createCalendar(calName, calendar).then(
        function (response) {
          var scheduleId = AutoAttendantCeInfoModelService.extractUUID(response.scheduleUrl);
          deferred.resolve(scheduleId);
        },
        function (response) {
          deferred.reject(response);
        });
      return deferred.promise;
    }

    function create9To5Schedule(ceName) {
      var defaultSchedule = getRange8To5();
      return createSchedule(ceName, defaultSchedule);
    }
  }
})();
