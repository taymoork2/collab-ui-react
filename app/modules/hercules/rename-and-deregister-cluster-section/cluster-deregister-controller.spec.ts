describe('ClusterDeregisterController', () => {

  let $controller, $scope, $q, PrivateTrunkService, FusionClusterService;

  const modalInstanceMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies (_$controller_, $rootScope, _$q_, _PrivateTrunkService_, _FusionClusterService_): void {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $q = _$q_;
    PrivateTrunkService = _PrivateTrunkService_;
    FusionClusterService = _FusionClusterService_;
  }

  function initController(cluster: any): void {
    return $controller('ClusterDeregisterController', {
      $modalInstance: modalInstanceMock,
      cluster: cluster,
    });
  }

  function initSpies() {
    spyOn(PrivateTrunkService, 'removePrivateTrunkResource').and.returnValue($q.resolve({}));
    spyOn(FusionClusterService, 'deregisterCluster').and.returnValue($q.resolve({}));
  }

  describe('Enterprise Private Trunking', () => {

    it('should call the correct backend when deleting a private trunk', () => {

      const trunkResource = {
        id: '123',
        targetType: 'ept',
      };

      let controller: any = initController(trunkResource);
      controller.deregister();
      $scope.$apply();
      expect(PrivateTrunkService.removePrivateTrunkResource).toHaveBeenCalled();
      expect(FusionClusterService.deregisterCluster).not.toHaveBeenCalled();
    });

  });

  describe('Hybrid Services', () => {

    it('should call the correct backend when deleting a hybrid media node', () => {

      const trunkResource = {
        id: '456',
        targetType: 'mf_mgmt',
      };

      let controller: any = initController(trunkResource);
      controller.deregister();
      $scope.$apply();
      expect(PrivateTrunkService.removePrivateTrunkResource).not.toHaveBeenCalled();
      expect(FusionClusterService.deregisterCluster).toHaveBeenCalled();
    });

    it('should call the correct backend when deleting a hybrid data security node', () => {

      const trunkResource = {
        id: '789',
        targetType: 'hds_app',
      };

      let controller: any = initController(trunkResource);
      controller.deregister();
      $scope.$apply();
      expect(PrivateTrunkService.removePrivateTrunkResource).not.toHaveBeenCalled();
      expect(FusionClusterService.deregisterCluster).toHaveBeenCalled();
    });


  });


});
