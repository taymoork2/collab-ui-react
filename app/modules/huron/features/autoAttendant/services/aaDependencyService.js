(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AADependencyService', AADependencyService);

  /* @ngInject */
  function AADependencyService($q, AACalendarService, AANotificationService) {
    return {
      notifyAANameChange: notifyAANameChange,
      notifyScheduleDependent: notifyScheduleDependent
    };

    function notifyAANameChange(event) {
      // If there are more dependents interested in AANameChange, chain them together as follows:
      // notifyScheduleDependent(event).then(notifyXxxDependent).then(notifyXxx2Dependent);
      // If notifyXxxDependent is executed with a failed response, subsequent notifications will not be executed.
      return notifyScheduleDependent(event);
    }

    function notifyScheduleDependent(event) {
      var deferred = $q.defer();
      if (event.type === 'AANameChange') {
        // If any required input in the event is missing, simply ignore the notification and pass it on
        // to the next dependent.
        if (!event.newName || !event.scheduleId) {
          deferred.resolve(event);
          return deferred.promise;
        }
        AACalendarService.updateCalendarName(event.scheduleId, event.newName).then(function (data) {
          deferred.resolve(event);
        }, function (error) {
          AANotificationService.errorResponse(error, 'autoAttendant.errorUpdateScheduleName', {
            name: event.newName,
            statusText: error.statusText,
            status: error.status
          });
          deferred.reject(error);
        });
        return deferred.promise;
      }
      deferred.resolve(event);
      return deferred.promise;
    }

  }
})();
