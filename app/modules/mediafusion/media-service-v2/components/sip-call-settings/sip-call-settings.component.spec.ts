import moduleName from './index';

describe('SipCallSettingsController', () => {

  let $componentController, $modal, $state, $q, $scope, HybridServicesClusterService;
  let SipRegistrationSectionService;
  let TrustedSipSectionService;

  interface ICluster {
    id: string;
  }

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$componentController_, _$modal_, _$state_, _$q_, $rootScope, _HybridServicesClusterService_, _SipRegistrationSectionService_, _TrustedSipSectionService_) {
    $componentController = _$componentController_;
    $modal = _$modal_;
    $state = _$state_;
    $q = _$q_;
    $scope = $rootScope.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
    SipRegistrationSectionService = _SipRegistrationSectionService_;
    TrustedSipSectionService = _TrustedSipSectionService_;
  }

  function cleanup() {
    $componentController = $modal = $state = $q = $scope = HybridServicesClusterService = undefined;
  }

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getProperties').and.returnValue($q.resolve({}));
    spyOn(SipRegistrationSectionService, 'saveSipTrunkUrl').and.returnValue($q.resolve({}));
    spyOn(TrustedSipSectionService, 'saveSipConfigurations');
  }

  function initController(cluster?: ICluster) {
    const ctrl = $componentController('sipCallSettings', {}, {});
    ctrl.$onChanges({
      cluster: {
        currentValue: cluster,
      },
      isWizard : {
        currentValue: true,
      },
      mfToggle : {
        currentValue: true,
      },
      mfTrustedToggle : {
        currentValue: true,
      },
      mfCascadeToggle : {
        currentValue: true,
      },
      mfWizardToggle : {
        currentValue: true,
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('controller update cascadeBandwidth', function () {
    const cluster = {
      id: 'fake-id',
    };
    const sampleData = {
      cascadeBandwidth: 45,
      inValidBandwidth: true,
    };
    const ctrl = initController(cluster);
    ctrl.cascadeBandwidthUpdated(sampleData);
    expect(ctrl.cascadeBandwidth).toBe(45);
    expect(ctrl.validCascadeBandwidth).toBe(true);
  });

  it('controller update trusted sip details', function () {
    const cluster = {
      id: 'fake-id',
    };
    const sampleData = {
      trustedsipconfiguration: 'Sample.123',
    };
    const ctrl = initController(cluster);
    ctrl.trustedSipConfigUpdated(sampleData);
    expect(ctrl.trustedsipconfiguration).toBe('Sample.123');
  });

  it('controller update sip config details', function () {
    const cluster = {
      id: 'fake-id',
    };
    const sampleData = {
      sipConfigUrl: 'Sample//.sip.123',
    };
    const ctrl = initController(cluster);
    ctrl.sipConfigUrlUpdated(sampleData);
    expect(ctrl.sipConfigUrl).toBe('Sample//.sip.123');
  });

});
