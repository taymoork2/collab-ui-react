import ModuleName from './index';

describe('Component: hybridMediaUpgradeSchedule', function () {
  let $componentController, $q, $scope, controller, TimezoneService;

  afterEach(function () {
    $componentController = $q = $scope = controller = TimezoneService = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module(ModuleName));

  beforeEach(inject(dependencies));

  function dependencies(_$componentController_, _$q_, $rootScope, _TimezoneService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    TimezoneService = _TimezoneService_;
  }

  function initController() {
    controller = $componentController('hybridMediaUpgradeSchedule', { $scope: {} }, {});
    controller.onInit();
  }

  it('should set the formOptions values correctly', function () {
    spyOn(TimezoneService, 'getCountryMapping').and.returnValue($q.resolve({}));
    initController();
    expect(controller.formOptions.day.length).toBe(7);
    expect(TimezoneService.getCountryMapping).toHaveBeenCalled();
  });

});
