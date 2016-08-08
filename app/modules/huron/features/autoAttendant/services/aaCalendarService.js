(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACalendarService', AACalendarService);

  /* @ngInject */
  function AACalendarService($q, calendarService, Authinfo) {

    var service = {
      listCalendars: listCalendars,
      readCalendar: readCalendar,
      createCalendar: createCalendar,
      updateCalendar: updateCalendar,
      deleteCalendar: deleteCalendar,
      updateCalendarName: updateCalendarName
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

    function readCalendarHelper(scheduleId, calName) {
      var deferred = $q.defer();
      readCalendar(scheduleId).then(function (data) {
        deferred.resolve({
          scheduleId: scheduleId,
          calName: calName,
          scheduleData: data.scheduleData
        });
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function updateCalendarHelper(cal) {
      var deferred = $q.defer();
      updateCalendar(cal.scheduleId, cal.calName, cal.scheduleData).then(function (data) {
        deferred.resolve(data);
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function updateCalendarName(scheduleId, calName) {
      return readCalendarHelper(scheduleId, calName).then(updateCalendarHelper);
    }

  }
})();
