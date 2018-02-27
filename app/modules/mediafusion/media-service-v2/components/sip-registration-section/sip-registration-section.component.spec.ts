import moduleName from './index';

describe('SipRegistrationSectionCtrl', () => {
  let $componentController, $scope, $q, HybridServicesClusterService, SipRegistrationSectionService;

  beforeEach(angular.mock.module(moduleName));

  interface ICluster {
    id: string;
  }

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, _$q_, $rootScope, _HybridServicesClusterService_, _SipRegistrationSectionService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    SipRegistrationSectionService = _SipRegistrationSectionService_;
  }

  function cleanup() {
    $componentController = $scope = $q = HybridServicesClusterService = SipRegistrationSectionService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getProperties').and.returnValue($q.resolve({}));
    spyOn(HybridServicesClusterService, 'setProperties').and.returnValue($q.resolve({}));
    spyOn(SipRegistrationSectionService, 'saveSipTrunkUrl').and.returnValue($q.resolve({}));
  }

  function initController(cluster?: ICluster) {
    const ctrl = $componentController('sipRegistrationSection', {}, {});
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

  it('should save a SIP trunk with the correct data', () => {
    const cluster = {
      id: 'fake-id',
    };
    const ctrl = initController(cluster);
    ctrl.saveSipTrunk();
    expect(SipRegistrationSectionService.saveSipTrunkUrl).toHaveBeenCalled();
  });

});
