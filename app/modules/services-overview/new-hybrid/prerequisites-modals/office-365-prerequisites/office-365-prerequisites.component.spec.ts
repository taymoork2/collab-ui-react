import moduleName from './index';

describe('Office365PrerequisitesComponentController', () => {

  let $componentController, $q, $scope, HybridServicesFlagService;
  const flagPrefix = 'atlas.hybrid.setup.office365.';

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _HybridServicesFlagService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    HybridServicesFlagService = _HybridServicesFlagService_;
  }

  function cleanup() {
    $componentController = $q = $scope = HybridServicesFlagService = undefined;
  }

  function initController() {
    const ctrl = $componentController('office365Prerequisites', {}, {});
    ctrl.$onInit();
    $scope.$apply();
    return ctrl;
  }

  it('should check a box if the server says it has been checked previously', () => {
    const raisedCheckboxName = 'MyWay';
    const loweredCheckboxName = 'Soliloquy';
    spyOn(HybridServicesFlagService, 'readFlags').and.returnValue($q.resolve([{
      name: `${flagPrefix}${raisedCheckboxName}`,
      raised: true,
    }, {
      name: `${flagPrefix}${loweredCheckboxName}`,
      raised: false,
    }]));
    const ctrl = initController();
    expect(ctrl.checkboxes[raisedCheckboxName]).toBe(true);
    expect(ctrl.checkboxes[loweredCheckboxName]).toBe(false);
  });

  it('should raise a flag when a box is checked', () => {
    const checkboxName = 'StrangersInTheNight';
    spyOn(HybridServicesFlagService, 'raiseFlag');
    const ctrl = initController();
    ctrl.processChange(checkboxName, true);
    expect(HybridServicesFlagService.raiseFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

  it('should lower a flag when a box is unchecked', () => {
    const checkboxName = 'FlyMeToTheMoon';
    spyOn(HybridServicesFlagService, 'lowerFlag');
    const ctrl = initController();
    ctrl.processChange(checkboxName, false);
    expect(HybridServicesFlagService.lowerFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

});
