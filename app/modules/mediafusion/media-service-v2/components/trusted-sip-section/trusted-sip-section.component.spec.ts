
describe('TrustedSipSectionCtrl', () => {

  let $componentController, $scope, $q, HybridServicesClusterService;

  beforeEach(angular.mock.module('Mediafusion'));

  interface ICluster {
    id: string;
  }

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, $rootScope, _$q_, _HybridServicesClusterService_) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    $q = _$q_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function cleanup() {
    $componentController = $scope = $q = HybridServicesClusterService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'setProperties').and.returnValue($q.resolve({}));
    spyOn(HybridServicesClusterService, 'getProperties');
  }

  function initController(cluster?: ICluster) {
    const ctrl = $componentController('trustedSipSection', {}, {});
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
      id: '78j3g3',
    };
    initController(cluster);
    expect(HybridServicesClusterService.getProperties).toHaveBeenCalledWith(cluster.id);
    expect(HybridServicesClusterService.getProperties.calls.count()).toBe(1);
  });

  it('should read and parse trusted SIP sources', () => {
    const cluster = {
      id: 'ty6y3g-egue63-ty632',
    };
    const source1 = 'Doc';
    const source2 = 'Grumpy';
    const source3 = 'Happy';
    const source4 = 'Sleepy';
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({
      'mf.trustedSipSources': `${source1}, ${source2}, ${source3}, ${source4}`,
    }));

    const ctrl = initController(cluster);
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
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({}));

    const cluster = {
      id: '56t723',
    };
    const source1 = 'registrar.example.org';
    const source2 = 'proxy.example.org';
    const sipSources = [{
      text: source1,
    }, {
      text: source2,
    }];
    const ctrl = initController(cluster);
    ctrl.trustedsipconfiguration = sipSources;
    ctrl.saveTrustedSip();
    expect(HybridServicesClusterService.setProperties).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
      'mf.trustedSipSources': `${source1}, ${source2}`,
    }));
  });

});
