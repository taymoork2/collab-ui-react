'use strict';

describe('Service: DeactivateHybridMediaService', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Hercules'));

  var Service, MediaClusterServiceV2, $q, MediaServiceActivationV2, Notification, httpMock, ServiceDescriptorService;

  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('5632f806-ad09-4a26-a0c0-a49a13f38873'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function ($state, _DeactivateHybridMediaService_, _$q_, $translate, _MediaServiceActivationV2_, _Notification_, _MediaClusterServiceV2_, _HybridServicesClusterService_, _$httpBackend_, _ServiceDescriptorService_) {
    $q = _$q_;
    Service = _DeactivateHybridMediaService_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    Notification = _Notification_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    spyOn($state, 'go');
    httpMock = _$httpBackend_;
    httpMock.when('GET', /^\w+.*/).respond({});
  }));


  it('should call the MediaClusterServiceV2 deleteClusterWithConnector for deactivateMediaService', function () {
    var respnse = {
      status: 204,
    };
    spyOn(MediaClusterServiceV2, 'deleteClusterWithConnector').and.returnValue($q.resolve(respnse));
    spyOn(ServiceDescriptorService, 'disableService');
    spyOn(MediaServiceActivationV2, 'setisMediaServiceEnabled');
    spyOn(MediaServiceActivationV2, 'disableOrpheusForMediaFusion');
    spyOn(MediaServiceActivationV2, 'deactivateHybridMedia');
    spyOn(MediaServiceActivationV2, 'disableMFOrgSettingsForDevOps');
    Service.clusterIds = ['cluster1', 'cluster2'];
    Service.deactivateMediaService();
    httpMock.verifyNoOutstandingExpectation();
    expect(ServiceDescriptorService.disableService).toHaveBeenCalled();
    expect(MediaServiceActivationV2.setisMediaServiceEnabled).toHaveBeenCalled();
    expect(MediaServiceActivationV2.disableOrpheusForMediaFusion).toHaveBeenCalled();
    expect(MediaServiceActivationV2.deactivateHybridMedia).toHaveBeenCalled();
    expect(MediaServiceActivationV2.disableMFOrgSettingsForDevOps).toHaveBeenCalled();
  });
});
