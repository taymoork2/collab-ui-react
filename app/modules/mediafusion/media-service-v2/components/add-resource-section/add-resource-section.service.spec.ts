import ModuleName from './index';

describe('Service: AddResourceSectionService', function () {
  beforeEach(function () {
    this.initModules(ModuleName);
    this.initModules('Mediafusion');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'AddResourceSectionService',
      'HybridServicesClusterService',
      'HybridServicesExtrasService',
    );
    spyOn(this.HybridServicesClusterService, 'setProperties').and.returnValue(this.$q.resolve({}));
  });
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('check functionality of addResourceSection', function () {
    it('HybridServicesClusterService getAll should be called for getClusterList', function () {
      const clusters = [{
        id: 'a050fcc7-9ade-4790-a06d-cca596910421',
        name: 'MFA_TEST2',
        targetType: 'mf_mgmt',
        connectors: [{
          state: 'running',
          hostname: 'doesnothavecalendar.example.org',
        }],
      }];
      spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve(clusters));

      this.AddResourceSectionService.getClusterList();
      expect(this.HybridServicesClusterService.getAll).toHaveBeenCalled();
    });

    it('HybridServicesClusterService getAll should be called for updateClusterLists', function () {
      const clusters = [{
        id: 'a050fcc7-9ade-4790-a06d-cca596910421',
        name: 'MFA_TEST2',
        targetType: 'mf_mgmt',
        connectors: [{
          state: 'running',
          hostname: 'doesnothavecalendar.example.org',
        }],
      }];
      spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve(clusters));

      this.AddResourceSectionService.updateClusterLists();
      expect(this.HybridServicesClusterService.getAll).toHaveBeenCalled();
    });

    it('HybridServicesClusterService preregisterCluster should be called for addRedirectTargetClicked', function () {
      spyOn(this.HybridServicesClusterService, 'preregisterCluster').and.returnValue(this.$q.resolve({ id: '12345' }));
      this.$httpBackend.when('POST', 'https: hercules-intb.ciscospark.com/hercules/api/v2/organizations/orgId/clusters/12345/allowedRegistrationHosts').respond({});
      this.AddResourceSectionService.addRedirectTargetClicked('hostName', 'enteredCluster');
      expect(this.HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
    });

    it('should notify error when the preregisterCluster call fails for addRedirectTargetClicked', function () {
      spyOn(this.HybridServicesClusterService, 'preregisterCluster').and.returnValue(this.$q.reject());
      this.AddResourceSectionService.addRedirectTargetClicked('hostName', 'enteredCluster');
      expect(this.HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
    });

  });
});
