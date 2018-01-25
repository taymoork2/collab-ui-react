describe('SipRegistrationSectionCtrl', () => {
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
      id: '78j3g3',
    };
    initController(cluster);
    expect(HybridServicesClusterService.getProperties).toHaveBeenCalledWith(cluster.id);
    expect(HybridServicesClusterService.getProperties.calls.count()).toBe(1);
  });

  it('should save a SIP trunk with the correct data', () => {
    HybridServicesClusterService.getProperties.and.returnValue($q.resolve({}));
    const cluster = {
      id: 'ui96yew',
    };
    const sipUrl = 'sip://10.30.60.100';
    const ctrl = initController(cluster);
    ctrl.sipurlconfiguration = sipUrl;
    ctrl.saveSipTrunk();
    expect(HybridServicesClusterService.setProperties).toHaveBeenCalledWith(cluster.id, jasmine.objectContaining({
      'mf.ucSipTrunk': sipUrl,
    }));
  });


});
