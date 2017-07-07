'use strict';

describe('Directive Controller: HybridServicesCtrl', function () {
  beforeEach(angular.mock.module('Hercules'));

  var vm, $rootScope, $controller, $timeout, $q, Authinfo, Config, USSService, ServiceDescriptorService, Userservice, CloudConnectorService, FeatureToggleService;

  beforeEach(inject(function (_$rootScope_, _$controller_, _$timeout_, _Config_, _USSService_, _ServiceDescriptorService_, _$q_, _Userservice_, _CloudConnectorService_, _FeatureToggleService_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    Config = _Config_;
    USSService = _USSService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    $q = _$q_;
    Userservice = _Userservice_;
    CloudConnectorService = _CloudConnectorService_;
    FeatureToggleService = _FeatureToggleService_;

    Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('dead-beef-123'),
      isEntitled: jasmine.createSpy('isEntitled').and.returnValue(true),
      isFusion: jasmine.createSpy('isFusion').and.returnValue(true),
      getLicenses: jasmine.createSpy('getLicenses').and.returnValue([]),
    };

    spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve());
    spyOn(Userservice, 'isInvitePending').and.returnValue(false);
    spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({ setup: false }));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
  }));

  it('should start with isEnabled as false', function () {
    vm = createController({});
    expect(vm.isEnabled).toBe(false);
  });

  it('should call ServiceDescriptorService.getServices if the org has no license', function () {
    vm = createController({});
    $rootScope.$digest();
    expect(ServiceDescriptorService.getServices).toHaveBeenCalled();
  });

  it('should call ServiceDescriptorService.getServices if the org has a license and the user too', function () {
    vm = createController({
      licenseID: ['MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com'],
    }, ['MC']);
    $rootScope.$digest();
    expect(ServiceDescriptorService.getServices).toHaveBeenCalled();
  });

  it('should NOT call ServiceDescriptorService.getServices if the org has a license and but NOT the user', function () {
    vm = createController({}, ['MC']);
    $rootScope.$digest();
    expect(ServiceDescriptorService.getServices).not.toHaveBeenCalled();
  });

  it('should show aggregated status as error when Aware and Connects is entitled and Aware is activated but Connect is error', function () {
    vm = createController({}, ['MC']);

    var fusionUcNotActivated = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      state: 'notActivated',
    };

    vm.extensions = [{
      id: 'squared-fusion-cal',
      entitled: false,
      enabled: true,
    }, {
      id: 'squared-fusion-uc',
      entitled: true,
      enabled: true,
      status: fusionUcNotActivated,
    }, {
      id: 'squared-fusion-ec',
      entitled: true,
      enabled: true,
      status: {
        serviceId: 'squared-fusion-ec',
        entitled: true,
        state: 'error',
      },
    }];
    var mostSignificantStatus = vm.getStatus(fusionUcNotActivated);

    $rootScope.$digest();
    expect(mostSignificantStatus).toBe('error');
  });

  it('should show aggregated status as not activated when Aware and Connects is entitled but both statuses are not activated', function () {
    vm = createController({}, ['MC']);

    var fusionUcNotActivated = {
      serviceId: 'squared-fusion-uc',
      entitled: true,
      state: 'notActivated',
    };

    vm.extensions = [{
      id: 'squared-fusion-cal',
      entitled: false,
      enabled: true,
    }, {
      id: 'squared-fusion-uc',
      entitled: true,
      enabled: true,
      status: fusionUcNotActivated,
    }, {
      id: 'squared-fusion-ec',
      entitled: true,
      enabled: true,
      status: {
        serviceId: 'squared-fusion-ec',
        entitled: true,
        state: 'notActivated',
      },
    }];
    var mostSignificantStatus = vm.getStatus(fusionUcNotActivated);

    $rootScope.$digest();
    expect(mostSignificantStatus).toBe('pending_activation');
  });

  it('should show aggregated status as unknown when both Aware and Connects not entitled for user', function () {
    vm = createController({}, ['MC']);

    vm.extensions = [{
      id: 'squared-fusion-cal',
      entitled: false,
      enabled: true,
    }, {
      id: 'squared-fusion-uc',
      entitled: false,
      enabled: true,
    }, {
      id: 'squared-fusion-ec',
      entitled: false,
      enabled: true,
    }];
    var mostSignificantStatus = vm.getStatus(undefined);

    $rootScope.$digest();
    expect(mostSignificantStatus).toBe('unknown');
  });

  function createController(user, orgLicenses) {
    if (orgLicenses) {
      Authinfo.getLicenses.and.returnValue(orgLicenses);
    }
    return $controller('HybridServicesCtrl', {
      $scope: $rootScope.$new(),
      $timeout: $timeout,
      Authinfo: Authinfo,
      Config: Config,
      USSService: USSService,
      ServiceDescriptorService: ServiceDescriptorService,
    }, {
      user: user,
    });
  }
});
