import moduleName from './index';

describe('HybridMediaClusterSettingsCtrl', () => {

  let $componentController, $scope, $q, HybridServicesClusterService;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$componentController_, $rootScope, _$q_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function cleanup() {
    $componentController = $scope = $q = HybridServicesClusterService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'get').and.returnValue($q.resolve({}));
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve({}));
  }

  function initController(clusterId?: string) {
    const ctrl = $componentController('hybridMediaClusterSettings', {}, {});
    ctrl.$onChanges({
      clusterId: {
        previousValue: undefined,
        currentValue: clusterId || '1234',
        isFirstChange() {
          return true;
        },
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should get cluster data from FMS when initializing', () => {
    const clusterId = 'something';
    initController(clusterId);
    expect(HybridServicesClusterService.get).toHaveBeenCalledWith(clusterId);
    expect(HybridServicesClusterService.get.calls.count()).toBe(1);
  });

});
