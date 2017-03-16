'use strict';

describe('Controller: MediaServiceSettingsControllerV2', function () {
  var controller, FusionClusterService, MediaClusterServiceV2, Notification, Analytics, clusters, $q, httpBackend;

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function ($controller, $httpBackend, $stateParams, _FusionClusterService_, _MediaClusterServiceV2_, _Notification_, _$q_, _Analytics_) {
    clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST1",
      "connectors": [{
        "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "hostname": "10.196.5.251",
      }, {
        "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
        "connectorType": "mf_mgmt",
        "hostname": "10.196.5.246",
      }],
      "releaseChannel": "DEV",
      "targetType": "mf_mgmt",
    }];
    FusionClusterService = _FusionClusterService_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    Notification = _Notification_;
    Analytics = _Analytics_;
    $q = _$q_;
    httpBackend = $httpBackend;
    httpBackend.when('GET', /^\w+.*/).respond({});
    spyOn(MediaClusterServiceV2, 'getV1Clusters').and.returnValue({
      then: _.noop,
    });
    controller = $controller('MediaServiceSettingsControllerV2', {
      $stateParams: $stateParams,
      FusionClusterService: FusionClusterService,
      MediaClusterServiceV2: MediaClusterServiceV2,
      Notification: Notification,
      Analytics: Analytics,
      $q: $q,
      hasMFVIdeoFeatureToggle: false,
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('check if setEnableVideoQuality sets the tag', function () {
    controller.enableVideoQuality = true;
    spyOn(FusionClusterService, 'getAll').and.returnValue($q.resolve(clusters));
    spyOn(MediaClusterServiceV2, 'setProperties').and.returnValue($q.resolve({}));
    controller.setEnableVideoQuality();
    httpBackend.verifyNoOutstandingExpectation();
    expect(controller.clusterCount).toBe(1);
    expect(MediaClusterServiceV2.setProperties).toHaveBeenCalled();
    expect(FusionClusterService.getAll).toHaveBeenCalled();
  });
});
