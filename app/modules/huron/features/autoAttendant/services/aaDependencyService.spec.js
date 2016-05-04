'use strict';

describe('Service: AADependencyService', function () {

  var $q, $rootScope, AACalendarService, AADependencyService, AANotificationService;
  var updateCalendarNameDeferred;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));
  beforeEach(inject(function (_$q_, _$rootScope_, _AACalendarService_, _AADependencyService_, _AANotificationService_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    AACalendarService = _AACalendarService_;
    AADependencyService = _AADependencyService_;
    AANotificationService = _AANotificationService_;
  }));

  describe('notifyAANameChange', function () {
    var event = {
      type: 'AANameChange',
      scheduleId: '123',
      newName: 'AA'
    };

    beforeEach(function () {
      spyOn(AACalendarService, 'updateCalendarName').and.returnValue($q.when());
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'errorResponse');
    });

    it('should invoke notifyScheduleDependent with SUCCESS', function () {
      var notifyResponse;
      var notifyPromise = AADependencyService.notifyAANameChange(event);
      notifyPromise.then(function (response) {
        notifyResponse = response;
      });

      $rootScope.$apply();
      expect(AANotificationService.error).not.toHaveBeenCalled();
      expect(AANotificationService.errorResponse).not.toHaveBeenCalled();
      expect(notifyResponse).toBe(event);
    });
  });

  describe('notifyScheduleDependent', function () {

    beforeEach(function () {
      updateCalendarNameDeferred = $q.defer();
      spyOn(AACalendarService, 'updateCalendarName').and.returnValue(updateCalendarNameDeferred.promise);
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'errorResponse');
    });

    it('should invoke AACalendarService.updateCalendarName with SUCCESS', function () {
      var event = {
        type: 'AANameChange',
        scheduleId: '123',
        newName: 'AA'
      };
      var notifyResponse;

      updateCalendarNameDeferred.resolve();
      var notifyRes = AADependencyService.notifyScheduleDependent(event);
      notifyRes.then(function (response) {
        notifyResponse = response;
      });

      $rootScope.$apply();

      expect(AANotificationService.error).not.toHaveBeenCalled();
      expect(AACalendarService.updateCalendarName).toHaveBeenCalled();
      expect(AANotificationService.errorResponse).not.toHaveBeenCalled();
      expect(notifyResponse).toBe(event);
    });

    it('should return a failure response if AACalendarService.updateCalendarName failed', function () {
      var event = {
        type: 'AANameChange',
        scheduleId: '123',
        newName: 'AA'
      };
      var error = {
        statusText: 'error',
        status: '500'
      };

      var notifyResponse;

      updateCalendarNameDeferred.reject(error);

      var notifyRes = AADependencyService.notifyScheduleDependent(event);
      notifyRes.catch(function (error) {
        notifyResponse = error;
      });

      $rootScope.$apply();

      expect(AANotificationService.error).not.toHaveBeenCalled();
      expect(AACalendarService.updateCalendarName).toHaveBeenCalled();
      expect(AANotificationService.errorResponse).toHaveBeenCalled();
      expect(notifyResponse).toBe(error);
    });

    it('should return a failure response if input event is incomplete', function () {
      var event = {
        type: 'AANameChange',
        scheduleId: '',
        newName: 'AA'
      };
      var error = 'SCHEDULE_NAME_CHANGE_FAILED';

      var notifyResponse;

      updateCalendarNameDeferred.reject(error);

      var notifyRes = AADependencyService.notifyScheduleDependent(event);
      notifyRes.catch(function (error) {
        notifyResponse = error;
      });

      $rootScope.$apply();

      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AACalendarService.updateCalendarName).not.toHaveBeenCalled();
      expect(AANotificationService.errorResponse).not.toHaveBeenCalled();
      expect(notifyResponse).toBe(error);
    });

    it('should return a failure response if input event is incomplete', function () {
      var event = {
        type: 'AANameChange',
        scheduleId: '123',
        newName: ''
      };
      var error = 'SCHEDULE_NAME_CHANGE_FAILED';

      var notifyResponse;

      updateCalendarNameDeferred.reject(error);

      var notifyRes = AADependencyService.notifyScheduleDependent(event);
      notifyRes.catch(function (error) {
        notifyResponse = error;
      });

      $rootScope.$apply();

      expect(AANotificationService.error).toHaveBeenCalled();
      expect(AACalendarService.updateCalendarName).not.toHaveBeenCalled();
      expect(AANotificationService.errorResponse).not.toHaveBeenCalled();
      expect(notifyResponse).toBe(error);
    });
  });

});
