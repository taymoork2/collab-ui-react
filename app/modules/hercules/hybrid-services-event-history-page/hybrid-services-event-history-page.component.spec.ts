import moduleName from './index';

describe('HybridServicesEventHistoryPageCtrl', () => {

  let $componentController, $scope, $q, HybridServicesClusterService;

  const targetClusterName = 'this is cluster name';
  const targetClusterId = '123';
  const targetHostname = 'this is hostname';
  const targetConnectorId = 'c_cal@666';
  const targetServiceId = 'squared-fusion-cal';

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  afterEach(cleanup);
  beforeEach(initSpies);

  function dependencies (_$componentController_, _$q_, _$rootScope_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function cleanup() {
    $componentController = $q = $scope = HybridServicesClusterService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve([{
      id: targetClusterId,
      name: targetClusterName,
      connectors: [{
        id: targetConnectorId,
        hostname: targetHostname,
      }, {
        id: 'something',
        hostname: targetHostname,
      }, {
        id: 'other id',
        hostname: 'louissaha.example.org',
      }, {
        id: 'third id',
        hostname: 'louissaha.example.org',
      }],
    }]));
  }

  function initController() {
    const controller = $componentController('hybridServicesEventHistoryPage', {}, {
      clusterId: targetClusterId,
      connectorId: targetConnectorId,
      serviceId: targetServiceId,
    });
    controller.$onInit();
    $scope.$apply();
    return controller;
  }

  it('should populate the resource filter with the cluster and all nodes, and pre-select the node with the matching connectorId', () => {
    const ctrl = initController();
    expect(ctrl.resourcesOptions[0]).toEqual(jasmine.objectContaining({
      label: 'hercules.eventHistory.allResources',
      value: 'all',
    }));
    expect(ctrl.resourcesOptions[1]).toEqual(jasmine.objectContaining({
      label: targetClusterName,
      value: targetClusterName,
    }));
    expect(ctrl.resourcesOptions[2]).toEqual(jasmine.objectContaining({
      label: 'louissaha.example.org',
      value: 'louissaha.example.org',
    }));
    expect(ctrl.resourcesOptions[3]).toEqual(jasmine.objectContaining({
      label: targetHostname,
      value: targetHostname,
    }));
    expect(ctrl.selectedResourceFilter).toEqual(jasmine.objectContaining({
      label: targetHostname,
      value: targetHostname,
    }));
  });

  it('should pre-select the services cluster based upon the provided serviceId', () => {
    const ctrl = initController();
    expect(ctrl.selectedServiceFilter).toEqual(jasmine.objectContaining({
      label: `hercules.serviceNames.${targetServiceId}`,
      value: targetServiceId,
    }));
  });

});
