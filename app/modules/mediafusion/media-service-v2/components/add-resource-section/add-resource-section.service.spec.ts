import ModuleName from './index';

describe('Service: AddResourceSectionService', () => {
  beforeEach(function () {
    this.initModules(ModuleName);
    this.injectDependencies(
        '$httpBackend',
        '$q',
        //'$window',
        //'$translate',
        'AddResourceSectionService',
        'HybridServicesClusterService',
        'HybridServicesExtrasService',
        'MediaServiceActivationV2',
        'MediaClusterServiceV2',
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

    it('HybridServicesClusterService.preregisterCluster should be called for addRedirectTargetClicked', function () {
      spyOn(this.HybridServicesClusterService, 'preregisterCluster').and.returnValue(this.$q.resolve({ id: '12345' }));
      this.$httpBackend.when('POST', 'https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/orgId/clusters/12345/allowedRegistrationHosts').respond({});
      spyOn(this.MediaClusterServiceV2, 'getPropertySets').and.returnValue(this.$q.resolve({
        data: {
          propertySets: [],
        },
      }));
      this.AddResourceSectionService.addRedirectTargetClicked('hostName', 'enteredCluster');
      expect(this.HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.getPropertySets).toHaveBeenCalled();
    });

    it('should notify error when the preregisterCluster call fails for addRedirectTargetClicked', function () {
      spyOn(this.HybridServicesClusterService, 'preregisterCluster').and.returnValue(this.$q.reject());
      this.AddResourceSectionService.addRedirectTargetClicked('hostName', 'enteredCluster');
      expect(this.HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
    });

    it('MediaServiceActivationV2 enableMediaService should not be called for redirectPopUpAndClose', function () {
      spyOn(this.MediaServiceActivationV2, 'enableMediaService');
      this.AddResourceSectionService.redirectPopUpAndClose('hostName', 'enteredCluster', 'clusterId', true);
      expect(this.MediaServiceActivationV2.enableMediaService).not.toHaveBeenCalled();
    });

    /*it('HybridServicesClusterService.preregisterCluster and MediaClusterServiceV2 createPropertySet,updatePropertySetById should be called for createFirstTimeSetupCluster', function () {
      const respnse = {
        data: { id: '12345' },
      };
      spyOn(this.HybridServicesClusterService, 'preregisterCluster').and.returnValue(this.$q.resolve({ id: '3456' }));
      spyOn(this.MediaClusterServiceV2, 'createPropertySet').and.returnValue(this.$q.resolve(respnse));
      spyOn(this.MediaClusterServiceV2, 'updatePropertySetById').and.returnValue(this.$q.resolve(respnse));
      this.AddResourceSectionService.createFirstTimeSetupCluster('hostName', 'enteredCluster');
      expect(this.HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.createPropertySet).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    });*/

    it('MediaServiceActivationV2 enableMediaServiceEntitlements should be called for enableMediaServiceEntitlements', function () {
      spyOn(this.MediaServiceActivationV2, 'enableMediaServiceEntitlements');
      this.AddResourceSectionService.enableMediaServiceEntitlements();
      expect(this.MediaServiceActivationV2.enableMediaServiceEntitlements).toHaveBeenCalled();
    });
    it('MediaServiceActivationV2 enableMediaService should be called for enableMediaService', function () {
      spyOn(this.MediaServiceActivationV2, 'enableMediaService');
      this.AddResourceSectionService.enableMediaService('123');
      expect(this.MediaServiceActivationV2.enableMediaService).toHaveBeenCalled();
    });
  });
});
