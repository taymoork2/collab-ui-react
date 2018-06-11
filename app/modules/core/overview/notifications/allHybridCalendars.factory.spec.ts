import moduleName from './allHybridCalendars.factory';

describe('OverviewAllHybridCalendarsNotification', () => {

  let $state, $scope, $q, CloudConnectorService, HybridServicesFlagService, HybridServicesUtilsService, OverviewAllHybridCalendarsNotification, ServiceDescriptorService;

  beforeEach(angular.mock.module(moduleName));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach( () => {
    $state = $scope = $q = CloudConnectorService = HybridServicesFlagService = HybridServicesUtilsService = OverviewAllHybridCalendarsNotification = ServiceDescriptorService = undefined;
  });

  function initSpies() {
    spyOn($state, 'go');
    spyOn(CloudConnectorService, 'getService');
    spyOn(ServiceDescriptorService, 'isServiceEnabled');
  }

  function dependencies (_$state_, $rootScope, _$q_, _CloudConnectorService_, _HybridServicesFlagService_, _HybridServicesUtilsService_, _OverviewAllHybridCalendarsNotification_, _ServiceDescriptorService_): void {
    $state = _$state_;
    $scope = $rootScope.$new();
    $q = _$q_;
    CloudConnectorService = _CloudConnectorService_;
    HybridServicesFlagService = _HybridServicesFlagService_;
    HybridServicesUtilsService = _HybridServicesUtilsService_;
    OverviewAllHybridCalendarsNotification = _OverviewAllHybridCalendarsNotification_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  describe('permutations of enabled services', () => {

    afterEach( () => {
      $scope.$apply();
      expect(ServiceDescriptorService.isServiceEnabled.calls.count()).toBe(1);
      expect(CloudConnectorService.getService.calls.count()).toBe(2);
    });

    it ('should handle only Office365 being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(false));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: false }), $q.resolve({ setup: true }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsOnlyOffice365IsSetup');
        });
    });

    it ('should handle only Google calendar being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(false));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: true }), $q.resolve({ setup: false }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsOnlyGoogleIsSetup');
        });
    });

    it ('should handle only Expressway-based calendar being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: false }), $q.resolve({ setup: false }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsOnlyExpresswayBasedIsSetup');
        });
    });

    it ('should handle Office365 + Google Calendar being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(false));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: true }), $q.resolve({ setup: true }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsGoogleAndOffice365AreSetup');
        });
    });

    it ('should handle Exchange + Google Calendar being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: true }), $q.resolve({ setup: false }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsExpresswayBasedAndOffice365AreSetup');
        });
    });

    it ('should handle Exchange + Office365 being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: false }), $q.resolve({ setup: true }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsExpresswayBasedAndGoogleAreSetup');
        });
    });

    it ('should handle none being set up', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(false));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: false }), $q.resolve({ setup: false }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService)
        .then((notification) => {
          expect(notification.extendedText).toBe('homePage.setUpAllCalendarsNoneIsSetup');
        });
    });

    it ('should reject the promise if all services already have been set up, to force the parent to clear the notification', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: true }), $q.resolve({ setup: true }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService).then(fail)
        .catch(err => {
          expect(err.message).toBe('Hybrid Calendar already set up');
        });
    });

  });

  describe('error handling', () => {

    afterEach( () => {
      $scope.$apply();
      expect(ServiceDescriptorService.isServiceEnabled.calls.count()).toBe(1);
      expect(CloudConnectorService.getService.calls.count()).toBe(2);
    });

    it ('should reject the promise if something goes wrong when getting data from FMS', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.reject('ERROR!'));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: true }), $q.resolve({ setup: true }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService).then(fail)
        .catch(err => {
          expect(err.message).toBe('Could not reach one or more services');
        });
      $scope.$apply();
    });

    it ('should reject the promise if something goes wrong when getting data from CCC', () => {
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
      CloudConnectorService.getService.and.returnValues($q.reject('ERROR!'), $q.resolve({ setup: true }));
      OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService).then(fail)
        .catch(err => {
          expect(err.message).toBe('Could not reach one or more services');
        });
      $scope.$apply();
    });
  });

  describe('acknowledging the notification', () => {

    it('should call the Flag Service to persist that the admin has acknowledged the notification', () => {
      spyOn(HybridServicesFlagService, 'raiseFlag');
      ServiceDescriptorService.isServiceEnabled.and.returnValue($q.resolve(true));
      CloudConnectorService.getService.and.returnValues($q.resolve({ setup: false }), $q.resolve({ setup: true }));
      const promise = OverviewAllHybridCalendarsNotification.createNotification($state, CloudConnectorService, ServiceDescriptorService, HybridServicesFlagService, HybridServicesUtilsService);

      promise.then(notification => notification.dismiss());
      $scope.$apply();
      expect(HybridServicesFlagService.raiseFlag.calls.count()).toBe(1);
      expect(HybridServicesFlagService.raiseFlag).toHaveBeenCalledWith('atlas.notification.squared-fusion-all-calendars.acknowledged');
    });
  });
});
