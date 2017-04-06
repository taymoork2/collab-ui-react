import privateTrunkSidepanel from './index';

describe('Component: PrivateTrunkSidepanelComponent ', () => {

  let $componentController, $q, $scope, EnterprisePrivateTrunkService, ctrl;

  beforeEach(function () {
    this.initModules(privateTrunkSidepanel);
  });

  beforeEach(inject((_$componentController_, _$q_, $rootScope, _EnterprisePrivateTrunkService_) => {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    EnterprisePrivateTrunkService = _EnterprisePrivateTrunkService_;
  }));

  beforeEach(initSpies);
  function initSpies(): void {
    spyOn(EnterprisePrivateTrunkService, 'getTrunkFromFMS').and.returnValue($q.resolve({}));
    spyOn(EnterprisePrivateTrunkService, 'getTrunkFromCmi').and.returnValue($q.resolve({}));
  }

  describe ('controller ', () => {

    let trunkId = '1234';

    function initController() {
      ctrl = $componentController('privateTrunkSidepanel', {
        EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
      }, { trunkId: trunkId });
    }

    it('should call EnterprisePrivateTrunkService to get data', () => {
      initController();
      ctrl.getData();
      $scope.$apply();
      expect(EnterprisePrivateTrunkService.getTrunkFromFMS).toHaveBeenCalledWith(trunkId);
      expect(EnterprisePrivateTrunkService.getTrunkFromCmi).toHaveBeenCalledWith(trunkId);
    });

  });


});
