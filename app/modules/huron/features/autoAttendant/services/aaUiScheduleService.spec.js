'use strict';

describe('Service: AAUiScheduleService', function () {
  var $q, $scope, $rootScope, AAUiScheduleService, AAICalService, AutoAttendantCeInfoModelService, AACalendarService;
  var AANotificationService;

  function getRange8To5() {
    var calendar = AAICalService.createCalendar();
    var _starttime = "08:00 AM";
    var _endtime = "05:00 PM";
    var defaultRange = [{
      days: [{
        abbr: 'SU',
        index: 0,
        active: false
      }, {
        abbr: 'MO',
        index: 1,
        active: true
      }, {
        abbr: 'TU',
        index: 2,
        active: true
      }, {
        abbr: 'WE',
        index: 3,
        active: true
      }, {
        abbr: 'TH',
        index: 4,
        active: true
      }, {
        abbr: 'FR',
        index: 5,
        active: true
      }, {
        abbr: 'SAy',
        index: 6,
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

  var createCalendarSuccess = {
    "scheduleUrl": "https://ces.huron-int.com/api/v1/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/schedules/b8e9b7f9-dcd2-4203-90c4-d392caca3afc"
  };
  var scheduleIdSuccess = 'b8e9b7f9-dcd2-4203-90c4-d392caca3afc';

  var createCalendarDefer;
  var scheduleId;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$q_, _$rootScope_, _AANotificationService_, _AAUiScheduleService_, _AAICalService_, _AutoAttendantCeInfoModelService_, _AACalendarService_) {
    AANotificationService = _AANotificationService_;
    AAUiScheduleService = _AAUiScheduleService_;
    AAICalService = _AAICalService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AACalendarService = _AACalendarService_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  describe('create8To5Schedule', function () {

    beforeEach(inject(function () {
      // setup the promises
      createCalendarDefer = $q.defer();

      spyOn(AACalendarService, 'createCalendar').and.returnValue(createCalendarDefer.promise);
      spyOn(AANotificationService, 'error');
      spyOn(AANotificationService, 'errorResponse');

      scheduleId = undefined;
      AAUiScheduleService.create8To5Schedule('AA').then(function (value) {
        scheduleId = value;
      }, function (response) {
        AANotificationService.errorResponse(response, 'autoAttendant.errorCreateCe', {
          name: 'AA',
          statusText: response.statusText,
          status: response.status
        });
      });
    }));

    it('should create 8 to 5, Monday to Friday schedule', function () {
      expect(scheduleId).toBeUndefined();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('AA', getRange8To5());
      createCalendarDefer.resolve(createCalendarSuccess);

      $scope.$apply();

      expect(scheduleId).toEqual(scheduleIdSuccess);

    });

    it('should should return failure gracefully with a status', function () {
      expect(scheduleId).toBeUndefined();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('AA', getRange8To5());
      createCalendarDefer.reject({
        statusText: 'failure',
        status: '500'
      });

      $scope.$apply();
      expect(scheduleId).toEqual(undefined);
      expect(AANotificationService.errorResponse).toHaveBeenCalled();
    });
  });
});
