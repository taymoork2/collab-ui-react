'use strict';

describe('Controller: AAScheduleModalCtrl', function () {
  var controller, Notification, AutoAttendantCeService;
  var AACalendarService, AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AAICalService;
  var $rootScope, $scope, $translate, $q, $modalInstance;
  var ical;
  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var aCe = getJSONFixture('huron/json/autoAttendant/aCallExperience.json');
  var calendar = getJSONFixture('huron/json/autoAttendant/aCalendar.json');
  var aaModel = {
    aaRecord: {
      scheduleId: '',
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
  var date = new Date();
  var starttime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0);
  var endtime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0, 0);

  var openhours = [];

  var defaultRange = {
    days: [{
      label: 'Monday',
      active: false
    }, {
      label: 'Tuesday',
      active: false
    }, {
      label: 'Wednesday',
      active: false
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
    }]
  };
  var hours = defaultRange;
  hours.starttime = starttime;
  hours.endtime = endtime;
  openhours.push(hours);

  var rawCeInfo = {
    "callExperienceName": "AA1",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }
  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_ical_, $q, $controller, _$translate_, $rootScope, _Notification_, _AACalendarService_, _AAModelService_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AAICalService_) {
    $translate = _$translate_;
    $scope = $rootScope.$new();
    ical = _ical_;
    $q = $q;
    AACalendarService = _AACalendarService_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAICalService = _AAICalService_;
    AACalendarService = _AACalendarService_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when());
    spyOn(AACalendarService, 'createCalendar').and.returnValue($q.when(calendar));
    spyOn(AACalendarService, 'updateCalendar').and.returnValue($q.when(calendar));
    spyOn(AACalendarService, 'deleteCalendar').and.returnValue($q.when());
    spyOn(AAICalService, 'getDefaultRange').and.returnValue(defaultRange);
    spyOn(AAICalService, 'createCalendar').and.returnValue(new ical.Component('vcalendar'));
    spyOn(AAICalService, 'getHoursRanges').and.returnValue($q.when(angular.copy(openhours)));
    spyOn(AAICalService, 'addHoursRange');
    spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when());

    spyOn(AutoAttendantCeInfoModelService, 'extractUUID').and.returnValue('1');
    Notification = jasmine.createSpyObj('Notification', ['success', 'error']);
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);

    controller = $controller('AAScheduleModalCtrl as vm', {
      $scope: $scope,
      Notification: Notification,
      $modalInstance: $modalInstance,
      AACalendarService: AACalendarService,
      AAICalService: AAICalService,
      AAModelService: AAModelService,
      AAUiModelService: AAUiModelService
    });
    $scope.$apply();
  }));

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });

  describe('saveSchedule', function () {
    beforeEach(function () {
      controller.holidaysForm = {
        $valid: true,
        $invalid: false,
        $setDirty: function () {},
        holidayStart: {
          $viewValue: undefined,
          $setPristine: function () {}
        },
        holidayEnd: {
          $viewValue: undefined,
          $setPristine: function () {}
        }
      };
      spyOn(controller.holidaysForm.holidayStart, '$setPristine').and.returnValue(true);
      spyOn(controller.holidaysForm.holidayEnd, '$setPristine').and.returnValue(true);
      controller.holidaysForm.$valid = true;
      controller.calendar = calendar;
      var ceInfo = ce2CeInfo(rawCeInfo);
      controller.openhours = [];
      controller.holidays = [];
      controller.openhours.push(hours);
      aaModel.ceInfos.push(ceInfo);
      var error = false;
    });

    it('should create a schedule for AA', function () {
      controller.save();
      $scope.$apply();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('Calendar for AA1', controller.calendar);
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();

    });

    it('should update a schedule for AA', function () {
      var aaModel = {
        aaRecord: {
          scheduleId: '1',
          callExperienceName: 'AA1'
        }
      };
      AAModelService.getAAModel.and.returnValue(aaModel);
      controller.aaModel = aaModel;
      expect(controller.openhours).toBeTruthy();
      controller.save();
      $scope.$apply();
      expect(AACalendarService.updateCalendar).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should delete a schedule for AA', function () {
      var aaModel = {
        aaRecord: {
          scheduleId: '1',
          callExperienceName: 'AA1'
        },
        aaRecordUUID: '1111',
        ceInfos: []
      };
      AAModelService.getAAModel.and.returnValue(aaModel);
      controller.openhours = [];
      controller.isDeleted = true;
      expect(controller.openhours).toBeTruthy();
      controller.save();
      $scope.$apply();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();

      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('Verify schedule is disabled to save for AA before AA is created', function () {
      var aaModel = {
        aaRecord: {
          callExperienceName: 'AA1'
        },
        aaRecordUUID: '1111',
        ceInfos: []
      };
      AAModelService.getAAModel.and.returnValue(aaModel);
      controller.openhours = [];
      controller.isDeleted = true;
      var flag = controller.isHoursSavable();
      expect(flag).toBeFalsy();
    });

    it('should toggle the sections holidays', function () {
      controller.toggleSection('holiday');
      $scope.$apply();
      expect(controller.toggleHours).toBeTruthy();
      expect(controller.toggleHolidays).toBeFalsy();
    });

    it('should toggle the sections open/close', function () {
      controller.toggleSection('hours');
      controller.toggleHours = true;
      $scope.$apply();
      expect(controller.toggleHours).toBeTruthy();
      expect(controller.toggleHolidays).toBeTruthy();
    });

    it('changeAllDay should make form pristine if values are not in the input fields for startdate and enddate', function () {
      controller.changeAllDay(controller.holidaysForm);
      expect(controller.holidaysForm.holidayStart.$setPristine).toHaveBeenCalled();
      expect(controller.holidaysForm.holidayEnd.$setPristine).toHaveBeenCalled();
    });

    it('isDisabled should return false', function () {
      expect(controller.isDisabled()).toBeFalsy();
    });

    it('addHoliday should add a holiday', function () {
      controller.addHoliday();
      $scope.$apply();
      expect(controller.holidays.length).toEqual(1);
      controller.addHoliday();
      $scope.$apply();
      expect(controller.holidays.length).toEqual(2);
    });

    it('removeHoliday should remove a holiday', function () {
      controller.addHoliday();
      controller.removeHoliday();
      $scope.$apply();
      expect(controller.holidays.length).toEqual(0);
    });
  });
});
