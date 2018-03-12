import moduleName from './index';

describe('Component: firstTimeSetup:', () => {
  let $componentController, $q, $scope, controller, ProPackService;

  //beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  afterEach(function () {
    $componentController = $q = $scope = controller  = ProPackService = undefined;

  });

  function initSpies() {
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(false));
  }

  function dependencies(_$componentController_, _$q_, $rootScope, _ProPackService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    ProPackService = _ProPackService_;
  }
  function initController() {
    controller = $componentController('firstTimeSetup', { $scope: {} }, {});
    controller.$onInit();
  }

  describe('atlasProPackGetStatus - ', function () {
    it('getAppTitle should return pro name if ProPackService is true', function () {
      expect(this.controller.getAppTitle()).toEqual('loginPage.titleNew');

      this.ProPackService.hasProPackPurchased.and.returnValue(this.$q.resolve(true));
      initController();
      expect(this.controller.getAppTitle()).toEqual('loginPage.titlePro');
    });
  });
});

