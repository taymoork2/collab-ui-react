(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACalendarService', AACalendarService);

  /* @ngInject */
  function AACalendarService(calendarService, Authinfo) {

    var service = {
      listCalendars: listCalendars,
      readCalendar: readCalendar,
      createCalendar: createCalendar,
      updateCalendar: updateCalendar,
      deleteCalendar: deleteCalendar,
      readSchedules: readSchedules
    };

    return service;

    /////////////////////

    function listCalendars() {
      return calendarService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

    function readCalendar(aCalendarId) {
      return calendarService.get({
        customerId: Authinfo.getOrgId(),
        scheduleId: aCalendarId
      }).$promise;
    }

    function readSchedules() {
      return calendarService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

    function createCalendar(calendarName, iCalendarDefinition) {

      var data = {
        scheduleData: iCalendarDefinition,
        scheduleName: calendarName
      };

      return calendarService.save({
          customerId: Authinfo.getOrgId()
        },
        data
      ).$promise;
    }

    function updateCalendar(aCalendarId, calendarName, iCalendarDefinition) {

      var data = {
        scheduleData: iCalendarDefinition,
        scheduleName: calendarName
      };

      return calendarService.update({
          customerId: Authinfo.getOrgId(),
          scheduleId: aCalendarId
        },
        data
      ).$promise;
    }

    function deleteCalendar(aCalendarId) {
      return calendarService.delete({
        customerId: Authinfo.getOrgId(),
        scheduleId: aCalendarId
      }).$promise;

    }

  }
})();
