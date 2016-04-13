'use strict';

describe('Controller: AAScheduleModalCtrl', function () {
  var Notification, AutoAttendantCeService;
  var AACalendarService, AAUiModelService, AAModelService, AutoAttendantCeInfoModelService, AAICalService, AACommonService;
  var $scope, $translate, $modalInstance, $controller, $modal;
  var ical;
  var ces = getJSONFixture('huron/json/autoAttendant/callExperiences.json');
  var calendar = getJSONFixture('huron/json/autoAttendant/aCalendar.json');
  var aaModel, aaModelWithScheduleId, holidays, starttime, endtime, openhours, controller;

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

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_ical_, $q, _$controller_, _$translate_, _$modal_, $rootScope, _Notification_, _AACalendarService_, _AAModelService_, _AAUiModelService_, _AutoAttendantCeService_, _AutoAttendantCeInfoModelService_, _AAICalService_, _AACommonService_) {
    $translate = _$translate_;
    $scope = $rootScope.$new();
    ical = _ical_;
    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AAICalService = _AAICalService_;
    AACalendarService = _AACalendarService_;
    AACommonService = _AACommonService_;
    $modal = _$modal_;

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
    var aaUiModel = {
      openHours: {},
      ceInfo: {
        name: 'AA2',
        scheduleId: '1'
      }
    };
    var date = new Date();
    starttime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0);
    endtime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0, 0);

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
    Notification = jasmine.createSpyObj('Notification', ['success', 'error']);
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
    });

    it('should have open hours and holidays', function () {
      $scope.$apply();
      expect(controller.openhours).toEqual(openhours);
      expect(controller.holidays).toEqual(holidays);
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
      controller.calendar = calendar;
      controller.openhours = openhours;
      controller.holidays = holidays;
      controller.save();
      $scope.$apply();
      expect(AACalendarService.createCalendar).toHaveBeenCalledWith('AA1', controller.calendar);
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should update a schedule for AA', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModelWithScheduleId);
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModelWithScheduleId.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
      controller.calendar = calendar;
      controller.openhours = openhours;
      controller.holidays = holidays;
      expect(controller.openhours.length > 0 || controller.holidays.length > 0).toBeTruthy();
      controller.save();
      $scope.$apply();
      expect(AACalendarService.updateCalendar).toHaveBeenCalled();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should delete a schedule for AA', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModelWithScheduleId);
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModelWithScheduleId.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
      controller.openhours = [];
      controller.holidays = [];
      controller.isDeleted = true;
      expect(controller.openhours.length > 0 || controller.holidays.length > 0).toBeFalsy();
      expect(controller.isDeleted).toBeTruthy();
      controller.save();
      $scope.$apply();
      expect(AutoAttendantCeService.updateCe).toHaveBeenCalled();
      expect(AACalendarService.deleteCalendar).toHaveBeenCalled();
      expect(Notification.success).toHaveBeenCalled();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should not notify when the CE updatae fails during calendar creation', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      spyOn(AutoAttendantCeInfoModelService, 'extractUUID').and.returnValue(undefined);
      var ceInfo = ce2CeInfo(rawCeInfo);
      aaModelWithScheduleId.ceInfos.push(ceInfo);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
      controller.isDeleted = false;
      controller.save();
      $scope.$apply();
      expect(AACalendarService.createCalendar).toHaveBeenCalled();
      expect(Notification.success.calls.any()).toEqual(false);
      expect($modalInstance.close.calls.any()).toEqual(false);
    });

  });

  describe('toggleSection', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
      controller = $controller('AAScheduleModalCtrl as vm', {
        $scope: $scope,
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
      $scope.$apply();
      expect(controller.holidays.length).toEqual(2);
      controller.addHoliday();
      expect(controller.holidays.length).toEqual(3);
    });

    it('should not add a holiday to a schedule with an invalid holiday', function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
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
        Notification: Notification,
        $modalInstance: $modalInstance,
        AACalendarService: AACalendarService,
        AAICalService: AAICalService,
        AAModelService: AAModelService,
        AAUiModelService: AAUiModelService
      });
      $scope.$apply();
    });

    it('no hours should undefined', function () {
      var hours = {};
      expect(controller.isOpenHoursAfterCloseHours(hours)).toBeUndefined();
    });

    it('should false', function () {
      var hours = {
        starttime: starttime,
        endtime: endtime
      };
      expect(controller.isOpenHoursAfterCloseHours(hours)).toBeFalsy();
    });

    it('should true', function () {
      var hours = {
        starttime: endtime,
        endtime: starttime
      };
      expect(controller.isOpenHoursAfterCloseHours(hours)).toBeTruthy();
    });
  });

  describe('isHolidaysSavable', function () {
    beforeEach(function () {
      spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
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
        $modalInstance: $modalInstance
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
