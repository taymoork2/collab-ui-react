import moduleName from './index';

describe('HybridServicesUserSidepanelSectionComponent', () => {

  let $componentController, $q, $scope, CloudConnectorService, FeatureToggleService, ServiceDescriptorService, $timeout, USSService;

  const defaultUser = {
    name: 'Julius Caesar',
    entitlements: [],
  };

  beforeEach(angular.mock.module(moduleName));
  afterEach(cleanup);

  function cleanup() {
    $componentController = $q = $scope = CloudConnectorService = FeatureToggleService = ServiceDescriptorService = $timeout = USSService = undefined;
  }

  function initController(user?) {
    const ctrl = $componentController('hybridServicesUserSidepanelSection', {}, {
      user: user || defaultUser,
    });
    ctrl.$onChanges({
      user: {
        previousValue: undefined,
        currentValue: user || defaultUser,
        isFirstChange() {
          return true;
        },
      },
    });
    $scope.$apply();
    return ctrl;
  }

  describe('premises-based hybrid services', () => {

    beforeEach(angular.mock.module(mockDependencies));

    function mockDependencies($provide) {
      const Authinfo = {
        isEntitled: jasmine.createSpy('isEntitled').and.callFake(service => (service === 'squared-fusion-cal' || service === 'squared-fusion-uc' || service === 'spark-hybrid-impinterop')),
        getOrgId: jasmine.createSpy('getOrgId').and.returnValue('12'),
      };
      $provide.value('Authinfo', Authinfo);
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    function dependencies (_$componentController_, _$q_, $rootScope, _FeatureToggleService_, _ServiceDescriptorService_, _USSService_) {
      $componentController = _$componentController_;
      $q = _$q_;
      $scope = $rootScope.$new();
      FeatureToggleService = _FeatureToggleService_;
      ServiceDescriptorService = _ServiceDescriptorService_;
      USSService = _USSService_;
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
    }

    it('should only take into account the hybrid services an org is entitled to in CI if they are set up in either FMS or CCC', () => {
      const controller = initController();
      expect(controller.servicesWithStatuses.length).toBe(2);
    });

    it('should amend the services list with setup data from FMS', () => {
      const controller = initController();
      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'squared-fusion-cal')).not.toBeDefined();
      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'squared-fusion-uc')).toEqual(jasmine.objectContaining({ id: 'squared-fusion-uc' }));
      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'spark-hybrid-impinterop')).toEqual(jasmine.objectContaining({ id: 'spark-hybrid-impinterop' }));

    });

    it('should tell the admin that hybrid call cannot be enabled if the user is entitled to Huron', () => {
      const huronUser = {
        name: 'Caligula',
        entitlements: ['ciscouc'],
      };

      const controller = initController(huronUser);
      expect(controller.userIsEnabledForHuron).toBe(true);

    });
  });

  describe('cloud-based hybrid services', () => {

    beforeEach(angular.mock.module(mockDependencies));

    function mockDependencies($provide) {
      const Authinfo = {
        isEntitled: jasmine.createSpy('isEntitled').and.callFake((service) => {
          return (service === 'squared-fusion-gcal' || service === 'squared-fusion-cal');
        }),
        getOrgId: jasmine.createSpy('getOrgId').and.returnValue('12'),
      };
      $provide.value('Authinfo', Authinfo);
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    function dependencies (_$componentController_, _$q_, $rootScope, _CloudConnectorService_, _FeatureToggleService_, _ServiceDescriptorService_, _USSService_) {
      $componentController = _$componentController_;
      $q = _$q_;
      $scope = $rootScope.$new();
      CloudConnectorService = _CloudConnectorService_;
      FeatureToggleService = _FeatureToggleService_;
      ServiceDescriptorService = _ServiceDescriptorService_;
      USSService = _USSService_;
    }

    function initSpies() {
      spyOn(CloudConnectorService, 'getService');
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve({}));
      spyOn(ServiceDescriptorService, 'getServices');
      spyOn(USSService, 'getStatusesForUser').and.returnValue($q.resolve({}));
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
      const userWithBothEntitlements = {
        entitlements: ['squared-fusion-gcal', 'squared-fusion-cal'],
      };

      const controller = initController(userWithBothEntitlements);
      expect(controller.bothCalendarTypesWarning).toBe(true);
    });

    it('should use values provided by the CCC to decide whether or not to show a calendar type', () => {
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
      const userWithNoGcal = {
        entitlements: ['squared-fusion-cal'],
      };


      const controller = initController(userWithNoGcal);
      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'squared-fusion-gcal')).not.toBeDefined();
      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'squared-fusion-cal')).toEqual(jasmine.objectContaining({ id: 'squared-fusion-cal' }));
    });

  });

  describe('USS and callback usage', () => {

    beforeEach(angular.mock.module(mockDependencies));

    function mockDependencies($provide) {
      const Authinfo = {
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
        entitlements: ['squared-fusion-uc'],
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
      const user = {
        id: 'something',
        name: 'Nero',
        entitlements: ['squared-fusion-uc', 'spark-hybrid-impinterop'],
      };
      const controller = initController(user);

      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'squared-fusion-uc').status.state).toEqual('activated');
      expect(_.find(controller.servicesWithStatuses, (service: any) => service.id === 'spark-hybrid-impinterop')).not.toBeDefined();
    });

    it('should start subscribing to recurring updates, and call USS once for every $timeout cycle', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve({}));
      const user = {
        name: 'Claudius',
      };
      const controller = initController(user);
      expect(controller.userSubscriptionTimer).toBeDefined();
      expect(USSService.getStatusesForUser.calls.count()).toBe(1);
      $timeout.flush();
      expect(USSService.getStatusesForUser.calls.count()).toBe(2);
      $timeout.flush();
      expect(USSService.getStatusesForUser.calls.count()).toBe(3);
    });

    it('should cancel the USS subscription on destroy', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve({}));
      const user = {
        name: 'Claudius',
      };
      const controller = initController(user);
      expect(controller.userSubscriptionTimer).toBeDefined();
      controller.$onDestroy();
      expect($timeout.cancel).toHaveBeenCalledTimes(1);
      expect($timeout.cancel).toHaveBeenCalledWith(controller.userSubscriptionTimer);
    });

    it('should reload user data when something has changed in a child component', () => {
      USSService.getStatusesForUser.and.returnValue($q.resolve({}));
      const user = {
        name: 'Galba',
      };
      const controller = initController(user);
      expect(USSService.getStatusesForUser.calls.count()).toBe(1);
      expect(ServiceDescriptorService.getServices.calls.count()).toBe(1);
      controller.userUpdatedCallback({
        refresh: true,
      });
      $scope.$apply();
      expect(USSService.getStatusesForUser.calls.count()).toBe(2);
      expect(ServiceDescriptorService.getServices.calls.count()).toBe(2);
    });
  });
});
