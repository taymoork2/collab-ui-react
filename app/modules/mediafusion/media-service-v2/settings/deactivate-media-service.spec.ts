describe('DeactivateMediaService', () => {

  let $q, $scope, $httpBackend, DeactivateMediaService, HybridServicesClusterService, MediaServiceActivationV2, Notification, ServiceDescriptorService;

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(dependencies));
  afterEach( () => {
    $q = $scope = $httpBackend = DeactivateMediaService = HybridServicesClusterService = MediaServiceActivationV2 = Notification = ServiceDescriptorService = undefined;
  });

  function dependencies (_$q_, _$httpBackend_, $rootScope, _DeactivateMediaService_, _HybridServicesClusterService_, _MediaServiceActivationV2_, _Notification_, _ServiceDescriptorService_): void {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    DeactivateMediaService = _DeactivateMediaService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    Notification = _Notification_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  describe('deactivateHybridMediaService - method', function () {
    it('should invoke HybridServicesClusterService getAll', function () {
      spyOn(HybridServicesClusterService, 'deregisterCluster').and.returnValue($q.resolve({}));
      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'disableService').and.returnValue($q.resolve({}));
      spyOn(MediaServiceActivationV2, 'setisMediaServiceEnabled').and.returnValue($q.resolve({}));
      spyOn(MediaServiceActivationV2, 'disableOrpheusForMediaFusion').and.returnValue($q.resolve({}));
      spyOn(MediaServiceActivationV2, 'deactivateHybridMedia').and.returnValue($q.resolve({}));
      spyOn(MediaServiceActivationV2, 'disableMFOrgSettingsForDevOps').and.returnValue($q.resolve({}));
      DeactivateMediaService.deactivateHybridMediaService();
      expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
    });

    it('should notify error when HybridServicesClusterService deregisterCluster call fails', function () {
      const clusters = [{
        id: 'a050fcc7-9ade-4790-a06d-cca596910421',
        name: 'MFA_TEST2',
        targetType: 'mf_mgmt',
        connectors: [{
          state: 'running',
          hostname: 'doesnothavecalendar.example.org',
        }],
      }];
      spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(
        clusters,
      ));
      spyOn(HybridServicesClusterService, 'deregisterCluster').and.returnValue($q.reject({}));
      spyOn(Notification, 'error');
      DeactivateMediaService.deactivateHybridMediaService();
      $httpBackend.verifyNoOutstandingExpectation();
      expect(HybridServicesClusterService.deregisterCluster).toHaveBeenCalled();
      expect(Notification.error).toHaveBeenCalled();
    });
  });
});
