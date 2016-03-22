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
    spyOn(AutoAttendantCeService, 'readCe').and.callFake(function (url) {
      if (url === 'url-1') {
        return $q.when({
          scheduleId: 'id'
        });
      } else {
        return $q.when({});
      }
    });
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when({}));
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

  it('select and continue to import with undefined passed from the modal', function () {
    controller.selected = controller.options[1];
    controller.continueImport();
    $scope.$apply();
    expect($modalInstance.close).toHaveBeenCalledWith(undefined);
  });
});
