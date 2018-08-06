import ModuleName from './index';

describe('Service: MediaEncryptionSectionService', function () {
  beforeEach(function () {
    this.initModules(ModuleName);
    this.initModules('Mediafusion');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'HybridServicesClusterService',
      'MediaClusterServiceV2',
      'MediaEncryptionSectionService',
      'Notification',
      'Orgservice',
    );
    spyOn(this.HybridServicesClusterService, 'setProperties').and.returnValue(this.$q.resolve({}));
    spyOn(this.MediaClusterServiceV2, 'createPropertySet').and.returnValue(this.$q.resolve({
      data: {
        id: '1234',
      },
    }));
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Notification, 'success');
  });
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('check functionality of mediaEncryptionSection', function () {

    it('should check if createPropertySetAndAssignClusters creates propertysets and assigns clusters', function () {
      spyOn(this.MediaClusterServiceV2, 'updatePropertySetById').and.returnValue(this.$q.resolve({}));
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
      this.MediaEncryptionSectionService.createPropertySetAndAssignClusters();
      this.$httpBackend.verifyNoOutstandingExpectation();
      expect(this.HybridServicesClusterService.getAll).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.createPropertySet).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    });

    it('should check if createPropertySetAndAssignClusters creates propertysets and assigns clusters has errors we get notification', function () {
      spyOn(this.MediaClusterServiceV2, 'updatePropertySetById').and.returnValue(this.$q.reject());
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
      this.MediaEncryptionSectionService.createPropertySetAndAssignClusters();

      this.$httpBackend.verifyNoOutstandingExpectation();
      expect(this.HybridServicesClusterService.getAll).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.createPropertySet).toHaveBeenCalled();
      expect(this.MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

  });
});
