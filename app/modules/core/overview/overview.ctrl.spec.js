'use strict';

describe('Controller: OverviewCtrl', function () {

  // load the controller's module
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var controller, $rootScope, $scope, $q, $state, $translate, Authinfo, Config, FeatureToggleService, Log, Orgservice, OverviewNotificationFactory, ReportsService, ServiceDescriptor, ServiceStatusDecriptor, TrialService;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var usageOnlySharedDevicesFixture = getJSONFixture('core/json/organizations/usageOnlySharedDevices.json');
  var services = getJSONFixture('squared/json/services.json');

  describe('Wire up', function () {
    beforeEach(inject(defaultWireUpFunc));

    it('should define all cards', function () {
      expect(controller.cards).toBeDefined();

      var cardnames = _.map(controller.cards, function (card) {
        return card.name;
      });
      expect(_.contains(cardnames, 'overview.cards.message.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.meeting.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.roomSystem.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.call.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.hybrid.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.users.title')).toBeTruthy();
      expect(_.contains(cardnames, 'overview.cards.undefined.title')).toBeFalsy();
    });

    it('should have properly set trialDaysLeft', function () {
      expect(controller.trialDaysLeft).toEqual(1);
    });
  });

  describe('Enable Devices', function () {
    beforeEach(function () {
      Orgservice.getAdminOrgUsage = jasmine.createSpy().and.returnValue($q.when(usageOnlySharedDevicesFixture));
      inject(defaultWireUpFunc);
    });

    it('should call do something', function () {
      var roomSystemsCard = getCard('overview.cards.roomSystem.title');
      expect(roomSystemsCard.isDeviceEnabled).toBeTruthy();
    });
  });

  describe('Callcard with healthStatus Event', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update its status', function () {

      var callCard = getCard('overview.cards.call.title');

      callCard.healthStatusUpdatedHandler({
        components: [{
          name: 'Spark Call',
          status: 'error',
          id: 'gfg7cvjszyw0'
        }]
      });

      expect(callCard.healthStatus).toEqual('danger');
    });
  });

  describe('HybridCard with hybridStatusEvent', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update the list of services', function () {

      var hybridCard = getCard('overview.cards.hybrid.title');

      hybridCard.hybridStatusEventHandler('', [{
        name: 'fake.service',
        id: 'squared-fusion-cal',
        enabled: true
      }]);

      expect(hybridCard.services).toBeDefined();
      expect(_.any(hybridCard.services, function (service) {
        return service.name == 'fake.service';
      })).toBeTruthy();
    });

    var testService = function (hybridCard, id, expectedHealth) {
      var serviceInTest = _(hybridCard.services).filter(function (service) {
        return service.id == id;
      }).first();
      expect(serviceInTest).toBeDefined();
      expect(serviceInTest.healthStatus).toEqual(expectedHealth);
    };

    it('with service calendar having error should report cal as danger', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-cal',
        status: 'error',
        name: 'fake.service.errorstatus',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-cal', 'danger');
    });

    it('with uc warning and ec ok should report uc as warning', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-uc',
        status: 'ok',
        name: 'fake.service.okstatus',
        enabled: true

      }, {
        id: 'squared-fusion-ec',
        status: 'warn',
        name: 'fake.service.warnstatus',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-uc', 'warning');
    });

    it('with uc warning and ec error should report uc as danger', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-uc',
        status: 'error',
        name: 'fake.service.errorstatus',
        enabled: true

      }, {
        id: 'squared-fusion-ec',
        status: 'warn',
        name: 'fake.service.warnstatus',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-uc', 'danger');
    });

    it('with uc ok and ec ok should report uc as success', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-uc',
        status: 'ok',
        name: 'fake.service.okstatus',
        enabled: true

      }, {
        id: 'squared-fusion-ec',
        status: 'ok',
        name: 'fake.service.okec',
        enabled: true

      }]);

      expect(hybridCard.services).toBeDefined();
      testService(hybridCard, 'squared-fusion-uc', 'success');
    });

    it('should set the serviceHealth on each service based on enabled and ack on each service', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');

      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-mgmt',
        status: 'ok',
        enabled: true
      }, {
        id: 'squared-fusion-uc',
        status: 'warn',
        enabled: true
      }, {
        id: 'squared-fusion-cal',
        enabled: true,
        name: 'fake noe status'
      }]);

      expect(hybridCard.services).toBeDefined();

      testService(hybridCard, 'squared-fusion-mgmt', 'success');
      testService(hybridCard, 'squared-fusion-uc', 'warning');
      testService(hybridCard, 'squared-fusion-cal', 'warning');
      //testService('fake.service.errorstatus', 'danger');
      //testService('fake.service', 'warning');

    });
  });

  describe('HybridCard', function () {
    beforeEach(inject(defaultWireUpFunc));
    it('should update the list of services from an hybridStatusEvent', function () {
      var hybridCard = getCard('overview.cards.hybrid.title');
      hybridCard.hybridStatusEventHandler('', [{
        id: 'squared-fusion-cal',
        name: 'fake.service',
        enabled: true,
        acknowledged: true
          //status:'ok'  undefined status
      }]);

      expect(hybridCard.services).toBeDefined();
      var fakeService = _(hybridCard.services).filter(function (service) {
        return service.id == 'squared-fusion-cal';
      }).first();
      expect(fakeService).toBeDefined();
      expect(fakeService.healthStatus).toBeDefined();
      expect(fakeService.healthStatus).toEqual('warning'); //warn when undefined status
    });
  });

  describe('Notifications', function () {
    var TOTAL_NOTIFICATIONS = 6;
    beforeEach(inject(defaultWireUpFunc));

    it('should all be shown', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
    });

    it('should dismiss the Devices notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createDevicesNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Setup notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createSetupNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Calendar notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createCalendarNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Call Aware notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createCallAwareNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Call Connect notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createCallConnectNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Cloud SIP URI Notification using a rootScope broadcast', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      $rootScope.$broadcast('DISMISS_SIP_NOTIFICATION');
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });
  });

  function getCard(filter) {
    return _(controller.cards).filter(function (card) {
      return card.name == filter;
    }).first();
  }

  function defaultWireUpFunc(_$rootScope_, $controller, _$state_, _$stateParams_, _$q_, _$translate_, _Authinfo_, _Config_, _FeatureToggleService_, _Log_, _Orgservice_, _OverviewNotificationFactory_, _TrialService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    $translate = _$translate_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    FeatureToggleService = _FeatureToggleService_;
    Log = _Log_;
    OverviewNotificationFactory = _OverviewNotificationFactory_;
    TrialService = _TrialService_;

    FeatureToggleService.features = {
      atlasHybridServicesResourceList: 'atlas-media-service-onboarding'
    };

    ServiceDescriptor = {
      services: function () {}
    };

    ServiceStatusDecriptor = {
      servicesInOrgWithStatus: function () {
        var defer = $q.defer();
        defer.resolve(null);
        return defer.promise;
      }
    };
    Orgservice = {
      getAdminOrg: function () {},
      getAdminOrgUsage: function () {
        return $q.when({
          data: orgServiceJSONFixture.getLicensesUsage.singleSub
        });
      },
      getUnlicensedUsers: function () {},
      getOrg: jasmine.createSpy().and.callFake(function (callback) {
        callback(orgServiceJSONFixture.getOrgNoSip, 200);
      }),
      getHybridServiceAcknowledged: function () {
        var defer = $q.defer();
        defer.resolve({
          status: 200,
          data: {
            items: [{
              id: Config.entitlements.fusion_cal,
              acknowledged: false
            }, {
              id: Config.entitlements.fusion_uc,
              acknowledged: false
            }, {
              id: Config.entitlements.fusion_ec,
              acknowledged: false
            }]
          }
        });
        return defer.promise;
      },
      setHybridServiceAcknowledged: jasmine.createSpy()
    };

    ReportsService = {
      getOverviewMetrics: function () {},
      healthMonitor: function () {}
    };

    spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
      license: {
        siteUrl: 'fakesite1'
      }
    }, {
      license: {
        siteUrl: 'fakesite2'
      }
    }, {
      license: {
        siteUrl: 'fakesite3'
      }
    }]);
    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(Authinfo, 'isPartner').and.returnValue(false);
    spyOn(Authinfo, 'getLicenses').and.returnValue([{}]);
    spyOn(Authinfo, 'hasAccount').and.returnValue(true);
    spyOn(Authinfo, 'getServices').and.returnValue(services);
    spyOn(Authinfo, 'isSetupDone').and.returnValue(false);
    spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
    spyOn(FeatureToggleService, 'atlasDarlingGetStatus').and.returnValue($q.when(true));
    spyOn(TrialService, 'getDaysLeftForCurrentUser').and.returnValue($q.when(1));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));

    controller = $controller('OverviewCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      Log: Log,
      Authinfo: Authinfo,
      $translate: $translate,
      $state: $state,
      ReportsService: ReportsService,
      Orgservice: Orgservice,
      ServiceDescriptor: ServiceDescriptor,
      ServiceStatusDecriptor: ServiceStatusDecriptor,
      Config: Config,
      TrialService: TrialService,
      OverviewNotificationFactory: OverviewNotificationFactory
    });
    $scope.$apply();
  }
});
