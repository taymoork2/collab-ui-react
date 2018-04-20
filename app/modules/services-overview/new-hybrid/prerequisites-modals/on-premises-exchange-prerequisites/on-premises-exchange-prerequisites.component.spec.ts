import moduleName from './index';

describe('OnPremisesExchangePrerequisitesComponentController', () => {

  let $componentController, $q, $scope, HybridServicesFlagService;
  const flagPrefix = 'atlas.hybrid.setup.calendar.onpremises.';

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$rootScope_, _$componentController_, _$q_, _HybridServicesFlagService_) {
    $scope = _$rootScope_.$new();
    $componentController = _$componentController_;
    $q = _$q_;
    HybridServicesFlagService = _HybridServicesFlagService_;
  }

  function initSpies() {
    spyOn(HybridServicesFlagService, 'readFlags').and.returnValue($q.resolve({}));
    spyOn(HybridServicesFlagService, 'raiseFlag');
    spyOn(HybridServicesFlagService, 'lowerFlag');
  }

  function cleanup() {
    $componentController = $q = $scope = HybridServicesFlagService = undefined;
  }

  function initController(callback = Function()) {
    const controller = $componentController('onPremisesExchangePrerequisites', {}, {
      onChange: callback,
    });
    controller.$onInit();
    return controller;
  }

  it('should raise a flag when a box is checked', () => {
    const checkboxName = 'breitling';
    const controller = initController();
    $scope.$apply();
    controller.processChange(checkboxName, true);
    expect(HybridServicesFlagService.raiseFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

  it('should lower a flag when a box is unchecked', () => {
    const checkboxName = 'patek';
    const controller = initController();
    $scope.$apply();
    controller.processChange(checkboxName, false);
    expect(HybridServicesFlagService.lowerFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

  it('should call the provided callback function once on init, and again when one checkbox has changed', () => {
    const checkboxName = 'omega';
    const callback = jasmine.createSpy('callback');
    const controller = initController(callback);
    $scope.$apply();
    expect(callback.calls.count()).toBe(1);

    controller.checkboxes[checkboxName] = true;
    controller.processChange(checkboxName, true);
    expect(callback.calls.count()).toBe(2);
    expect(callback.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      options: {
        numberChecked: 1,
        totalNumber: 9,
      },
    }));
  });

});
