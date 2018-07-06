import moduleName from './index';

describe('QosSectionCtrl', () => {

  let $componentController, $httpBackend, $q, $scope, AddResourceSectionService, HybridServicesClusterService, MediaClusterServiceV2, Notification, Orgservice;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module(moduleName));

  const sampleCluster = [{
    id: 'sample-id',
    name: 'TEST-NAME',
    connectors: [{
      id: 'sample-id',
      connectorType: 'mf-mgmt',
      upgradeState: 'some-state',
      hostname: '1.1.1.1',
      maintenanceMode: 'off',
      state: 'running',
    }, {
      id: 'sample-id',
      connectorType: 'mf-mgmt',
      hostname: '1.2.3.4',
      maintenanceMode: 'off',
      state: 'running',
    }],
    releaseChannel: 'some-channel',
    targetType: 'mf-mgmt',
  }];

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$httpBackend_, _$q_, $rootScope, _AddResourceSectionService_, _HybridServicesClusterService_, _MediaClusterServiceV2_, _Notification_, _Orgservice_) {
    $componentController = _$componentController_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope.$new();
    AddResourceSectionService = _AddResourceSectionService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
  }

  function cleanup() {
    $componentController = $httpBackend = $q = $scope = AddResourceSectionService = HybridServicesClusterService = MediaClusterServiceV2 = Notification = Orgservice = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(sampleCluster));
    spyOn(AddResourceSectionService, 'getClusterList').and.returnValue($q.resolve(sampleCluster));
    spyOn(HybridServicesClusterService, 'getQosStateForConnector').and.returnValue($q.resolve(true));
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
    const ctrl = $componentController('qosSection', { $scope: {} }, bindings);
    return ctrl;
  }

  it('should check if setQos sets the tag if qosPropertySetId is present', function () {
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.resolve({}));
    const controller = initController();
    controller.enableQos = true;
    controller.qosPropertySetId = '1234';
    controller.setEnableQos(true);
    $httpBackend.verifyNoOutstandingExpectation();
    expect(Orgservice.setOrgSettings).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    expect(Notification.success).toHaveBeenCalled();
  });

  it('should check if setQos if qosPropertySetId is present has error we get notification', function () {
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.reject());
    const controller = initController();
    controller.enableQos = true;
    controller.qosPropertySetId = '1234';
    controller.setEnableQos(true);
    $httpBackend.verifyNoOutstandingExpectation();
    expect(Orgservice.setOrgSettings).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });

  it('should check if setQos gets property sets if qosPropertySetId is null', function () {
    spyOn(MediaClusterServiceV2, 'getPropertySets').and.returnValue($q.resolve({}));
    const controller = initController();
    controller.enableQos = true;
    controller.qosPropertySetId = null;
    controller.setEnableQos(true);
    $httpBackend.verifyNoOutstandingExpectation();
    expect(Orgservice.setOrgSettings).toHaveBeenCalled();
    expect(MediaClusterServiceV2.getPropertySets).toHaveBeenCalled();
  });

  it('should check if createPropertySetAndAssignClusters creates propertysets and assigns clusters', function () {
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.resolve({}));
    const controller = initController();
    controller.createPropertySetAndAssignClusters();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
    expect(MediaClusterServiceV2.createPropertySet).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    expect(controller.clusters.length).toBe(0);
    expect(controller.qosPropertySetId).toBe('1234');
  });

  it('should check if createPropertySetAndAssignClusters creates propertysets and assigns clusters has errors we get notification', function () {
    spyOn(MediaClusterServiceV2, 'updatePropertySetById').and.returnValue($q.reject());
    const controller = initController();
    controller.createPropertySetAndAssignClusters();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.getAll).toHaveBeenCalled();
    expect(MediaClusterServiceV2.createPropertySet).toHaveBeenCalled();
    expect(MediaClusterServiceV2.updatePropertySetById).toHaveBeenCalled();
    expect(controller.clusters.length).toBe(0);
    expect(controller.qosPropertySetId).toBe('1234');
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });

  it('should get Connector QoS state for each cluster when isQosOn is true', function () {
    const controller = initController();
    controller.getConnectorQosState();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(HybridServicesClusterService.getQosStateForConnector).toHaveBeenCalled();
    expect(controller.connectorQosEnabledCount).toBe(2);
    expect(controller.connectorQosDisabledCount).toBe(0);
    expect(controller.connectorQosStatus).toBe(true);
  });

  it('should get Connector QoS state for org as success', function () {
    const controller = initController();
    controller.enableQos = true;
    controller.connectorCount = 2;
    controller.connectorQosEnabledCount = 2;
    controller.qosStateMessage();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(controller.qosStatus).toBe('success');
  });

  it('should get Connector QoS state for org with warning', function () {
    const controller = initController();
    controller.enableQos = false;
    controller.connectorQosEnabledCount = 2;
    controller.qosStateMessage();
    $httpBackend.verifyNoOutstandingExpectation();
    expect(controller.qosStatus).toBe('warning');
  });

});
