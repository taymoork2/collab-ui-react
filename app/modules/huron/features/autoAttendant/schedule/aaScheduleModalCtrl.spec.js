'use strict';

describe('Controller: AAScheduleModalCtrl', function () {
  var AANotificationService, AutoAttendantCeService, AAMetricNameService, Analytics;
  var AACalendarService, AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AAICalService, AACommonService;
  var $q, $scope, $translate, $modalInstance, $controller, $modal, $timeout;
  var ical;
  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var calendar = getJSONFixture('huron/json/autoAttendant/aCalendar.json');
  var aaModel, aaUiModel, aaModelWithScheduleId, holidays, starttime, endtime, openhours, controller;

  var rawCeInfo = {
    "callExperienceName": "AA1",
    "callExperienceURL": "https://ces.hitest.huron-dev.com/api/v1/customers/6662df48-b367-4c1e-9c3c-aa408aaa79a1/callExperiences/c16a6027-caef-4429-b3af-9d61ddc7964b",
    "assignedResources": [{
      "id": "00097a86-45ef-44a7-aa78-6d32a0ca1d3b",
      "type": "directoryNumber",
      "trigger": "incomingCall"
    }]
  };

  var fakeModal = {
    result: {
      then: function (okCallback, cancelCallback) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      this.result.okCallback(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    }
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

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_ical_, _$q_, _$controller_, _$translate_, _$modal_, $rootScope, _$timeout_, _AACalendarService_, _AAModelService_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AAICalService_, _AACommonService_, _AAMetricNameService_, _Analytics_) {
    $translate = _$translate_;
    $scope = $rootScope.$new();
    ical = _ical_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAICalService = _AAICalService_;
    AACalendarService = _AACalendarService_;
    AACommonService = _AACommonService_;
    AAMetricNameService = _AAMetricNameService_;
    Analytics = _Analytics_;
    $modal = _$modal_;
    $q = _$q_;

    aaModel = {
      aaRecord: {
        scheduleId: '',
        callExperienceName: 'AA1'
      },
      aaRecordUUID: '1111',
      ceInfos: []
    };
    aaModelWithScheduleId = {
      aaRecord: {
        scheduleId: '1',
        callExperienceName: 'AA1'
      },
      aaRecordUUID: '1111',
      ceInfos: []
    };
    aaUiModel = {
      openHours: {},
      ceInfo: {
        name: 'AA2',
        scheduleId: '1'
      },
      systemTimeZone: {
        id: 'America/Los_Angeles',
        label: 'America/Los_Angeles'
      },
      timeZone: {
        id: 'America/Los_Angeles',
        label: 'America/Los_Angeles'
      },
      isClosedHours: true,
      isHolidays: false
    };
    starttime = "08:00 AM";
    endtime = "05:00 PM";

    openhours = [];

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
    var holiday1 = {
      name: 'Thanksgiving',
      month: {
        index: 10,
        number: 11
      },
      day: {
        index: 4,
        abbr: 'TH'
      },
      rank: {
        label: 'ranks.fourth',
        index: 3,
        number: 4
      },
      allDay: true,
      exactDate: false,
      recurAnnually: true
    };
    var holiday2 = {
      name: 'Christmas',
      date: '2016-12-25',
      allDay: true,
      exactDate: true,
      recurAnnually: true
    };
    holidays = [holiday1, holiday2];
    var data = {
      hours: openhours,
      holidays: holidays
    };

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when(calendar));
    spyOn(AACalendarService, 'createCalendar').and.returnValue($q.when(calendar));
    spyOn(AACalendarService, 'updateCalendar').and.returnValue($q.when(calendar));
    spyOn(AACalendarService, 'deleteCalendar').and.returnValue($q.when());
    spyOn(AAICalService, 'getDefaultRange').and.returnValue(defaultRange);
    spyOn(AAICalService, 'createCalendar').and.returnValue(new ical.Component('vcalendar'));
    spyOn(AAICalService, 'getHoursRanges').and.returnValue(data);
    spyOn(AAICalService, 'addHoursRange');
    spyOn(AutoAttendantCeService, 'updateCe').and.returnValue($q.when());
    spyOn($modal, 'open').and.returnValue(fakeModal);
    spyOn(AACommonService, 'saveUiModel');
    AANotificationService = jasmine.createSpyObj('AANotificationService', ['success', 'error']);
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);

  }));

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });

  describe('addRange', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
    });

    //tests the required error message print outs using addRange (for both start and endtime)
    it('should print out required errors on addRange function call because of undefined start and end times ', function () {
      controller.hoursForm = {
        endtime0: {
          $setDirty: function () {},
          $validate: function () {},
          $error: {
            compareTo: undefined,
            required: undefined
          }
        },
        starttime0: {
          $setDirty: function () {},
          $validate: function () {},
          $error: {
            compareTo: undefined,
            required: undefined
          }
        }
      };
      controller.openhours = [{
        starttime: undefined,
        endtime: undefined
      }];
      $scope.$apply();
      //test the end time prints
      spyOn(controller.hoursForm.endtime0, '$setDirty');
      spyOn(controller.hoursForm.endtime0, '$validate');
      //test the start time prints
      spyOn(controller.hoursForm.starttime0, '$setDirty');
      spyOn(controller.hoursForm.starttime0, '$validate');
      spyOn(controller, 'isOpenHoursAfterCloseHours').and.returnValue(true);
      expect(controller.openhours.length).toEqual(1);
      controller.addRange();
      expect(controller.hoursForm.endtime0.$error.required).toBeTruthy();
      expect(controller.hoursForm.endtime0.$setDirty).toHaveBeenCalled();
      expect(controller.hoursForm.endtime0.$validate).toHaveBeenCalled();
      expect(controller.hoursForm.starttime0.$error.required).toBeTruthy();
      expect(controller.hoursForm.starttime0.$setDirty).toHaveBeenCalled();
      expect(controller.hoursForm.starttime0.$validate).toHaveBeenCalled();
      //ensure that an extra range was not created
      expect(controller.openhours.length).toEqual(1);
    });

    it('should add a range', function () {
      expect(controller.openhours.length).toEqual(0);
      controller.addRange();
      expect(controller.openhours.length).toEqual(1);
    });
  });

  describe('deleteRange', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
    });

    it('with an invalid index should not delete range', function () {
      expect(controller.openhours.length).toEqual(0);
      controller.addRange();
      controller.deleteRange(4);
      expect(controller.openhours.length).toEqual(1);
      expect(controller.isDeleted).toBeFalsy();
    });

    it('with an valid index should delete range', function () {
      controller.hoursForm = {
        $setDirty: function () {}
      };
      spyOn(controller.hoursForm, '$setDirty').and.returnValue(true);
      expect(controller.openhours.length).toEqual(0);
      controller.addRange();
      controller.deleteRange(0);
      expect(controller.openhours.length).toEqual(0);
      expect(controller.isDeleted).toBeTruthy();
    });
  });

  describe('populateUi', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModelWithScheduleId);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.timeZoneForm = {
        $setPristine: function () {}
      };
      spyOn(controller.timeZoneForm, '$setPristine');
      $timeout.flush();
    });

    it('should have open hours and holidays', function () {
      $scope.$apply();
      expect(controller.openhours).toEqual(openhours);
      expect(controller.holidays).toEqual(holidays);
    });

    it('should have invoked $setPristine to reset timeZoneForm', function () {
      $scope.$apply();
      expect(controller.timeZoneForm.$setPristine).toHaveBeenCalled();
    });

  });

  describe('saveSchedule', function () {
    beforeEach(function () {});

    it('should create a schedule for AA', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AutoAttendantCeInfoModelService, 'extractUUID').and.returnValue('1');
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        AANotificationService: AANotificationService,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.timeZoneForm = {
        $pristine: true
      };
      spyOn(controller, 'saveTimeZone');
      controller.calendar = calendar;
      controller.openhours = openhours;
      controller.holidays = holidays;
      controller.save();
      $scope.$apply();
      expect(controller.saveTimeZone).toHaveBeenCalled();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('AA1', controller.calendar);
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(AANotificationService.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should update a schedule for AA', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModelWithScheduleId);
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModelWithScheduleId.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        AANotificationService: AANotificationService,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.timeZoneForm = {
        $pristine: true
      };
      controller.calendar = calendar;
      controller.openhours = openhours;
      controller.holidays = holidays;
      expect(controller.openhours.length > 0 || controller.holidays.length > 0).toBeTruthy();
      controller.save();
      $scope.$apply();
      expect(AACalendarService.updateCalendar).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(AANotificationService.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should delete a schedule for AA', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModelWithScheduleId);
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModelWithScheduleId.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        AANotificationService: AANotificationService,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.timeZoneForm = {
        $pristine: true
      };
      controller.openhours = [];
      controller.holidays = [];
      controller.isDeleted = true;
      expect(controller.openhours.length > 0 || controller.holidays.length > 0).toBeFalsy();
      expect(controller.isDeleted).toBeTruthy();
      controller.save();
      $scope.$apply();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(AANotificationService.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();

      expect(controller.aaModel.aaRecord.scheduleId).toBeUndefined();
      expect(controller.ui.ceInfo.scheduleId).toBeUndefined();

    });

    it('should not notify when the CE updatae fails during calendar creation', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AutoAttendantCeInfoModelService, 'extractUUID').and.returnValue(undefined);
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModelWithScheduleId.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        AANotificationService: AANotificationService,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.timeZoneForm = {
        $pristine: true
      };
      controller.isDeleted = false;
      controller.save();
      $scope.$apply();
      expect(AACalendarService.createCalendar).toHaveBeenCalled();
      expect(AANotificationService.success.calls.any()).toEqual(false);
      expect($modalInstance.close.calls.any()).toEqual(false);
    });

  });

  describe('saveTimeZone', function () {
    beforeEach(function () {
      spyOn(Analytics, 'trackEvent');
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModel.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        AANotificationService: AANotificationService,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.aaModel = aaModel;
      controller.aaModel.aaRecord.assignedTimeZone = undefined;
      controller.timeZoneForm = {
        $pristine: true
      };
    });

    it('should NOT store time zone into aaRecord if there is NO change in time zone drop-down list', function () {
      controller.saveTimeZone();
      expect(controller.aaModel.aaRecord.assignedTimeZone).toBe(undefined);
    });

    it('should store time zone into aaRecord if there is a change in time zone drop-down list', function () {
      controller.timeZoneForm = {
        $pristine: false
      };
      controller.saveTimeZone();
      expect(controller.aaModel.aaRecord.assignedTimeZone).toBe(aaUiModel.timeZone.id);
    });

    it('should log a timezone event for a first-time change in time zone drop-down list', function () {
      controller.timeZoneForm = {
        $pristine: false
      };
      controller.saveTimeZone();
      expect(Analytics.trackEvent).toHaveBeenCalledWith(AAMetricNameService.TIME_ZONE, {
        type: 'change',
        timezone: aaUiModel.timeZone.id
      });
      expect(controller.aaModel.aaRecord.assignedTimeZone).toBe(aaUiModel.timeZone.id);
    });

    it('should NOT log a timezone event for subsequent change in time zone drop-down list', function () {
      controller.timeZoneForm = {
        $pristine: false
      };
      controller.aaModel.aaRecord.assignedTimeZone = aaUiModel.timeZone.id;

      controller.saveTimeZone();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
      expect(controller.aaModel.aaRecord.assignedTimeZone).toBe(aaUiModel.timeZone.id);
    });

    it('should NOT save timezone or log event for 24 Hours schedule', function () {
      controller.timeZoneForm = {
        $pristine: false
      };
      controller.ui.isClosedHours = false;
      controller.ui.isHolidays = false;

      controller.saveTimeZone();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
      expect(controller.aaModel.aaRecord.assignedTimeZone).toBe(undefined);
    });

  });

  describe('toggleSection', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
    });

    //tests the required error message print outs using addRange (for both start and endtime)
    it('should print out required errors on toggleSection function call because of undefined start and end times ', function () {
      controller.hoursForm = {
        endtime0: {
          $setDirty: function () {},
          $validate: function () {},
          $error: {
            compareTo: undefined,
            required: undefined
          }
        },
        starttime0: {
          $setDirty: function () {},
          $validate: function () {},
          $error: {
            compareTo: undefined,
            required: undefined
          }
        }
      };
      controller.openhours = [{
        starttime: undefined,
        endtime: undefined
      }];
      $scope.$apply();
      //test the end time prints
      spyOn(controller.hoursForm.endtime0, '$setDirty');
      spyOn(controller.hoursForm.endtime0, '$validate');
      //test the start time prints
      spyOn(controller.hoursForm.starttime0, '$setDirty');
      spyOn(controller.hoursForm.starttime0, '$validate');
      spyOn(controller, 'isOpenHoursAfterCloseHours').and.returnValue(true);
      controller.toggleSection('hours');
      expect(controller.toggleHours).toBeTruthy();
      expect(controller.hoursForm.endtime0.$error.required).toBeTruthy();
      expect(controller.hoursForm.endtime0.$setDirty).toHaveBeenCalled();
      expect(controller.hoursForm.endtime0.$validate).toHaveBeenCalled();
      expect(controller.hoursForm.starttime0.$error.required).toBeTruthy();
      expect(controller.hoursForm.starttime0.$setDirty).toHaveBeenCalled();
      expect(controller.hoursForm.starttime0.$validate).toHaveBeenCalled();
    });

    it('should not print out required errors on toggleSection function call with valid start and end times ', function () {
      controller.hoursForm = {
        endtime0: {
          $error: {
            compareTo: undefined,
            required: undefined
          }
        },
        starttime0: {
          $error: {
            compareTo: undefined,
            required: undefined
          }
        }
      };
      controller.openhours = [{
        starttime: starttime,
        endtime: endtime
      }];
      $scope.$apply();
      controller.toggleSection('hours');
      expect(controller.toggleHours).toBeTruthy();
      expect(controller.hoursForm.endtime0.$error.required).toBeFalsy();
      expect(controller.hoursForm.starttime0.$error.required).toBeFalsy();
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

    it('should forceCheckHoliday', function () {
      spyOn(controller, 'isSavable').and.returnValue(false);
      spyOn(controller, 'forceCheckHoliday');
      controller.toggleSection('hours');
      expect(controller.forceCheckHoliday).toHaveBeenCalled();
    });
  });

  describe('changeAllDay', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
    });

    it('should make form pristine if values are not in the input fields for startdate and enddate', function () {
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

      controller.changeAllDay(controller.holidaysForm);
      expect(controller.holidaysForm.holidayStart.$setPristine).toHaveBeenCalled();
      expect(controller.holidaysForm.holidayEnd.$setPristine).toHaveBeenCalled();
    });
  });

  describe('addHoliday', function () {
    it('should add a holiday to a schedule without holidays', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        AANotificationService: AANotificationService,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      $scope.$apply();
      expect(controller.holidays.length).toEqual(0);
      controller.addHoliday();
      expect(controller.holidays.length).toEqual(1);
    });

    it('should add a holiday to a schedule with holidays', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModelWithScheduleId);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.timeZoneForm = {
        $setPristine: function () {}
      };
      spyOn(controller.timeZoneForm, '$setPristine');
      $timeout.flush();
      $scope.$apply();
      expect(controller.holidays.length).toEqual(2);
      controller.addHoliday();
      expect(controller.holidays.length).toEqual(3);
    });

    it('should not add a holiday to a schedule with an invalid holiday', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      $scope.$apply();
      controller.holidays = [{}];
      expect(controller.holidays.length).toEqual(1);
      spyOn(controller, 'isHolidaysSavable').and.returnValue(false);
      spyOn(controller, 'forceCheckHoliday');
      controller.addHoliday();
      expect(controller.holidays.length).toEqual(1);
      expect(controller.forceCheckHoliday).toHaveBeenCalled();
    });
  });

  describe('removeHoliday', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
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
    });

    it('removeHoliday should remove a holiday', function () {
      controller.addHoliday();
      controller.removeHoliday();
      $scope.$apply();
      expect(controller.holidays.length).toEqual(0);
    });

    it('should open a modal for importing', function () {
      controller.openImportModal();
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
    });

    it('should close a modal for importing and send analytics', function () {
      spyOn(Analytics, 'trackEvent').and.returnValue($q.when({}));
      controller.openImportModal();
      fakeModal.dismiss('cancel');
      $scope.$apply();
      expect($modal.open).toHaveBeenCalled();
      expect(Analytics.trackEvent).toHaveBeenCalled();
    });

    it('should add imported items', function () {
      fakeModal.close({
        holidays: [],
        hours: []
      });
      $scope.$apply();
      expect(controller.holidays.length).toEqual(0);
    });

  });

  describe('forceCheckHoliday', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      $scope.$apply();
      controller.holidaysForm = {
        holidayForm0: {
          holidayName: {
            $setDirty: function () {}
          },
          holidayDate: {
            $setDirty: function () {}
          },
          holidayStart: {
            $setDirty: function () {}
          },
          holidayEnd: {
            $setDirty: function () {}
          },
          month: {
            $error: {
              required: undefined
            }
          },
          rank: {
            $error: {
              required: undefined
            }
          },
          day: {
            $error: {
              required: undefined
            }
          }
        }
      };
    });

    it('should set the required', function () {
      controller.holidays = [{
        isOpen: true,
        exactDate: false,
        month: '',
        rank: '',
        day: ''
      }];

      controller.forceCheckHoliday();

      expect(controller.holidaysForm.holidayForm0.month.$error.required).toBeTruthy();
      expect(controller.holidaysForm.holidayForm0.rank.$error.required).toBeTruthy();
      expect(controller.holidaysForm.holidayForm0.day.$error.required).toBeTruthy();
    });

    it('should not set the required', function () {
      controller.holidays = [{
        isOpen: true,
        exactDate: true
      }];
      spyOn(controller, 'isHolidaysSavable').and.returnValue(true);
      controller.forceCheckHoliday();

      expect(controller.holidaysForm.holidayForm0.month.$error.required).toBeUndefined();
      expect(controller.holidaysForm.holidayForm0.rank.$error.required).toBeUndefined();
      expect(controller.holidaysForm.holidayForm0.day.$error.required).toBeUndefined();
    });

    it('should do nothing', function () {
      controller.holidays = [];

      controller.forceCheckHoliday();

      expect(controller.holidaysForm.holidayForm0.month.$error.required).toBeUndefined();
      expect(controller.holidaysForm.holidayForm0.rank.$error.required).toBeUndefined();
      expect(controller.holidaysForm.holidayForm0.day.$error.required).toBeUndefined();
    });
  });

  describe('isOpenHoursAfterCloseHours', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      $scope.$apply();
    });

    it('no hours should undefined', function () {
      var hours = {};
      expect(controller.isOpenHoursAfterCloseHours(hours.starttime, hours.endtime)).toBeUndefined();
    });

    it('should false', function () {
      var hours = {
        starttime: starttime,
        endtime: endtime
      };
      expect(controller.isOpenHoursAfterCloseHours(hours.starttime, hours.endtime)).toBeFalsy();
    });

    it('should false', function () {
      var hours = {
        starttime: starttime,
        endtime: '12:00 AM'
      };
      expect(controller.isOpenHoursAfterCloseHours(hours.starttime, hours.endtime)).toBeFalsy();
    });

    it('should true', function () {
      var hours = {
        starttime: endtime,
        endtime: starttime
      };
      expect(controller.isOpenHoursAfterCloseHours(hours.starttime, hours.endtime)).toBeTruthy();
    });

    it('should false', function () {
      var hours = {
        starttime: '12:00 AM',
        endtime: '12:00 AM'
      };
      expect(controller.isOpenHoursAfterCloseHours(hours.starttime, hours.endtime)).toBeFalsy();
    });
  });

  describe('forceStartBeforeEndCheck', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.holidaysForm = {
        holidayForm0: {
          holidayEnd: {
            $setDirty: function () {},
            $validate: function () {},
            $error: {
              compareTo: undefined
            }
          }
        }
      };
      $scope.$apply();
      spyOn(controller.holidaysForm.holidayForm0.holidayEnd, '$setDirty');
      spyOn(controller.holidaysForm.holidayForm0.holidayEnd, '$validate');
    });

    it('no holidays open should undefined', function () {
      controller.forceStartBeforeEndCheck();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$error.compareTo).toBeUndefined();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$setDirty.calls.any()).toEqual(false);
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$validate.calls.any()).toEqual(false);
    });

    it('holiday hours valid should have no error', function () {
      controller.holidays = [{
        isOpen: true
      }];
      spyOn(controller, 'isOpenHoursAfterCloseHours').and.returnValue(false);
      controller.forceStartBeforeEndCheck();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$error.compareTo).toBeFalsy();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$setDirty).toHaveBeenCalled();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$validate).toHaveBeenCalled();
    });

    it('holiday hours invalid should have error', function () {
      controller.holidays = [{
        isOpen: true
      }];
      spyOn(controller, 'isOpenHoursAfterCloseHours').and.returnValue(true);
      controller.forceStartBeforeEndCheck();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$error.compareTo).toBeTruthy();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$setDirty).toHaveBeenCalled();
      expect(controller.holidaysForm.holidayForm0.holidayEnd.$validate).toHaveBeenCalled();
    });
  });

  describe('forceOpenBeforeCloseCheck', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      controller.hoursForm = {
        endtime0: {
          $setDirty: function () {},
          $validate: function () {},
          $error: {
            compareTo: undefined
          }
        }
      };
      controller.openhours = [{
        starttime: starttime,
        endtime: endtime
      }];
      $scope.$apply();
      spyOn(controller.hoursForm.endtime0, '$setDirty');
      spyOn(controller.hoursForm.endtime0, '$validate');
    });

    it('hours valid should have no error', function () {
      spyOn(controller, 'isOpenHoursAfterCloseHours').and.returnValue(false);
      controller.forceOpenBeforeCloseCheck(0, 'endtime');
      expect(controller.hoursForm.endtime0.$error.compareTo).toBeFalsy();
      expect(controller.hoursForm.endtime0.$setDirty).toHaveBeenCalled();
      expect(controller.hoursForm.endtime0.$validate).toHaveBeenCalled();
    });

    it('hours invalid should have error', function () {
      spyOn(controller, 'isOpenHoursAfterCloseHours').and.returnValue(true);
      controller.forceOpenBeforeCloseCheck(0, 'endtime');
      expect(controller.hoursForm.endtime0.$error.compareTo).toBeTruthy();
      expect(controller.hoursForm.endtime0.$setDirty).toHaveBeenCalled();
      expect(controller.hoursForm.endtime0.$validate).toHaveBeenCalled();
    });
  });

  describe('isHolidaysSavable', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService,
        sectionToToggle: 'hours'
      });
      $scope.$apply();
    });

    it('valid holidays should be true', function () {
      controller.holidays = holidays;
      expect(controller.isHolidaysSavable()).toBeTruthy();
    });

    it('name invalid should be false', function () {
      controller.holidays = [{
        name: undefined
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: ''
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
    });

    it('exact date invalid should be false', function () {
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        date: undefined
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        date: ''
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
    });

    it('not exact date invalid should be false', function () {
      controller.holidays = [{
        name: "Test",
        exactDate: false,
        month: undefined
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        month: ''
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: "Test",
        exactDate: false,
        month: {},
        rank: undefined
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        month: {},
        rank: ''
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: "Test",
        exactDate: false,
        month: {},
        rank: {},
        day: undefined
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        month: {},
        rank: {},
        day: ''
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
    });

    it('allDay invalid should be false', function () {
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        date: '2016-12-25',
        allDay: false
      }];
      expect(controller.isHolidaysSavable()).toBeFalsy();
    });
  });

  describe('exactDateChanged', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        $modalInstance: $modalInstance,
        sectionToToggle: 'hours'
      });
    });

    it('selected, recurAnnually should be false', function () {
      controller.holidays = [{
        name: "Test",
        exactDate: true,
        recurAnnually: false
      }];
      controller.exactDateChanged(controller.holidays[0]);
      expect(controller.holidays[0].recurAnnually).toBe(false);
    });

    it('unselected, recurAnnually should be true', function () {
      controller.holidays = [{
        name: "Test",
        exactDate: false,
        recurAnnually: false
      }];
      controller.exactDateChanged(controller.holidays[0]);
      expect(controller.holidays[0].recurAnnually).toBe(true);
    });
  });

});
