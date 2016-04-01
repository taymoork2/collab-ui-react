'use strict';

// fdescribe('Controller: AAScheduleInfoCtrl', function () {
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
  var starttime = moment();
  var endtime = moment(starttime).add(8, 'h');
  var openhours = [];
  var defaultRange = getJSONFixture('huron/json/autoAttendant/defaultDays.json');
  var hours = defaultRange;
  hours.starttime = starttime;
  hours.endtime = endtime;
  openhours.push(hours);

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
    spyOn(AAICalService, 'getHoursRanges').and.returnValue($q.when(angular.copy(openhours)));

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
      var error = false;
    });

    it('should have the lane report for openHours', function () {
      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup).toBeTruthy();
    });

    it('should have the lane report for closedHours', function () {
      $scope.schedule = 'closedHours';
      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup).toBeTruthy();
    });

    it('should not have the lane report for open/closedHours', function () {
      $scope.schedule = 'closedHours';
      $scope.openhours = [];
      controller.activate();
      $scope.$apply();
      expect(AACalendarService.readCalendar).toHaveBeenCalled();
      expect(AAICalService.getHoursRanges).toHaveBeenCalled();
      expect(controller.dayGroup.hours).toBeFalsy();
    });

  });
});
