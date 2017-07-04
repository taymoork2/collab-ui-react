'use strict';

describe('Controller: OverviewCtrl', function () {
  // load the controller's module
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var controller, $filter, $rootScope, $scope, $q, $state, $translate, Authinfo, Config, FeatureToggleService, Log, Orgservice, PstnService, OverviewNotificationFactory, ReportsService, HybridServicesFlagService, ServiceStatusDecriptor, TrialService, HybridServicesClusterService, SunlightReportService, $httpBackend;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var usageOnlySharedDevicesFixture = getJSONFixture('core/json/organizations/usageOnlySharedDevices.json');
  var services = getJSONFixture('squared/json/services.json');
  var isCustomerLaunchedFromPartner = true;
  var PSTN_ESA_DISCLAIMER_ACCEPT = require('modules/huron/pstn/pstn.const').PSTN_ESA_DISCLAIMER_ACCEPT;
  var _pstnService = {
    getCustomerV2: function () {
      return $q.resolve({
        trial: true,
      });
    },
    getCustomerTrialV2: function () {
      return $q.resolve({
        acceptedDate: 'today',
      });
    },
  };

  afterEach(function () {
    controller = $filter = $rootScope = $scope = $q = $state = $translate = Authinfo = Config = FeatureToggleService = Log = Orgservice = PstnService = OverviewNotificationFactory = ReportsService = HybridServicesFlagService = ServiceStatusDecriptor = TrialService = HybridServicesClusterService = SunlightReportService = $httpBackend = undefined;
  });

  afterAll(function () {
    orgServiceJSONFixture = usageOnlySharedDevicesFixture = services = undefined;
  });

  describe('Wire up', function () {
    beforeEach(inject(defaultWireUpFunc));

    it('should define all cards', function () {
      expect(controller.cards).toBeDefined();

      var cardnames = _.map(controller.cards, function (card) {
        return card.name;
      });
      expect(_.includes(cardnames, 'overview.cards.message.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.meeting.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.roomSystem.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.call.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.care.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.hybrid.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.users.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.undefined.title')).toBeFalsy();
    });

    it('should have properly set trialDaysLeft', function () {
      expect(controller.trialDaysLeft).toEqual(1);
    });
  });

  describe('Enable Devices', function () {
    beforeEach(function () {
      inject(defaultWireUpFunc);
      Orgservice.getAdminOrgUsage = jasmine.createSpy().and.returnValue($q.resolve(usageOnlySharedDevicesFixture));
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
          id: 'gfg7cvjszyw0',
        }],
      });

      expect(callCard.healthStatus).toEqual('danger');
    });
  });

  describe('Notifications', function () {
    var TOTAL_NOTIFICATIONS = 9;
    beforeEach(inject(defaultWireUpFunc));

    it('should all be shown', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
    });

    it('should dismiss the Crash Log notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createCrashLogNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the PMR notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createPMRNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
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

    it('should dismiss the Care License notification', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      var notification = OverviewNotificationFactory.createCareLicenseNotification();
      controller.dismissNotification(notification);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Cloud SIP URI Notification using a rootScope broadcast', function () {
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      $rootScope.$broadcast('DISMISS_SIP_NOTIFICATION');
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });
  });

  describe('Notifications - Login as Partner: ', function () {
    beforeEach(function () {
      isCustomerLaunchedFromPartner = true;
      inject(defaultWireUpFunc);
      spyOn(PstnService, 'isSwivelCustomerAndEsaUnsigned');
    });

    it('should NOT call ToS check if logged in as a Partner', function () {
      expect(PstnService.getCustomerTrialV2).not.toHaveBeenCalled();
    });

    it('should NOT call ESA check if logged in as a Partner', function () {
      expect(PstnService.isSwivelCustomerAndEsaUnsigned).not.toHaveBeenCalled();
    });
  });

  describe('Notifications - Login as Customer: ', function () {
    beforeEach(function () {
      isCustomerLaunchedFromPartner = false;
      inject(defaultWireUpFunc);
    });
    it('should call ToS check if logged in as a Customer', function () {
      expect(PstnService.getCustomerTrialV2).toHaveBeenCalled();
    });

    it('should call ESA check if logged in as a Partner', function () {
      var TOTAL_NOTIFICATIONS = 10;
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
      expect(controller.esaDisclaimerNotification).toBeTruthy();
      $rootScope.$broadcast(PSTN_ESA_DISCLAIMER_ACCEPT);
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });
  });

  describe('Notifications - Login as Customer, isSwivelCustomerAndEsaUnsigned false', function () {
    beforeEach(function () {
      isCustomerLaunchedFromPartner = false;
      PstnService = _.cloneDeep(_pstnService);
      _.assign(PstnService, {
        isSwivelCustomerAndEsaUnsigned: function () {
          return $q.resolve(false);
        } });
      inject(defaultWireUpFunc);
    });

    it('should not have ESA notification if isSwivelCustomerAndEsaUnsigned returned false', function () {
      var TOTAL_NOTIFICATIONS = 9;
      expect(controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
      expect(controller.esaDisclaimerNotification).toBeFalsy();
    });
  });

  describe('Notifications - notificationComparator', function () {
    beforeEach(inject(defaultWireUpFunc));

    it('should return correct sort values', function () {
      // ensure comparator sorts correctly
      var items = [
        { badgeText: 'common.info' },
        { badgeText: 'common.new' },
        { badgeText: 'common.alert' },
        { badgeText: 'homePage.todo' },
        { badgeText: 'common.info' },
        { badgeText: 'common.alert' },
      ];
      var sorted = $filter('orderBy')(items, 'badgeText', false, controller.notificationComparator);

      expect(sorted).toEqual([
        { badgeText: 'common.alert' },
        { badgeText: 'common.alert' },
        { badgeText: 'homePage.todo' },
        { badgeText: 'common.info' },
        { badgeText: 'common.info' },
        { badgeText: 'common.new' },
      ]);
    });
  });

  function getCard(filter) {
    return _(controller.cards).filter(function (card) {
      return card.name == filter;
    }).head();
  }

  function defaultWireUpFunc(_$rootScope_, _$filter_, $controller, _$httpBackend_, _$state_, _$stateParams_, _$q_, _$translate_, _Authinfo_, _Config_, _FeatureToggleService_, _Log_, _Orgservice_, _OverviewNotificationFactory_, _TrialService_, _HybridServicesClusterService_, _SunlightReportService_) {
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
    HybridServicesClusterService = _HybridServicesClusterService_;
    SunlightReportService = _SunlightReportService_;
    $httpBackend = _$httpBackend_;
    $filter = _$filter_;

    spyOn(SunlightReportService, 'getOverviewData');
    SunlightReportService.getOverviewData.and.returnValue({});

    spyOn(HybridServicesClusterService, 'getAll');
    HybridServicesClusterService.getAll.and.returnValue($q.resolve());

    HybridServicesFlagService = {
      readFlags: function () {
        return $q.resolve([{
          name: 'fms.services.squared-fusion-cal.acknowledged',
          raised: false,
        }, {
          name: 'fms.services.squared-fusion-uc.acknowledged',
          raised: false,
        }, {
          name: 'fms.services.squared-fusion-ec.acknowledged',
          raised: false,
        }]);
      },
    };

    ServiceStatusDecriptor = {
      servicesInOrgWithStatus: function () {
        var defer = $q.defer();
        defer.resolve(null);
        return defer.promise;
      },
    };
    Orgservice = {
      getAdminOrg: function () {},
      getAdminOrgUsage: function () {
        return $q.resolve({
          data: orgServiceJSONFixture.getLicensesUsage.singleSub,
        });
      },
      getUnlicensedUsers: function () {},
      getOrg: jasmine.createSpy().and.callFake(function (callback) {
        callback(orgServiceJSONFixture.getOrgNoSip, 200);
      }),
    };

    if (_.isUndefined(PstnService)) {
      PstnService = _.cloneDeep(_pstnService);
      _.assign(PstnService, { isSwivelCustomerAndEsaUnsigned: function () {
        return $q.resolve(true);
      } });
    }

    ReportsService = {
      getOverviewMetrics: function () {},
      healthMonitor: function () {},
    };

    spyOn(Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
      license: {
        siteUrl: 'fakesite1',
      },
    }, {
      license: {
        siteUrl: 'fakesite2',
      },
    }, {
      license: {
        siteUrl: 'fakesite3',
      },
    }]);
    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(Authinfo, 'isPartner').and.returnValue(false);
    spyOn(Authinfo, 'getLicenses').and.returnValue([{}]);
    spyOn(Authinfo, 'hasAccount').and.returnValue(true);
    spyOn(Authinfo, 'getServices').and.returnValue(services);
    spyOn(Authinfo, 'isSetupDone').and.returnValue(false);
    spyOn(Authinfo, 'isCustomerAdmin').and.returnValue(true);
    spyOn(Authinfo, 'isDeviceMgmt').and.returnValue(true);
    spyOn(Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(isCustomerLaunchedFromPartner);
    spyOn(Authinfo, 'isCare').and.returnValue(true);
    spyOn(Authinfo, 'isMessageEntitled').and.returnValue(false);
    spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);
    spyOn(FeatureToggleService, 'atlasPMRonM2GetStatus').and.returnValue($q.resolve(true));
    spyOn(TrialService, 'getDaysLeftForCurrentUser').and.returnValue($q.resolve(1));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(PstnService, 'getCustomerTrialV2').and.callThrough();

    $httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);

    controller = $controller('OverviewCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      Log: Log,
      Authinfo: Authinfo,
      $translate: $translate,
      $state: $state,
      ReportsService: ReportsService,
      Orgservice: Orgservice,
      PstnService: PstnService,
      HybridServicesFlagService: HybridServicesFlagService,
      ServiceStatusDecriptor: ServiceStatusDecriptor,
      Config: Config,
      TrialService: TrialService,
      OverviewNotificationFactory: OverviewNotificationFactory,
      SunlightReportService: SunlightReportService,
      $httpBackend: $httpBackend,
    });

    $scope.$apply();
  }
});
