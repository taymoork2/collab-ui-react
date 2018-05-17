'use strict';

describe('AddResourceCommonServiceV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var httpBackend, $q, AddResourceCommonServiceV2, MediaClusterServiceV2, MediaServiceActivationV2, authinfo, Notification, HybridServicesClusterService;
  beforeEach(inject(function (_$q_, _AddResourceCommonServiceV2_, $httpBackend, _MediaClusterServiceV2_, _MediaServiceActivationV2_, _Authinfo_, _Notification_, _HybridServicesClusterService_) {
    authinfo = _Authinfo_;
    authinfo.getOrgId = jasmine.createSpy('getOrgId').and.returnValue('orgId');
    httpBackend = $httpBackend;
    httpBackend.when('GET', /^\w+.*/).respond({});
    AddResourceCommonServiceV2 = _AddResourceCommonServiceV2_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    Notification = _Notification_;
    $q = _$q_;
  }));
  it('HybridServicesClusterService getAll should be called for updateClusterLists', function () {
    var clusters = [{
      id: 'a050fcc7-9ade-4790-a06d-cca596910421',
      name: 'MFA_TEST2',
      targetType: 'mf_mgmt',
      connectors: [{
        state: 'running',
        hostname: 'doesnothavecalendar.example.org',
      }],
    }];
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(
      clusters
    ));
    AddResourceCommonServiceV2.updateClusterLists();
    httpBackend.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
  });
  it('HybridServicesClusterService.preregisterCluster should be called for addRedirectTargetClicked', function () {
    spyOn(HybridServicesClusterService, 'preregisterCluster').and.returnValue($q.resolve({
      id: '12345',
    }));
    httpBackend.when('POST', 'https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/orgId/clusters/12345/allowedRegistrationHosts').respond({});
    spyOn(MediaClusterServiceV2, 'getPropertySets').and.returnValue($q.resolve({
      data: {
        propertySets: [],
      },
    }));
    AddResourceCommonServiceV2.addRedirectTargetClicked('hostName', 'enteredCluster');
    httpBackend.flush();
    expect(HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
    expect(MediaClusterServiceV2.getPropertySets).toHaveBeenCalled();
  });
  it('should notify error when the preregisterCluster call fails for addRedirectTargetClicked', function () {
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(HybridServicesClusterService, 'preregisterCluster').and.returnValue($q.reject());
    AddResourceCommonServiceV2.addRedirectTargetClicked('hostName', 'enteredCluster');
    httpBackend.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 enableMediaService should not be called for redirectPopUpAndClose', function () {
    spyOn(MediaServiceActivationV2, 'enableMediaService');
    AddResourceCommonServiceV2.redirectPopUpAndClose('hostName', 'enteredCluster');
    expect(MediaServiceActivationV2.enableMediaService).not.toHaveBeenCalled();
  });
  it('HybridServicesClusterService.preregisterCluster and MediaClusterServiceV2 createPropertySet,updatePropertySetById should be called for createFirstTimeSetupCluster', function () {
    var respnse = {
      data: { id: '12345' },
    };
    spyOn(HybridServicesClusterService, 'preregisterCluster').and.returnValue($q.resolve({ id: '3456' }));
    spyOn(MediaClusterServiceV2, 'createPropertySet').and.returnValue($q.resolve(respnse));
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.resolve(respnse));
    AddResourceCommonServiceV2.createFirstTimeSetupCluster('hostName', 'enteredCluster');
    httpBackend.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.preregisterCluster).toHaveBeenCalled();
    expect(MediaClusterServiceV2.createPropertySet).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
  });

  it('MediaServiceActivationV2 enableMediaServiceEntitlements should be called for enableMediaServiceEntitlements', function () {
    spyOn(MediaServiceActivationV2, 'enableMediaServiceEntitlements');
    AddResourceCommonServiceV2.enableMediaServiceEntitlements();
    expect(MediaServiceActivationV2.enableMediaServiceEntitlements).toHaveBeenCalled();
  });
  it('MediaServiceActivationV2 enableMediaService should be called for enableMediaService', function () {
    spyOn(MediaServiceActivationV2, 'enableMediaService');
    AddResourceCommonServiceV2.enableMediaService('123');
    expect(MediaServiceActivationV2.enableMediaService).toHaveBeenCalled();
  });
});
