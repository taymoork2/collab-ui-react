'use strict';

describe('Controller: DisableMediaServiceController', function () {
  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Hercules'));

  var controller, HybridServicesClusterService, $q, MediaServiceActivationV2, Notification, httpMock, ServiceDescriptorService;

  // var serviceId = "squared-fusion-media";
  var modalInstance = {
    dismiss: jasmine.createSpy('dismiss'),
    close: jasmine.createSpy('close'),
  };
  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('5632f806-ad09-4a26-a0c0-a49a13f38873'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function ($state, $controller, _$q_, $translate, _MediaServiceActivationV2_, _Notification_, _HybridServicesClusterService_, _$httpBackend_, _ServiceDescriptorService_) {
    $q = _$q_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    Notification = _Notification_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    spyOn($state, 'go');
    httpMock = _$httpBackend_;
    httpMock.when('GET', /^\w+.*/).respond({});
    controller = $controller('DisableMediaServiceController', {
      $state: $state,
      $q: $q,
      $modalInstance: modalInstance,
      $translate: $translate,

      MediaServiceActivationV2: MediaServiceActivationV2,
      Notification: Notification,
      HybridServicesClusterService: HybridServicesClusterService,
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should call the dismiss for cancel', function () {
    controller.cancel();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
  it('should change the value of step to 2 for continue', function () {
    spyOn(controller, 'step');
    controller.continue();
    expect(controller.step).toBe('2');
  });
  it('should call the close and success notifictaion for done', function () {
    spyOn(Notification, 'success');
    controller.done();
    expect(modalInstance.close).toHaveBeenCalled();
    expect(Notification.success).toHaveBeenCalled();
  });
  it('should call HybridServicesClusterService.deregisterCluster for deactivate', function () {
    var respnse = {
      status: 204,
    };
    spyOn(HybridServicesClusterService, 'deregisterCluster').and.returnValue($q.resolve(respnse));
    spyOn(ServiceDescriptorService, 'disableService');
    spyOn(MediaServiceActivationV2, 'setisMediaServiceEnabled');
    spyOn(MediaServiceActivationV2, 'disableOrpheusForMediaFusion');
    spyOn(MediaServiceActivationV2, 'deactivateHybridMedia');
    spyOn(MediaServiceActivationV2, 'disableMFOrgSettingsForDevOps');
    spyOn(controller, 'step');
    controller.clusterIds = ['cluster1', 'cluster2'];
    controller.deactivate();
    httpMock.verifyNoOutstandingExpectation();
    expect(controller.step).toBe('2');
    expect(HybridServicesClusterService.deregisterCluster).toHaveBeenCalled();
    expect(HybridServicesClusterService.deregisterCluster.calls.count()).toEqual(2);
    expect(ServiceDescriptorService.disableService).toHaveBeenCalled();
    expect(MediaServiceActivationV2.setisMediaServiceEnabled).toHaveBeenCalled();
    expect(MediaServiceActivationV2.disableOrpheusForMediaFusion).toHaveBeenCalled();
    expect(MediaServiceActivationV2.deactivateHybridMedia).toHaveBeenCalled();
    expect(MediaServiceActivationV2.disableMFOrgSettingsForDevOps).toHaveBeenCalled();
  });
  it('should notify error when deactivate call fails', function () {
    spyOn(HybridServicesClusterService, 'deregisterCluster').and.returnValue($q.reject({}));
    spyOn(Notification, 'error');
    controller.clusterIds = ['cluster1', 'cluster2'];
    controller.deactivate();
    httpMock.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.deregisterCluster).toHaveBeenCalled();
    expect(Notification.error).toHaveBeenCalled();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  it('HybridServicesClusterService getAll should be called for getClusterList', function () {
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
    controller.getClusterList();
    httpMock.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
  });
});
