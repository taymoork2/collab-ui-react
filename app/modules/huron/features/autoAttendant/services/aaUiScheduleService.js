(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUiScheduleService', AAUiScheduleService);

  /* @ngInject */
  function AAUiScheduleService($q, AutoAttendantCeInfoModelService, AACalendarService, AAICalService) {

    var service = {
      create8To5Schedule: create8To5Schedule
    };

    return service;

    /////////////////////

    function getRange8To5() {
      var calendar = AAICalService.createCalendar();
      var _starttime = "08:00 AM";
      var _endtime = "05:00 PM";
      var openhours = AAICalService.getDefaultRange();
      openhours.starttime = _starttime;
      openhours.endtime = _endtime;
      _.each(openhours.days, function (day) {
        if (day.abbr != "SU" && day.abbr != "SA") {
          day.active = true;
        }
      });
      var defaultRange = [openhours];
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

    function create8To5Schedule(ceName) {
      var defaultSchedule = getRange8To5();
      return createSchedule(ceName, defaultSchedule);
    }
  }
})();
