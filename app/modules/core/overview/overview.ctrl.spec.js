describe('Controller: OverviewCtrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies(
      '$controller',
      '$filter',
      '$httpBackend',
      '$q',
      '$rootScope',
      '$scope',
      '$state',
      '$translate',
      'Authinfo',
      'Config',
      'FeatureToggleService',
      'HybridServicesClusterService',
      'HybridServicesFlagService',
      'ProPackService',
      'LearnMoreBannerService',
      'Orgservice',
      'OverviewNotificationFactory',
      'PstnService',
      'ReportsService',
      'SetupWizardService',
      'SunlightReportService',
      'SunlightUtilitiesService',
      'LocalStorage',
      'TrialService'
    );

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);

    this.orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
    this.usageOnlySharedDevicesFixture = getJSONFixture('core/json/organizations/usageOnlySharedDevices.json');
    this.services = getJSONFixture('squared/json/services.json');
    this.PSTN_ESA_DISCLAIMER_ACCEPT = require('modules/huron/pstn/pstn.const').PSTN_ESA_DISCLAIMER_ACCEPT;

    spyOn(this.Authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
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
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.Authinfo, 'isPartner').and.returnValue(false);
    spyOn(this.Authinfo, 'getLicenses').and.returnValue([{}]);
    spyOn(this.Authinfo, 'hasAccount').and.returnValue(true);
    spyOn(this.Authinfo, 'getServices').and.returnValue(this.services);
    spyOn(this.Authinfo, 'isSetupDone').and.returnValue(false);
    spyOn(this.Authinfo, 'isCustomerAdmin').and.returnValue(true);
    spyOn(this.Authinfo, 'isDeviceMgmt').and.returnValue(true);
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(true);
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);
    spyOn(this.Authinfo, 'isMessageEntitled').and.returnValue(false);
    spyOn(this.Authinfo, 'isSquaredUC').and.returnValue(false);

    spyOn(this.HybridServicesClusterService, 'getAll').and.returnValue(this.$q.resolve());
    spyOn(this.HybridServicesFlagService, 'readFlags').and.returnValue(this.$q.resolve([{
      name: 'fms.services.squared-fusion-cal.acknowledged',
      raised: false,
    }, {
      name: 'fms.services.squared-fusion-uc.acknowledged',
      raised: false,
    }, {
      name: 'fms.services.squared-fusion-ec.acknowledged',
      raised: false,
    }]));

    spyOn(this.ProPackService, 'hasProPackEnabledAndNotPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasPMRonM2GetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasF3745AutoAssignLicensesGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.LearnMoreBannerService, 'isElementVisible').and.returnValue(true);

    var getOrgNoSip = this.orgServiceJSONFixture.getOrgNoSip;
    spyOn(this.Orgservice, 'getAdminOrg').and.callFake(_.noop);
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.orgServiceJSONFixture.getLicensesUsage.singleSub));
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(_.noop);
    spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({ data: getOrgNoSip }));

    spyOn(this.PstnService, 'isSwivelCustomerAndEsaUnsigned').and.returnValue(this.$q.resolve(true));
    spyOn(this.PstnService, 'getCustomerTrialV2').and.returnValue(this.$q.resolve({ acceptedDate: 'today' }));
    spyOn(this.PstnService, 'getCustomerV2').and.returnValue(this.$q.resolve({
      trial: true,
      pstnCarrierId: '111-222-333',
    }));

    spyOn(this.SunlightUtilitiesService, 'isCareSetup').and.returnValue(this.$q.resolve(true));

    spyOn(this.ReportsService, 'getOverviewMetrics').and.callFake(_.noop);
    spyOn(this.ReportsService, 'healthMonitor').and.callFake(_.noop);
    spyOn(this.SunlightReportService, 'getOverviewData').and.returnValue({});
    spyOn(this.SetupWizardService, 'hasPendingServiceOrder').and.returnValue(true);
    spyOn(this.SetupWizardService, 'hasPendingCCWSubscriptions').and.returnValue(true);
    spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('someServiceOrderUUID');
    spyOn(this.SetupWizardService, 'populatePendingSubscriptions').and.callThrough();
    spyOn(this.SetupWizardService, 'getPendingOrderStatusDetails').and.returnValue(this.$q.resolve());
    spyOn(this.TrialService, 'getDaysLeftForCurrentUser').and.returnValue(this.$q.resolve(1));

    this.initController = function () {
      this.controller = this.$controller('OverviewCtrl', {
        $q: this.$q,
        $rootScope: this.$rootScope,
        $scope: this.$scope,
        $state: this.$state,
        $translate: this.$translate,
        Authinfo: this.Authinfo,
        Config: this.Config,
        FeatureToggleService: this.FeatureToggleService,
        HybridServicesClusterService: this.HybridServicesClusterService,
        HybridServicesFlagService: this.HybridServicesFlagService,
        ProPackService: this.ProPackService,
        LearnMoreBannerService: this.LearnMoreBannerService,
        Orgservice: this.Orgservice,
        OverviewNotificationFactory: this.OverviewNotificationFactory,
        PstnService: this.PstnService,
        ReportsService: this.ReportsService,
        SunlightReportService: this.SunlightReportService,
        SunlightUtilitiesService: this.SunlightUtilitiesService,
        SunlightConfigService: this.SunlightConfigService,
        LocalStorage: this.LocalStorage,
        TrialService: this.TrialService,
      });
      this.$scope.$apply();
    };

    this.getCard = function (filter) {
      return _(this.controller.cards).filter(function (card) {
        return card.name == filter;
      }).head();
    };
  });

  function checkForCareNotification(notifications) {
    var careNotificationExists = false;
    _.forEach(notifications, function (notif) {
      if (notif.name === 'careSetupNotification') {
        careNotificationExists = true;
      }
    });
    return careNotificationExists;
  }

  describe('Wire up', function () {
    beforeEach(function () {
      this.initController();
    });

    it('should define all cards', function () {
      expect(this.controller.cards).toBeDefined();

      var cardnames = _.map(this.controller.cards, function (card) {
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
      expect(this.controller.trialDaysLeft).toEqual(1);
    });
  });

  describe('Enable Devices', function () {
    beforeEach(function () {
      this.Orgservice.getLicensesUsage.and.returnValue(this.$q.resolve(this.usageOnlySharedDevicesFixture));
      this.initController();
    });

    it('should call do something', function () {
      var roomSystemsCard = this.getCard('overview.cards.roomSystem.title');
      expect(roomSystemsCard.isDeviceEnabled).toBeTruthy();
    });
  });

  describe('Callcard with healthStatus Event', function () {
    beforeEach(function () {
      this.initController();
    });

    it('should update its status', function () {
      var callCard = this.getCard('overview.cards.call.title');

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

  describe('Meeting Card with provisioning Event: If setup-wizard-service data has been intialized, ', function () {
    beforeEach(function () {
      _.set(this.SetupWizardService, 'serviceDataHasBeenInitialized', true);
      this.initController();
    });

    it('should call forwardEvent function with productProvisioningStatus', function () {
      expect(this.SetupWizardService.getPendingOrderStatusDetails).toHaveBeenCalledWith('someServiceOrderUUID');
    });
  });

  describe('Meeting Card with provisioning Event: If setup-wizard-service data has not been intialized, ', function () {
    beforeEach(function () {
      _.set(this.SetupWizardService, 'serviceDataHasBeenInitialized', false);
      this.initController();
    });

    it('should call populatePendingSubscriptions function', function () {
      expect(this.SetupWizardService.populatePendingSubscriptions).toHaveBeenCalled();
    });
  });

  describe('Meeting Card with provisioning Event: If no pending subscriptions have CCW ordering tool, ', function () {
    beforeEach(function () {
      this.SetupWizardService.hasPendingCCWSubscriptions.and.returnValue(false);
      this.initController();
    });

    it('should not initialize provisioning event handler', function () {
      expect(this.SetupWizardService.getActingSubscriptionServiceOrderUUID).not.toHaveBeenCalled();
    });
  });

  describe('Notifications', function () {
    beforeEach(function () {
      this.TOTAL_NOTIFICATIONS = 9;
      this.initController();
    });

    it('should all be shown', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);
    });

    it('should dismiss the Crash Log notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createCrashLogNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the PMR notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createPMRNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Devices notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createDevicesNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Setup notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createSetupNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Call Aware notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createCallAwareNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Call Connect notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createCallConnectNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Care License notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createCareLicenseNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Auto Assign Notification', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      var notification = this.OverviewNotificationFactory.createAutoAssignNotification();
      this.controller.dismissNotification(notification);
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });

    it('should dismiss the Cloud SIP URI Notification using a rootScope broadcast', function () {
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS);

      this.$rootScope.$broadcast('DISMISS_SIP_NOTIFICATION');
      expect(this.controller.notifications.length).toEqual(this.TOTAL_NOTIFICATIONS - 1);
    });
  });

  describe('Notifications - Login as Full-Admin, create CareNotSetup notification ', function () {
    beforeEach(function () {
      this.SunlightUtilitiesService.isCareSetup.and.returnValue(this.$q.resolve(false));
      this.Authinfo.isCare.and.returnValue(true);
      this.Authinfo.isCustomerAdmin.and.returnValue(true);
      this.SunlightUtilitiesService.removeCareSetupKey();
      this.initController();
    });

    it('should show CareNotSetup notification and dismiss it', function () {
      //dismiss the notification
      expect(checkForCareNotification(this.controller.notifications)).toEqual(true);
      var notification = this.OverviewNotificationFactory.createCareNotSetupNotification();
      this.controller.dismissNotification(notification);
      expect(checkForCareNotification(this.controller.notifications)).toEqual(false);
      this.SunlightUtilitiesService.removeCareSetupKey();
    });

    it('should not show notification if care is onboarded', function () {
      this.SunlightUtilitiesService.isCareSetup.and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(checkForCareNotification(this.controller.notifications)).toEqual(false);
    });

    it('should not show notification if care not enabled', function () {
      this.Authinfo.isCare.and.returnValue(false);
      this.initController();
      expect(checkForCareNotification(this.controller.notifications)).toEqual(false);
    });

    it('should not show notification if not full admin', function () {
      this.Authinfo.isCustomerAdmin.and.returnValue(false);
      this.initController();
      expect(checkForCareNotification(this.controller.notifications)).toEqual(false);
    });

    it('should show notification if snooze time is up', function () {
      this.SunlightUtilitiesService.removeCareSetupKey();
      this.LocalStorage.put(this.SunlightUtilitiesService.getCareSetupKey(), moment().subtract(49, 'hours').toISOString());
      this.initController();
      expect(checkForCareNotification(this.controller.notifications)).toEqual(true);
    });

    it('should not show createCareNotSetupNotification if snooze time is not up ', function () {
      this.SunlightUtilitiesService.removeCareSetupKey();
      this.LocalStorage.put(this.SunlightUtilitiesService.getCareSetupKey(), moment().add(4, 'hours').toISOString());
      this.initController();
      expect(checkForCareNotification(this.controller.notifications)).toEqual(false);
    });
  });

  describe('Notifications - Login as Partner: ', function () {
    it('should NOT call ToS check or ESA check if logged in as a Partner', function () {
      this.initController();
      expect(this.PstnService.getCustomerTrialV2).not.toHaveBeenCalled();
      expect(this.PstnService.isSwivelCustomerAndEsaUnsigned).not.toHaveBeenCalled();
    });
  });

  describe('Notifications - Login as Customer: ', function () {
    beforeEach(function () {
      this.Authinfo.isCustomerLaunchedFromPartner.and.returnValue(false);
      this.initController();
    });

    it('should call ToS check if logged in as a Customer', function () {
      expect(this.PstnService.getCustomerTrialV2).toHaveBeenCalled();
    });

    it('should call ESA check if logged in as a Partner', function () {
      var TOTAL_NOTIFICATIONS = 10;
      expect(this.PstnService.isSwivelCustomerAndEsaUnsigned).toHaveBeenCalled();
      expect(this.controller.esaDisclaimerNotification).toBeTruthy();
      expect(this.controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);

      this.$rootScope.$broadcast(this.PSTN_ESA_DISCLAIMER_ACCEPT);
      expect(this.controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS - 1);
    });
  });

  describe('Notifications - Login as Customer, isSwivelCustomerAndEsaUnsigned false', function () {
    beforeEach(function () {
      this.Authinfo.isCustomerLaunchedFromPartner.and.returnValue(false);
      this.PstnService.isSwivelCustomerAndEsaUnsigned.and.returnValue(this.$q.resolve(false));
      this.initController();
    });

    it('should not have ESA notification if isSwivelCustomerAndEsaUnsigned returned false', function () {
      var TOTAL_NOTIFICATIONS = 9;
      expect(this.controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
      expect(this.controller.esaDisclaimerNotification).toBeFalsy();
    });
  });

  describe('Notifications - notificationComparator', function () {
    it('should return correct sort values', function () {
      this.initController();

      // ensure comparator sorts correctly
      var sorted = this.$filter('orderBy')([
        { badgeText: 'common.info' },
        { badgeText: 'common.new' },
        { badgeText: 'common.alert' },
        { badgeText: 'homePage.todo' },
        { badgeText: 'common.info' },
        { badgeText: 'common.alert' },
      ], 'badgeText', false, this.controller.notificationComparator);

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

  describe('Premium Pro Pack Notification - showLearnMoreNotification', function () {
    beforeEach(function () {
      spyOn(this.Authinfo, 'isEnterpriseCustomer').and.returnValue(true);
    });

    it('should default to false', function () {
      this.initController();
      expect(this.controller.showLearnMoreNotification).toBeFalsy();
    });

    it('should display true only when both hasProPackEnabledAndNotPurchased is true and isElementVisible is false', function () {
      this.ProPackService.hasProPackEnabledAndNotPurchased.and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.showLearnMoreNotification).toBeFalsy();

      this.LearnMoreBannerService.isElementVisible.and.returnValue(false);
      this.$scope.$apply();
      expect(this.controller.showLearnMoreNotification).toBeTruthy();
    });
  });

  describe('Auto Assign Notification - set up now', function () {
    it('should not display if atlasF3745AutoAssignLicenses is false', function () {
      var TOTAL_NOTIFICATIONS = 8;
      this.FeatureToggleService.atlasF3745AutoAssignLicensesGetStatus.and.returnValue(this.$q.resolve(false));
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS);
    });
  });
});
