'use strict';

describe('Controller: AAScheduleInfoCtrl', function () {

  var controller;
  var AACalendarService, AAModelService, AAICalService;
  var $rootScope, $scope, $q;
  var calendar = getJSONFixture('huron/json/autoAttendant/aCalendar.json');
  var aaModel = {
    aaRecord: {
      scheduleId: '1',
      callExperienceName: 'AA1'
    },
    aaRecordUUID: '1111',
    ceInfos: []
  };
  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2'
    }
  };
  var openhours = {
    hours: [],
    holidays: []
  };
  var defaultRange = getJSONFixture('huron/json/autoAttendant/defaultDays.json');
  var hours = defaultRange;
  hours.starttime = moment().set('hour', '8').set('minute', '00');
  hours.endtime = moment().set('hour', '17').set('minute', '00');
  openhours.hours.push(hours);

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller, _$q_, $rootScope, _AACalendarService_, _AAModelService_, _AAICalService_) {
    $scope = $rootScope.$new();
    $q = _$q_;

    AACalendarService = _AACalendarService_;
    AAModelService = _AAModelService_;
    AAICalService = _AAICalService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when());
    spyOn(AAICalService, 'getDefaultRange').and.returnValue(defaultRange);
    spyOn(AAICalService, 'getHoursRanges').and.returnValue(angular.copy(openhours));
    controller = $controller('AAScheduleInfoCtrl as vm', {
      $scope: $scope,
      AACalendarService: AACalendarService,
      AAICalService: AAICalService,
      AAModelService: AAModelService
    });
    $scope.$apply();
  }));

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });

  describe('prepareDayHourReport', function () {
    beforeEach(function () {
      $scope.schedule = 'openHours';
    });

    it('should have the lane report for openHours for active days', function () {
      var expectedDayGroup = {
        hours: [{
          starttime: '08:00 am',
          endtime: '05:00 pm'
        }],
        label: 'Thursday - Friday'
      };
      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });

    it('should have the lane report for closedHours with multiple hours info', function () {
      $scope.schedule = 'closedHours';
      var expectedDayGroup = {
        hours: [{
          starttime: '12:00 am',
          endtime: '11:59 pm'
        }],
        label: 'Monday,Tuesday,Wednesday,Saturday,Sunday'
      };
      var expectedDayGroup2 = {
        hours: [{
          starttime: '12:00 am',
          endtime: '07:59 am'
        }, {
          starttime: '05:01 pm',
          endtime: '11:59 pm'
        }],
        label: 'Thursday - Friday'
      };
      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
      expect(controller.dayGroup[1]).toEqual(expectedDayGroup2);

    });

    it('should have the lane report for closedHours for inactive days', function () {
      $scope.schedule = 'closedHours';
      var expectedDayGroup = {
        hours: [{
          starttime: '12:00 am',
          endtime: '11:59 pm'
        }],
        label: 'Monday,Tuesday,Wednesday,Saturday,Sunday'
      };

      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);

    });
  });

  describe('prepareDayHourReport with few days of 24 hours schedule', function () {
    beforeEach(function () {
      $scope.schedule = 'closedHours';
      controller.days = [];
      var openhours = {
        hours: [],
        holidays: []
      };
      var hours = defaultRange;
      hours.starttime = moment().set('hour', '00').set('minute', '00');
      hours.endtime = moment().set('hour', '23').set('minute', '59');
      openhours.hours.push(hours);
      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for closedHours excluding 24Hours days', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();
      var expectedDayGroup = {
        hours: [{
          starttime: '12:00 am',
          endtime: '11:59 pm'
        }],
        label: 'Monday,Tuesday,Wednesday,Saturday,Sunday'
      };
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup).toBeTruthy();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });
  });

  describe('prepareDayHourReport closedHours schedule for starttime 0 hours', function () {
    beforeEach(function () {
      $scope.schedule = 'closedHours';
      controller.days = [];
      var openhours = {
        hours: [],
        holidays: []
      };
      var hours = defaultRange;
      for (var i = 0; i <= 6; i++) {
        hours.days[i].active = false;
      }
      hours.days[0].active = true;
      hours.starttime = moment().set('hour', '00').set('minute', '00');
      hours.endtime = moment().set('hour', '14').set('minute', '00');
      openhours.hours.push(hours);
      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for closedHours for starttime 0 hours', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();
      var expectedDayGroup = {
        hours: [{
          starttime: '02:01 pm',
          endtime: '11:59 pm'
        }],
        label: 'Monday'
      };
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup).toBeTruthy();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });

    it('should have the lane report for closedHours without duplicate entries', function () {
      $scope.schedule = 'closedHours';
      openhours.hours.push(hours);
      AAICalService.getHoursRanges.and.returnValue(openhours);
      controller.activate();
      $scope.$apply();
      var expectedDayGroup = {
        hours: [{
          starttime: '02:01 pm',
          endtime: '11:59 pm'
        }],
        label: 'Monday'
      };
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });
  });

  describe('prepareDayHourReport with holidays', function () {
    beforeEach(function () {
      $scope.schedule = 'holidays';
      controller.days = [];
      var starttime = moment().set('hour', '00').set('minute', '00');
      var endtime = moment().set('hour', '14').set('minute', '00');

      var openhours = {
        hours: [],
        holidays: [{
          name: 'Thanksgiving',
          date: moment(),
          starttime: starttime,
          endtime: endtime
        }]
      };
      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for Holidays', function () {
      $scope.schedule = 'holidays';
      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup).toBeTruthy();
      expect(controller.holidays).toBeTruthy();
    });
  });
});
