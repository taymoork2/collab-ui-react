'use strict';

describe('Controller: AAScheduleImportCtrl', function () {
  var $scope, controller, $modalInstance, AACalendarService, AAICalService, AAModelService, $translate, $q;
  var aaModel = {
    aaRecord: {
      scheduleId: 'url-1'
    },
    aaRecords: [{
      callExperienceURL: 'url-1',
      callExperienceName: 'AA1'
    }, {
      callExperienceURL: 'url-2',
      callExperienceName: 'AA2'
    }]
  };
  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AACalendarService_, _AAICalService_, _AAModelService_, _$translate_, $controller, $rootScope, _$q_) {
    $scope = $rootScope.$new();
    AACalendarService = _AACalendarService_;
    AAICalService = _AAICalService_;
    AAModelService = _AAModelService_;
    $translate = _$translate_;
    $q = _$q_;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    spyOn(AACalendarService, 'readCalendar').and.returnValue($q.when({}));
    spyOn(AACalendarService, 'listCalendars').and.returnValue($q.when([{
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
      $modalInstance: $modalInstance
    });
    $scope.$apply();
  }));

  it('should have options after load', function () {
    // we are filtering out the AA's schedule, so it should be one.
    expect(controller.options.length).toBe(1);
  });

  it('select and continue to import', function () {
    controller.selected = controller.options[0];
    controller.continueImport();
    $scope.$apply();
    expect($modalInstance.close).toHaveBeenCalledWith({});
  });
});
