import moduleName from './index';

describe('GoogleCalendarPrerequisitesComponentController', () => {

  let $componentController, $q, $scope, HybridServicesFlagService;
  const flagPrefix = 'atlas.hybrid.setup.google.calendar.';

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
    const ctrl = $componentController('googleCalendarPrerequisites', {}, {});
    ctrl.$onInit();
    $scope.$apply();
    return ctrl;
  }

  it('should check a box if the server says it has been checked previously', () => {
    const raisedCheckboxName = 'KommGibMirDeineHand';
    const loweredCheckboxName = 'SieLiebtDich';
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
    const checkboxName = 'Mit66Jahren';
    spyOn(HybridServicesFlagService, 'raiseFlag');
    const ctrl = initController();
    ctrl.processChange(checkboxName, true);
    expect(HybridServicesFlagService.raiseFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

  it('should lower a flag when a box is unchecked', () => {
    const checkboxName = 'KnallrotesGummiboot';
    spyOn(HybridServicesFlagService, 'lowerFlag');
    const ctrl = initController();
    ctrl.processChange(checkboxName, false);
    expect(HybridServicesFlagService.lowerFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

});
