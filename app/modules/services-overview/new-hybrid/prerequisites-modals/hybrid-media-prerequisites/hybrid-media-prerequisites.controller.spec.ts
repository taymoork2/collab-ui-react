import moduleName from './hybrid-media-prerequisites.controller';

describe('HybridMediaPrerequisitesController', () => {

  let $controller, $q, $scope, HybridServicesFlagService;
  const flagPrefix = 'atlas.hybrid.media.setup.';

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$rootScope_, _$controller_, _$q_, _HybridServicesFlagService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $q = _$q_;
    HybridServicesFlagService = _HybridServicesFlagService_;
  }

  function initSpies() {
    spyOn(HybridServicesFlagService, 'readFlags');
    spyOn(HybridServicesFlagService, 'raiseFlag');
    spyOn(HybridServicesFlagService, 'lowerFlag');
  }

  function cleanup() {
    $controller = $q = $scope = undefined;
  }

  function initController() {
    return $controller('HybridMediaPrerequisitesController');
  }

  it('should raise a flag when a box is checked', () => {
    HybridServicesFlagService.readFlags.and.returnValue($q.resolve({}));
    const checkboxName = 'bananaRepublic';
    const controller = initController();
    controller.processChange(checkboxName, true);
    $scope.$apply();
    expect(HybridServicesFlagService.raiseFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

  it('should lower a flag when a box is unchecked', () => {
    HybridServicesFlagService.readFlags.and.returnValue($q.resolve({}));
    const checkboxName = 'GAP';
    const controller = initController();
    controller.processChange(checkboxName, false);
    $scope.$apply();
    expect(HybridServicesFlagService.lowerFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
  });

  it('should check a box if the server says it has been checked previously', () => {
    const raisedCheckboxName = 'barcelona';
    const loweredCheckboxName = 'realMadrid';
    HybridServicesFlagService.readFlags.and.returnValue($q.resolve([{
      name: `${flagPrefix}${raisedCheckboxName}`,
      raised: true,
    }, {
      name: `${flagPrefix}${loweredCheckboxName}`,
      raised: false,
    }]));
    const controller = initController();
    $scope.$apply();
    expect(controller.checkboxes[raisedCheckboxName]).toBeTruthy();
    expect(controller.checkboxes[loweredCheckboxName]).toBeFalsy();
  });

});
