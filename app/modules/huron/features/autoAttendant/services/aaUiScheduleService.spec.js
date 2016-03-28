'use strict';

describe('Service: AAUiScheduleService', function () {
  var $q, $scope, $rootScope, AAUiScheduleService, AAICalService, AutoAttendantCeInfoModelService, AACalendarService;
  var Notification;

  function getRange9To5() {
    var calendar = AAICalService.createCalendar();
    var _starttime = new Date('', '', '', '09', '00', '00');
    var _endtime = new Date('', '', '', '17', '00', '00');
    var defaultRange = [{
      days: [{
        label: 'Monday',
        active: true
      }, {
        label: 'Tuesday',
        active: true
      }, {
        label: 'Wednesday',
        active: true
      }, {
        label: 'Thursday',
        active: true
      }, {
        label: 'Friday',
        active: true
      }, {
        label: 'Saturday',
        active: false
      }, {
        label: 'Sunday',
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

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$q_, _$rootScope_, _Notification_, _AAUiScheduleService_, _AAICalService_, _AutoAttendantCeInfoModelService_, _AACalendarService_) {
    Notification = _Notification_;
    AAUiScheduleService = _AAUiScheduleService_;
    AAICalService = _AAICalService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AACalendarService = _AACalendarService_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  describe('create9To5Schedule', function () {

    beforeEach(inject(function () {
      // setup the promises
      createCalendarDefer = $q.defer();

      spyOn(AACalendarService, 'createCalendar').and.returnValue(createCalendarDefer.promise);
      spyOn(Notification, 'error');

      scheduleId = undefined;
      AAUiScheduleService.create9To5Schedule('AA').then(function (value) {
        scheduleId = value;
      }, function (response) {
        Notification.error('autoAttendant.errorCreateCe', {
          name: 'AA',
          statusText: response.statusText,
          status: response.status
        });
      });
    }));

    it('should create 9 to 5, Monday to Friday schedule', function () {
      expect(scheduleId).toBeUndefined();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('AA', getRange9To5());
      createCalendarDefer.resolve(createCalendarSuccess);

      $scope.$apply();

      expect(scheduleId).toEqual(scheduleIdSuccess);

    });

    it('should should return failure gracefully with a status', function () {
      expect(scheduleId).toBeUndefined();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('AA', getRange9To5());
      createCalendarDefer.reject({
        statusText: 'failure',
        status: '500'
      });

      $scope.$apply();
      expect(scheduleId).toEqual(undefined);
      expect(Notification.error).toHaveBeenCalled();
    });
  });
});
