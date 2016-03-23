'use strict';

describe('Controller: AAScheduleImportCtrl', function () {
  var $scope, controller, $modalInstance, AutoAttendantCeInfoModelService, AutoAttendantCeService, AACalendarService, AAICalService, AAModelService, $translate, $q;
  var aaModel = {
    aaRecords: [{
      callExperienceURL: 'url-1',
      callExperienceName: 'AA1'
    }, {
      callExperienceURL: 'url-2',
      callExperienceName: 'AA2'
    }]
  };
  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AutoAttendantCeInfoModelService_, _AutoAttendantCeService_, _AACalendarService_, _AAICalService_, _AAModelService_, _$translate_, $controller, $rootScope, _$q_) {
    $scope = $rootScope.$new();
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeService = _AutoAttendantCeService_;
    AACalendarService = _AACalendarService_;
    AAICalService = _AAICalService_;
    AAModelService = _AAModelService_;
    $translate = _$translate_;
    $q = _$q_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when({}));
    spyOn(AACalendarService, 'readSchedules').and.returnValue($q.when([{
      scheduleUrl: '/schedules/url-1',
      scheduleName: 'Calendar for AA1'
    }, {
      scheduleUrl: '/schedules/url-2',
      scheduleName: 'Calendar for AA2'
    }]));
    spyOn(AAICalService, 'getHoursRanges').and.returnValue({});
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);

    controller = $controller('AAScheduleImportCtrl as vm', {
      $scope: $scope,
      $modalInstance: $modalInstance,
      AACalendarService: AACalendarService,
      AAICalService: AAICalService,
      AAModelService: AAModelService
    });
    $scope.$apply();
  }));

  it('should have options after load', function () {
    expect(controller.options.length).toBe(2);
  });

  it('select and continue to import', function () {
    controller.selected = controller.options[0];
    controller.continueImport();
    $scope.$apply();
    expect($modalInstance.close).toHaveBeenCalledWith({});
  });
});
