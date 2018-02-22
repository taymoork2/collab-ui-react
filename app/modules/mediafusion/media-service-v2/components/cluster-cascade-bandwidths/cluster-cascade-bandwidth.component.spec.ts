import moduleName from './index';

describe('ClusterCascadeBandwidthController', () => {

  let $componentController, $scope, $q, HybridServicesClusterService, ClusterCascadeBandwidthService;

  interface ICluster {
    id: string;
  }

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$componentController_, $rootScope, _$q_, _ClusterCascadeBandwidthService_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    ClusterCascadeBandwidthService = _ClusterCascadeBandwidthService_;
  }

  function cleanup() {
    $componentController = $scope = $q = HybridServicesClusterService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getProperties');
    spyOn(HybridServicesClusterService, 'setProperties').and.returnValue($q.resolve({}));
    spyOn(ClusterCascadeBandwidthService, 'saveCascadeConfig').and.returnValue($q.resolve({}));
  }

  function initController(cluster?: ICluster) {
    const ctrl = $componentController('clusterCascadeBandwidth', {}, {});
    ctrl.$onChanges({
      cluster: {
        previousValue: undefined,
        currentValue: cluster,
        isFirstChange() {
          return true;
        },
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should get cluster data from FMS when initializing', () => {
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({}));
    const cluster = {
      id: 'fake-id',
    };
    initController(cluster);
    expect(HybridServicesClusterService.getProperties).toHaveBeenCalledWith(cluster.id);
    expect(HybridServicesClusterService.getProperties.calls.count()).toBe(1);
  });

  it('should save cluster cascade bandwidth with the correct data', () => {
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({}));
    const cluster = {
      id: 'fake-id',
    };
    const bandwidthValue = 45;
    const ctrl = initController(cluster);
    ctrl.cascadeBandwidthConfiguration = bandwidthValue;
    ctrl.saveCascadeConfig();
    expect(ClusterCascadeBandwidthService.saveCascadeConfig).toHaveBeenCalledWith(cluster.id, ctrl.cascadeBandwidthConfiguration);
  });

  it('should validate cluster cascade bandwidth with the incorrect data', () => {
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({}));
    const cluster = {
      id: 'fake-id',
    };
    const bandwidthValue = 4;
    const ctrl = initController(cluster);
    ctrl.cascadeBandwidthConfiguration = bandwidthValue;
    ctrl.validate();
    expect(ctrl.inValidValue).toBeTruthy();
  });

  it('should validate cluster cascade bandwidth with the correct data', () => {
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({}));
    const cluster = {
      id: 'fake-id',
    };
    const bandwidthValue = 45;
    const ctrl = initController(cluster);
    ctrl.cascadeBandwidthConfiguration = bandwidthValue;
    ctrl.validate();
    expect(ctrl.inValidValue).toBeFalsy();
  });

});
