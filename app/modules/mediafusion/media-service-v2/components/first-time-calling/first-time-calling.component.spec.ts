import moduleName from './index';

describe('Component: firstTimeCalling:', () => {
  let $componentController, $q, $scope, controller, FirstTimeCallingService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterEach(function () {
    $componentController = $q = $scope = controller  = FirstTimeCallingService = undefined;

  });

  function initSpies() {
    spyOn(FirstTimeCallingService, 'hasProPackPurchased').and.returnValue($q.resolve(false));
  }

  function dependencies(_$componentController_, $rootScope, _$q_, _FirstTimeCallingService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    FirstTimeCallingService = _FirstTimeCallingService_;
  }
  function initController() {
    controller = $componentController('firstTimeCalling', { $scope: {} }, {});
    controller.$onInit();
  }

  describe('atlasProPackGetStatus - ', function () {
    it('getAppTitle should return pro name if ProPackService is true', function () {
      initController();
      expect(controller.getAppTitle()).toEqual('loginPage.titleNew');
    });
  });
});
