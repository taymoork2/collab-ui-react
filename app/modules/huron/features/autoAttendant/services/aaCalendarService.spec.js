'use strict';

describe('Service: AACalendarService', function () {
  var AACalendarService, $httpBackend, HuronConfig, url, scheduleURL, calendarId;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var calendars = getJSONFixture('huron/json/autoAttendant/calendars.json');
  var calendar = getJSONFixture('huron/json/autoAttendant/aCalendar.json');

  var successSpy;
  var failureSpy;

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_AACalendarService_, _$httpBackend_, _HuronConfig_) {
    AACalendarService = _AACalendarService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    url = HuronConfig.getCesUrl() + '/customers/' + Authinfo.getOrgId() + '/schedules';
    calendarId = '004';
    scheduleURL = url + '/' + calendarId;

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('listCalendars', function () {
    it('should list all calendars', function () {
      $httpBackend.whenGET(url).respond(calendars);
      AACalendarService.listCalendars().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], calendars)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenGET(url).respond(404);
      AACalendarService.listCalendars().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(url).respond(500);
      AACalendarService.listCalendars().then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('readCalendar', function () {
    it('should notify on success', function () {
      $httpBackend.whenGET(scheduleURL).respond(200, calendar);
      AACalendarService.readCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      var args = successSpy.calls.mostRecent().args;
      expect(angular.equals(args[0], calendar)).toEqual(true);
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenGET(scheduleURL).respond(400);
      AACalendarService.readCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Calendar Not Found Error 404', function () {
      $httpBackend.whenGET(scheduleURL).respond(404);
      AACalendarService.readCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenGET(scheduleURL).respond(500);
      AACalendarService.readCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('createCalendar', function () {
    it('should notify on success', function () {
      $httpBackend.whenPOST(url).respond(201);
      AACalendarService.createCalendar('', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenPOST(url).respond(400);
      AACalendarService.createCalendar('', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenPOST(url).respond(500);
      AACalendarService.createCalendar('', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('updateCalendar', function () {
    it('should notify on success', function () {
      $httpBackend.whenPUT(scheduleURL).respond(200);
      AACalendarService.updateCalendar(calendarId, '', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request Error 400', function () {
      $httpBackend.whenPUT(scheduleURL).respond(400);
      AACalendarService.updateCalendar(calendarId, '', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Calendar Not Found Error 404', function () {
      $httpBackend.whenPUT(scheduleURL).respond(404);
      AACalendarService.updateCalendar(calendarId, '', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server Error 500', function () {
      $httpBackend.whenPUT(scheduleURL).respond(500);
      AACalendarService.updateCalendar(calendarId, '', '').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

  });

  describe('deleteCalendar', function () {
    it('should notify on success', function () {
      $httpBackend.whenDELETE(scheduleURL).respond(204);
      AACalendarService.deleteCalendar(calendarId).then(
        successSpy,
        failureSpy
      );

      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on Bad Request error 400', function () {
      $httpBackend.whenDELETE(scheduleURL).respond(400);
      AACalendarService.deleteCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on CE Not Found error 404', function () {
      $httpBackend.whenDELETE(scheduleURL).respond(404);
      AACalendarService.deleteCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on Internal Server error 500', function () {
      $httpBackend.whenDELETE(scheduleURL).respond(500);
      AACalendarService.deleteCalendar(calendarId).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('updateCalendarName', function () {
    it('should notify on success', function () {
      $httpBackend.whenGET(scheduleURL).respond(200, calendar);
      $httpBackend.whenPUT(scheduleURL).respond(200);
      AACalendarService.updateCalendarName(calendarId, 'AA').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should notify on updateCalendar failure', function () {
      $httpBackend.whenGET(scheduleURL).respond(200, calendar);
      $httpBackend.whenPUT(scheduleURL).respond(500);
      AACalendarService.updateCalendarName(calendarId, 'AA').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });

    it('should notify on readCalendar failure', function () {
      $httpBackend.whenGET(scheduleURL).respond(500);
      AACalendarService.updateCalendarName(calendarId, 'AA').then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

});
