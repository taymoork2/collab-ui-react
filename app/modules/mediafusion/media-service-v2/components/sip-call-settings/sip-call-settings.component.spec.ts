import moduleName from './index';

describe('SipCallSettingsController', () => {

  let $componentController, $q, $scope;

  interface ICluster {
    id: string;
  }

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  afterEach(cleanup);

  function dependencies(_$componentController_, _$q_, $rootScope) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
  }

  function cleanup() {
    $componentController = $q = $scope = undefined;
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
