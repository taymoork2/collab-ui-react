import moduleName from './index';

describe('HybridServicesUserSidepanelSectionComponent', () => {

  let $componentController, $q, $scope, $timeout, CloudConnectorService, FeatureToggleService, ServiceDescriptorService, USSService, UserOverviewService;

  beforeEach(angular.mock.module(moduleName));
  afterEach(cleanup);

  function cleanup() {
    $componentController = $q = $scope = CloudConnectorService = FeatureToggleService = ServiceDescriptorService = $timeout = USSService = UserOverviewService = undefined;
  }

  function initController(user?) {
    const ctrl = $componentController('hybridServicesUserSidepanelSection', {}, {
      user: {},
    });
    ctrl.$onChanges({
      user: {
        currentValue: user || {},
      },
    });
    $scope.$apply();
    return ctrl;
  }

  describe('premises-based hybrid services', () => {

    beforeEach(angular.mock.module(mockDependencies));

    function mockDependencies($provide) {
      const Authinfo = {
        getLicenses: jasmine.createSpy('getLicenses').and.returnValue(['license1', 'license2']),
        isEntitled: jasmine.createSpy('isEntitled').and.callFake(service => (service === 'squared-fusion-cal' || service === 'squared-fusion-uc' || service === 'spark-hybrid-impinterop')),
        getOrgId: jasmine.createSpy('getOrgId').and.returnValue('12'),
      };
      $provide.value('Authinfo', Authinfo);
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    function dependencies (_$componentController_, _$q_, $rootScope, _FeatureToggleService_, _ServiceDescriptorService_, _USSService_, _UserOverviewService_) {
      $componentController = _$componentController_;
      $q = _$q_;
      $scope = $rootScope.$new();
      FeatureToggleService = _FeatureToggleService_;
      ServiceDescriptorService = _ServiceDescriptorService_;
      USSService = _USSService_;
      UserOverviewService = _UserOverviewService_;
    }

    function initSpies() {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([{
        id: 'squared-fusion-uc',
        enabled: true,
      }, {
        id: 'squared-fusion-cal',
        enabled: false,
      }, {
        id: 'spark-hybrid-impinterop',
        enabled: true,
      }]));
      spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve({}));
      spyOn(UserOverviewService, 'getUser').and.returnValue($q.resolve({
        user: {
          entitlements: ['ciscouc'],
        },
      }));
    }

    it('should not show the section if there are no licenses assigned to the user', () => {
      const unlicensedUser = {
        licenseID: [],
      };
      const controller = initController(unlicensedUser);
      expect(controller.isLicensed).toBe(false);
    });

    it('should show the section if there is at least one paid license assigned to the user', () => {
      const licensedUser = {
        licenseID: ['This is a paid license'],
      };
      const controller = initController(licensedUser);
      expect(controller.isLicensed).toBe(true);
    });

    it('should amend the services list with setup data from FMS', () => {
      const controller = initController();
      expect(controller.enabledServicesWithStatuses.length).toBe(2);
      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'squared-fusion-cal')).not.toBeDefined();
      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'squared-fusion-uc')).toEqual(jasmine.objectContaining({ id: 'squared-fusion-uc' }));
      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'spark-hybrid-impinterop')).toEqual(jasmine.objectContaining({ id: 'spark-hybrid-impinterop' }));

    });

    it('should tell the admin that hybrid call cannot be enabled if the user is entitled to Huron', () => {
      const controller = initController();
      expect(controller.userIsEnabledForHuron).toBe(true);
    });
  });

  describe('cloud-based hybrid services', () => {

    beforeEach(angular.mock.module(mockDependencies));

    function mockDependencies($provide) {
      const Authinfo = {
        getLicenses: jasmine.createSpy('getLicenses').and.returnValue(['license1', 'license2']),
        isEntitled: jasmine.createSpy('isEntitled').and.callFake((service) => {
          return (service === 'squared-fusion-gcal' || service === 'squared-fusion-cal');
        }),
        getOrgId: jasmine.createSpy('getOrgId').and.returnValue('12'),
      };
      $provide.value('Authinfo', Authinfo);
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    function dependencies (_$componentController_, _$q_, $rootScope, _CloudConnectorService_, _FeatureToggleService_, _ServiceDescriptorService_, _USSService_, _UserOverviewService_) {
      $componentController = _$componentController_;
      $q = _$q_;
      $scope = $rootScope.$new();
      CloudConnectorService = _CloudConnectorService_;
      FeatureToggleService = _FeatureToggleService_;
      ServiceDescriptorService = _ServiceDescriptorService_;
      USSService = _USSService_;
      UserOverviewService = _UserOverviewService_;
    }

    function initSpies() {
      spyOn(CloudConnectorService, 'getService');
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'getServices');
      spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve({}));
      spyOn(UserOverviewService, 'getUser');
    }

    it('should check status with CloudConnectorService if the org is entitled to Google Calendar ', () => {
      CloudConnectorService.getService.and.returnValues($q.resolve({
        provisioned: true,
      }), $q.resolve({
        provisioned: true,
      }));
      ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
        id: 'squared-fusion-gcal',
        enabled: true,
      }, {
        id: 'squared-fusion-cal',
        enabled: true,
      }]));
      initController();
      expect(CloudConnectorService.getService.calls.count()).toBe(2);

    });

    it('should warn the admin if the user has conflicting calendar entitlements ', () => {
      UserOverviewService.getUser.and.returnValue($q.resolve({
        user: {
          entitlements: ['squared-fusion-cal', 'squared-fusion-gcal'],
        },
      }));
      CloudConnectorService.getService.and.returnValues($q.resolve({
        provisioned: true,
      }), $q.resolve({
        provisioned: false,
      }));
      ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
        id: 'squared-fusion-gcal',
        enabled: true,
      }, {
        id: 'squared-fusion-cal',
        enabled: true,
      }]));

      const controller = initController();
      expect(controller.bothCalendarTypesWarning).toBe(true);
    });

    it('should use values provided by the CCC to decide whether or not to show a calendar type', () => {
      UserOverviewService.getUser.and.returnValue($q.resolve({
        user: {
          entitlements: ['squared-fusion-cal'],
        },
      }));
      CloudConnectorService.getService.and.returnValues($q.resolve({
        provisioned: true,
      }), $q.resolve({
        provisioned: false,
      }));
      ServiceDescriptorService.getServices.and.returnValue($q.resolve([{
        id: 'squared-fusion-gcal',
        enabled: false,
      }, {
        id: 'squared-fusion-cal',
        enabled: false,
      }]));

      const controller = initController();
      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'squared-fusion-gcal')).not.toBeDefined();
      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'squared-fusion-cal')).toEqual(jasmine.objectContaining({ id: 'squared-fusion-cal' }));
    });

  });

  describe('USS and callback usage', () => {

    beforeEach(angular.mock.module(mockDependencies));

    function mockDependencies($provide) {
      const Authinfo = {
        getLicenses: jasmine.createSpy('getLicenses').and.returnValue(['license1', 'license2']),
        isEntitled: jasmine.createSpy('isEntitled').and.callFake(service => (service === 'squared-fusion-uc' || service === 'spark-hybrid-impinterop')),
        getOrgId: jasmine.createSpy('getOrgId').and.returnValue('12'),
      };
      $provide.value('Authinfo', Authinfo);
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    function dependencies (_$componentController_, _$q_, $rootScope, _$timeout_, _FeatureToggleService_, _ServiceDescriptorService_, _USSService_) {
      $componentController = _$componentController_;
      $q = _$q_;
      $scope = $rootScope.$new();
      $timeout = _$timeout_;
      FeatureToggleService = _FeatureToggleService_;
      ServiceDescriptorService = _ServiceDescriptorService_;
      USSService = _USSService_;
    }

    function initSpies() {
      spyOn($timeout, 'cancel').and.callThrough();
      spyOn(USSService, 'getStatusesForUser');
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'getServices').and.returnValue($q.resolve([{
        id: 'squared-fusion-uc',
        enabled: true,
      }]));
    }

    it('should call USS with the correct userId', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve({}));
      const userId = '12345';
      const user = {
        id: userId,
        name: 'Marcus Aurelius',
      };
      initController(user);
      expect(USSService.getStatusesForUser).toHaveBeenCalledWith(userId);
    });

    it('should use USS data to populate services statuses for the user', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve([{
        serviceId: 'squared-fusion-uc',
        state: 'activated',
      }, {
        serviceId: 'spark-hybrid-impinterop',
        state: 'notActivated',
      }]));
      const controller = initController();

      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'squared-fusion-uc').status.state).toEqual('activated');
      expect(_.find(controller.enabledServicesWithStatuses, (service: any) => service.id === 'spark-hybrid-impinterop')).not.toBeDefined();
    });

    it('should start subscribing to recurring updates, and call USS once for every $timeout cycle', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve({}));
      const controller = initController();

      expect(controller.userSubscriptionTimer).toBeDefined();
      expect(USSService.getStatusesForUser.calls.count()).toBe(1);
      $timeout.flush();
      expect(USSService.getStatusesForUser.calls.count()).toBe(2);
      $timeout.flush();
      expect(USSService.getStatusesForUser.calls.count()).toBe(3);
    });

    it('should cancel the USS subscription on destroy', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve({}));
      const controller = initController();

      expect(controller.userSubscriptionTimer).toBeDefined();
      controller.$onDestroy();
      expect($timeout.cancel).toHaveBeenCalledTimes(1);
      expect($timeout.cancel).toHaveBeenCalledWith(controller.userSubscriptionTimer);
    });

  });
});
