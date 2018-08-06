import moduleName from './index';

describe('MediaEncryptionSectionCtrl', () => {

  let $componentController, $httpBackend, $q, $scope, HybridServicesClusterService, MediaClusterServiceV2, Notification, Orgservice;

  beforeEach(angular.mock.module(moduleName));

  const sampleCluster = [{
    id: 'sample-id',
    name: 'TEST-NAME',
    connectors: [{
      id: 'sample-id',
      connectorType: 'mf-mgmt',
      upgradeState: 'some-state',
      hostname: '1.1.1.1',
    }, {
      id: 'sample-id',
      connectorType: 'mf-mgmt',
      hostname: '1.1.1.1',
    }],
    releaseChannel: 'some-channel',
    targetType: 'mf-mgmt',
  }];

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$httpBackend_, _$q_, $rootScope, _HybridServicesClusterService_, _MediaClusterServiceV2_, _Notification_, _Orgservice_) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
  }

  function cleanup() {
    $componentController = $httpBackend = $q = $scope = HybridServicesClusterService = MediaClusterServiceV2 = Notification = Orgservice = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(sampleCluster));
    spyOn(MediaClusterServiceV2, 'createPropertySet').and.returnValue($q.resolve({
      data: {
        id: '1234',
      },
    }));
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(Notification, 'success');
    spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.resolve({}));
  }

  function initController(bindings = {}) {
    const ctrl = $componentController('mediaEncryptionSection', { $scope: {} }, bindings);
    return ctrl;
  }

  it('should check if setMediaEncryption sets the tag if mediaEncryptionPropertySetId is present', function () {
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.resolve({}));
    const controller = initController();
    controller.enableMediaEncryption = true;
    controller.mediaEncryptionPropertySetId = '1234';
    controller.setMediaEncryption(true);
    $httpBackend.verifyNoOutstandingExpectation();
    expect(Orgservice.setOrgSettings).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    expect(Notification.success).toHaveBeenCalled();
  });

  it('should check if setMediaEncryption if mediaEncryptionPropertySetId is present has error we get notification', function () {
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.reject());
    const controller = initController();
    controller.enableMediaEncryption = true;
    controller.mediaEncryptionPropertySetId = '1234';
    controller.setMediaEncryption(true);
    $httpBackend.verifyNoOutstandingExpectation();
    expect(Orgservice.setOrgSettings).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });

  it('should check if setenableMediaEncryption gets property sets if mediaEncryptionPropertySetId is null', function () {
    spyOn(MediaClusterServiceV2, 'getPropertySets').and.returnValue($q.resolve({}));
    const controller = initController();
    controller.enableMediaEncryption = true;
    controller.mediaEncryptionPropertySetId = null;
    controller.setMediaEncryption(true);
    $httpBackend.verifyNoOutstandingExpectation();
    expect(Orgservice.setOrgSettings).toHaveBeenCalled();
    expect(MediaClusterServiceV2.getPropertySets).toHaveBeenCalled();
  });

});
