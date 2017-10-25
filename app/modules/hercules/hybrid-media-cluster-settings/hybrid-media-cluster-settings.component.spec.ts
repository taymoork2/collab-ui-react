import moduleName from './index';

describe('HybridMediaClusterSettingsCtrl', () => {

  let $componentController, $scope, $q, ClusterService, HybridServicesClusterService;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, $rootScope, _$q_, _ClusterService_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    ClusterService = _ClusterService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function cleanup() {
    $componentController = $scope = $q = ClusterService = HybridServicesClusterService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'get').and.returnValue($q.resolve({}));
    spyOn(ClusterService, 'setProperties').and.returnValue($q.resolve({}));
    spyOn(ClusterService, 'getProperties');
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
    ClusterService.getProperties.and.returnValue($q.resolve({}));

    const clusterId = 'something';
    initController(clusterId);
    expect(HybridServicesClusterService.get).toHaveBeenCalledWith(clusterId);
    expect(HybridServicesClusterService.get.calls.count()).toBe(1);
    expect(ClusterService.getProperties).toHaveBeenCalledWith(clusterId);
    expect(ClusterService.getProperties.calls.count()).toBe(1);
  });

  it('should save a SIP trunk with the correct data', () => {
    ClusterService.getProperties.and.returnValue($q.resolve({}));

    const clusterId = 'something';
    const sipUrl = 'sip://10.30.60.100';
    const ctrl = initController(clusterId);
    ctrl.sipurlconfiguration = sipUrl;
    ctrl.saveSipTrunk();
    expect(ClusterService.setProperties).toHaveBeenCalledWith(clusterId, jasmine.objectContaining({
      'mf.ucSipTrunk': sipUrl,
    }));
  });

  it('should read and parse trusted SIP sources', () => {
    const source1 = 'Doc';
    const source2 = 'Grumpy';
    const source3 = 'Happy';
    const source4 = 'Sleepy';
    ClusterService.getProperties.and.returnValue($q.resolve({
      'mf.trustedSipSources': `${source1}, ${source2}, ${source3}, ${source4}`,
    }));

    const ctrl = initController();
    expect(ctrl.trustedsipconfiguration[0]).toEqual(jasmine.objectContaining({
      text: source1,
    }));
    expect(ctrl.trustedsipconfiguration[1]).toEqual(jasmine.objectContaining({
      text: source2,
    }));
    expect(ctrl.trustedsipconfiguration[2]).toEqual(jasmine.objectContaining({
      text: source3,
    }));
    expect(ctrl.trustedsipconfiguration[3]).toEqual(jasmine.objectContaining({
      text: source4,
    }));
  });

  it('should save a list of trusted SIP sources with the correct data', () => {
    ClusterService.getProperties.and.returnValue($q.resolve({}));

    const clusterId = 'something';
    const source1 = 'registrar.example.org';
    const source2 = 'proxy.example.org';
    const sipSources = [{
      text: source1,
    }, {
      text: source2,
    }];
    const ctrl = initController(clusterId);
    ctrl.trustedsipconfiguration = sipSources;
    ctrl.saveTrustedSip();
    expect(ClusterService.setProperties).toHaveBeenCalledWith(clusterId, jasmine.objectContaining({
      'mf.trustedSipSources': `${source1}, ${source2}`,
    }));
  });

});
