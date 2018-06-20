import moduleName from './index';

describe('Component: firstTimeSetup:', () => {
  let $componentController, $q, $scope, controller, ProPackService;

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterEach(function () {
    $componentController = $q = $scope = controller  = ProPackService = undefined;

  });

  function initSpies() {
    spyOn(ProPackService, 'hasProPackPurchased').and.returnValue($q.resolve(false));
  }

  function dependencies(_$componentController_, $rootScope, _$q_, _ProPackService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    ProPackService = _ProPackService_;
  }
  function initController() {
    controller = $componentController('firstTimeSetup', { $scope: {} }, {});
    controller.$onInit();
  }

  describe('atlasProPackGetStatus - ', function () {
    it('getAppTitle should return pro name if ProPackService is true', function () {
      initController();
      expect(controller.getAppTitle()).toEqual('loginPage.titleNew');
    });
  });
});
