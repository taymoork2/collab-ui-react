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
  var expectedDayGroup = {
    hours: [{
      starttime: '',
      endtime: ''
    }],
    label: ''
  };
  var dtStr = '04/11/2016';
  var defaultRange = getJSONFixture('huron/json/autoAttendant/defaultDays.json');
  var hours = angular.copy(defaultRange);
  var hours1 = angular.copy(defaultRange);

  hours.starttime = moment(dtStr).set('hour', '8').set('minute', '00');
  hours.endtime = moment(dtStr).set('hour', '17').set('minute', '00');
  openhours.hours.push(hours);

  var hh = moment(dtStr).set('hour', '00').set('minute', '00');
  var endhh = moment(dtStr).set('hour', '23').set('minute', '59');

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
      controller.activate();
      $scope.$apply();

      expectedDayGroup.label = moment().weekday(4).format('dddd') + ' - ' + moment().weekday(7).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hours.starttime).format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(hours.endtime).format('hh:mm a');

      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });

    it('should have the lane report for closedHours for both active and inactive days info', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();

      expectedDayGroup.label = moment().weekday(1).format('dddd') + ' - ' + moment().weekday(3).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hh).format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(endhh).format('hh:mm a');

      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);

      expectedDayGroup.label = moment().weekday(4).format('dddd') + ' - ' + moment().weekday(7).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hh).format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(hours.starttime).subtract(1, 'm').format('hh:mm a');
      var starttime = moment(hours.endtime).add(1, 'm').format('hh:mm a');
      var endtime = moment(endhh).format('hh:mm a');
      expectedDayGroup.hours.push({
        starttime: starttime,
        endtime: endtime
      });

      expect(controller.dayGroup[1]).toEqual(expectedDayGroup);
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
      hours.starttime = moment(dtStr).set('hour', '00').set('minute', '00');
      hours.endtime = moment(dtStr).set('hour', '23').set('minute', '59');
      openhours.hours.push(hours);
      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for closedHours excluding 24Hours days', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();

      var expectedDayGroup = {
        hours: [{
          starttime: '',
          endtime: ''
        }],
        label: ''
      };
      expectedDayGroup.label = moment().weekday(1).format('dddd') + ' - ' + moment().weekday(3).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hh).format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(endhh).format('hh:mm a');

      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
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
      hours = angular.copy(defaultRange);
      for (var i = 0; i <= 6; i++) {
        hours.days[i].active = false;
      }
      hours.days[0].active = true;
      hours.starttime = moment(dtStr).set('hour', '00').set('minute', '00');
      hours.endtime = moment(dtStr).set('hour', '14').set('minute', '00');
      openhours.hours.push(hours);
      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for closedHours for starttime 0 hours', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();

      var expectedDayGroup = {
        hours: [{
          starttime: '',
          endtime: ''
        }],
        label: ''
      };

      expectedDayGroup.label = moment().weekday(1).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hours.endtime).add('1', 'm').format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(endhh).format('hh:mm a');

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

      expectedDayGroup.label = moment().weekday(1).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hours.endtime).add('1', 'm').format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(endhh).format('hh:mm a');

      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });
  });

  describe('prepareDayHourReport closedHours schedule with consolidated hours', function () {
    beforeEach(function () {
      $scope.schedule = 'closedHours';
      controller.days = [];
      var openhours = {
        hours: [],
        holidays: []
      };
      hours = angular.copy(defaultRange);
      hours1 = angular.copy(defaultRange);
      for (var i = 0; i <= 6; i++) {
        hours.days[i].active = false;
        hours1.days[i].active = false;
      }
      hours.days[0].active = true;
      hours1.days[0].active = true;

      hours.starttime = moment(dtStr).set('hour', '8').set('minute', '00');
      hours.endtime = moment(dtStr).set('hour', '12').set('minute', '00');
      openhours.hours.push(hours);

      hours1.starttime = moment(dtStr).set('hour', '13').set('minute', '00');
      hours1.endtime = moment(dtStr).set('hour', '17').set('minute', '00');
      openhours.hours.push(hours1);

      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for closedHours with lunch hour as closed', function () {
      controller.activate();
      $scope.$apply();

      var expectedDayGroup = {
        hours: [{
          starttime: '',
          endtime: ''
        }],
        label: ''
      };

      // Sample Expected value
      //   Monday  '12:00am - 7:59am'
      //           '12:01pm - 12:59pm'
      //           '05:01pm - 11:59pm'

      expectedDayGroup.label = moment().weekday(1).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hh).format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(hours.starttime).subtract(1, 'm').format('hh:mm a');
      var starttime = moment(hours.endtime).add(1, 'm').format('hh:mm a');
      var endtime = moment(hours1.starttime).subtract(1, 'm').format('hh:mm a');
      expectedDayGroup.hours.push({
        starttime: starttime,
        endtime: endtime
      });
      starttime = moment(hours1.endtime).add(1, 'm').format('hh:mm a');
      endtime = moment(endhh).format('hh:mm a');
      expectedDayGroup.hours.push({
        starttime: starttime,
        endtime: endtime
      });

      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup).toBeTruthy();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });
  });

  describe('prepareDayHourReport closedHours schedule with consolidated hours', function () {
    beforeEach(function () {
      $scope.schedule = 'closedHours';
      controller.days = [];
      var openhours = {
        hours: [],
        holidays: []
      };
      hours = angular.copy(defaultRange);
      hours1 = angular.copy(defaultRange);
      for (var i = 0; i <= 6; i++) {
        hours.days[i].active = false;
        hours1.days[i].active = false;
      }
      hours.days[0].active = true;
      hours1.days[0].active = true;

      hours.starttime = moment(dtStr).set('hour', '8').set('minute', '00');
      hours.endtime = moment(dtStr).set('hour', '12').set('minute', '00');
      openhours.hours.push(hours);

      hours1.starttime = moment(dtStr).set('hour', '11').set('minute', '00');
      hours1.endtime = moment(dtStr).set('hour', '17').set('minute', '00');
      openhours.hours.push(hours1);

      AAICalService.getHoursRanges.and.returnValue(openhours);
    });

    it('should have the lane report for closedHours with consolidated entries', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();

      var expectedDayGroup = {
        hours: [{
          starttime: '',
          endtime: ''
        }],
        label: ''
      };

      // Sample Expected value
      //   Monday  '12:00am - 7:59am'
      //           '06:01pm - 11:59pm'

      expectedDayGroup.label = moment().weekday(1).format('dddd');
      expectedDayGroup.hours[0].starttime = moment(hh).format('hh:mm a');
      expectedDayGroup.hours[0].endtime = moment(hours.starttime).subtract(1, 'm').format('hh:mm a');
      var starttime = moment(hours1.endtime).add(1, 'm').format('hh:mm a');
      var endtime = moment(endhh).format('hh:mm a');
      expectedDayGroup.hours.push({
        starttime: starttime,
        endtime: endtime
      });

      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup[0]).toEqual(expectedDayGroup);
    });
  });

  describe('prepareDayHourReport with holidays', function () {
    beforeEach(function () {
      $scope.schedule = 'holidays';
      controller.days = [];
      var starttime = moment(dtStr).set('hour', '00').set('minute', '00');
      var endtime = moment(dtStr).set('hour', '14').set('minute', '00');

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
