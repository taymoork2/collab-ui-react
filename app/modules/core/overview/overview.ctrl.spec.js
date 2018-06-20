describe('Controller: OverviewCtrl', function () {
  beforeEach(function () {
    this.initModules('Core', 'Huron', 'Sunlight', 'Hercules', 'Accountlinking');
    this.injectDependencies(
      '$controller',
      '$filter',
      '$httpBackend',
      '$q',
      '$rootScope',
      '$scope',
      '$state',
      '$location',
      '$translate',
      'Authinfo',
      'AutoAssignTemplateService',
      'Config',
      'FeatureToggleService',
      'HealthService',
      'HybridServicesClusterService',
      'HybridServicesFlagService',
      'PrivateTrunkService',
      'ProPackService',
      'LearnMoreBannerService',
      'Orgservice',
      'OverviewNotificationFactory',
      'PstnService',
      'ServiceDescriptorService',
      'SetupWizardService',
      'SunlightReportService',
      'SunlightUtilitiesService',
      'LocalStorage',
      'TrialService',
      'LinkedSitesService',
      'EvaService',
      'SsoCertificateService',
      'HuntGroupCallParkMisconfigService'
    );

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200);

    this.orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
    this.usageOnlySharedDevicesFixture = getJSONFixture('core/json/organizations/usageOnlySharedDevices.json');
    this.services = getJSONFixture('squared/json/services.json');
    this.PSTN_ESA_DISCLAIMER_ACCEPT = require('modules/huron/pstn/pstn.const').PSTN_ESA_DISCLAIMER_ACCEPT;
    this.certificateTestData = _.cloneDeep(getJSONFixture('core/json/sso/test-certificates.json'));

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
    spyOn(this.Authinfo, 'hasCallLicense').and.returnValue(false);

    spyOn(this.EvaService, 'getMissingDefaultSpaceEva').and.returnValue(this.$q.resolve());

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

    spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
      success: true,
      status: 200,
    }));
    spyOn(this.ProPackService, 'hasProPackEnabledAndNotPurchased').and.returnValue(this.$q.resolve(false));
    spyOn(this.ProPackService, 'hasProPackPurchased').and.returnValue(this.$q.resolve(true));
    spyOn(this.AutoAssignTemplateService, 'hasDefaultTemplate').and.returnValue(this.$q.resolve(false));
    spyOn(this.AutoAssignTemplateService, 'isEnabledForOrg').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.LearnMoreBannerService, 'isElementVisible').and.returnValue(true);
    spyOn(this.FeatureToggleService, 'atlasSsoCertificateUpdateGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasDirectoryConnectorUpgradeStopNotificationGetStatus').and.returnValue(this.$q.resolve(false));

    var getOrgNoSip = this.orgServiceJSONFixture.getOrgNoSip;
    spyOn(this.Orgservice, 'getAdminOrg').and.callFake(_.noop);
    spyOn(this.Orgservice, 'getInternallyManagedSubscriptions').and.returnValue(this.$q.resolve(this.orgServiceJSONFixture.getLicensesUsage.singleSub));
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callFake(_.noop);
    spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({ data: getOrgNoSip }));

    spyOn(this.PstnService, 'isSwivelCustomerAndEsaUnsigned').and.returnValue(this.$q.resolve(true));
    spyOn(this.PstnService, 'getCustomerTrialV2').and.returnValue(this.$q.resolve({ acceptedDate: 'today' }));
    spyOn(this.PstnService, 'getCustomerV2').and.returnValue(this.$q.resolve({
      trial: true,
      pstnCarrierId: '111-222-333',
    }));

    spyOn(this.SunlightUtilitiesService, 'isCareSetup').and.returnValue(this.$q.resolve(true));

    spyOn(this.SunlightReportService, 'getOverviewData').and.returnValue({});
    spyOn(this.SetupWizardService, 'hasPendingServiceOrder').and.returnValue(true);
    spyOn(this.SetupWizardService, 'hasPendingCCWSubscriptions').and.returnValue(true);
    spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('someServiceOrderUUID');
    spyOn(this.SetupWizardService, 'populatePendingSubscriptions').and.callThrough();
    spyOn(this.SetupWizardService, 'getPendingOrderStatusDetails').and.returnValue(this.$q.resolve());
    spyOn(this.TrialService, 'getDaysLeftForCurrentUser').and.returnValue(this.$q.resolve(1));

    spyOn(this.PrivateTrunkService, 'getPrivateTrunk').and.returnValue(this.$q.resolve({ resources: [] }));
    spyOn(this.ServiceDescriptorService, 'getServiceStatus').and.returnValue(this.$q.resolve({ state: 'unknown' }));
    spyOn(this.HuntGroupCallParkMisconfigService, 'getMisconfiguredServices').and.returnValue(this.$q.resolve());
    this.initController = function () {
      this.controller = this.$controller('OverviewCtrl', {
        $q: this.$q,
        $rootScope: this.$rootScope,
        $scope: this.$scope,
        $state: this.$state,
        $location: this.$location,
        $translate: this.$translate,
        Authinfo: this.Authinfo,
        Config: this.Config,
        FeatureToggleService: this.FeatureToggleService,
        HybridServicesClusterService: this.HybridServicesClusterService,
        HybridServicesFlagService: this.HybridServicesFlagService,
        PrivateTrunkService: this.PrivateTrunkService,
        ProPackService: this.ProPackService,
        LearnMoreBannerService: this.LearnMoreBannerService,
        Orgservice: this.Orgservice,
        OverviewNotificationFactory: this.OverviewNotificationFactory,
        PstnService: this.PstnService,
        ServiceDescriptorService: this.ServiceDescriptorService,
        SunlightReportService: this.SunlightReportService,
        SunlightUtilitiesService: this.SunlightUtilitiesService,
        SunlightConfigService: this.SunlightConfigService,
        LocalStorage: this.LocalStorage,
        TrialService: this.TrialService,
        LinkedSitesService: this.LinkedSitesService,
        EvaService: this.EvaService,
        SsoCertificateService: this.SsoCertificateService,
        HuntGroupCallParkMisconfigService: this.HuntGroupCallParkMisconfigService,
      });
      this.$scope.$apply();
    };

    this.getCard = function (filter) {
      return _(this.controller.cards).filter(function (card) {
        return card.name === filter;
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
        return card.name || card.title;
      });
      expect(_.includes(cardnames, 'overview.cards.message.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.roomSystem.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.call.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.care.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.hybrid.title')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.users.onboardTitle')).toBeTruthy();
      expect(_.includes(cardnames, 'overview.cards.undefined.title')).toBeFalsy();
    });

    it('should have properly set trialDaysLeft', function () {
      expect(this.controller.trialDaysLeft).toEqual(1);
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
      this.TOTAL_NOTIFICATIONS = 10;
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
      var TOTAL_NOTIFICATIONS = 11;
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
      var TOTAL_NOTIFICATIONS = 10;
      expect(this.controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
      expect(this.controller.esaDisclaimerNotification).toBeFalsy();
    });
  });

  describe('Notifications - Login as Customer, Call Park and Hunt Group misconfigurations do not exist', function () {
    beforeEach(function () {
      this.Authinfo.hasCallLicense.and.returnValue(true);
      this.initController();
    });

    it('should not show any notifications initially', function () {
      var TOTAL_NOTIFICATIONS = 10;
      expect(this.controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
    });
  });

  describe('Notifications - Login as Customer, Call Park and Hunt Group misconfigurations do exist', function () {
    beforeEach(function () {
      this.Authinfo.hasCallLicense.and.returnValue(true);
      this.HuntGroupCallParkMisconfigService.getMisconfiguredServices.and.returnValue(this.$q.resolve({
        callParks: [{ uuid: '597ecfde-8a77-4bc0-800c-7cebf5c38f3e', url: 'https://cmi.huron-int.com/api/v2/customers/e17d321b-d97c-4296-b526-e0b4ae558c91/features/callparks/597ecfde-8a77-4bc0-800c-7cebf5c38f3e', name: 'JeffCP' }],
        huntGroups: [{ uuid: '840975cd-e1ae-4f6c-a5f9-179276379473', url: 'https://cmi.huron-int.com/api/v2/customers/e17d321b-d97c-4296-b526-e0b4ae558c91/features/huntgroups/840975cd-e1ae-4f6c-a5f9-179276379473', name: 'JeffHG' }],
      }));
      this.initController();
    });

    it('should show notifications', function () {
      var TOTAL_NOTIFICATIONS = 12;
      expect(this.controller.notifications.length).toEqual(TOTAL_NOTIFICATIONS);
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
    it('should display if a default template does NOT exist', function () {
      var TOTAL_NOTIFICATIONS = 9;
      this.AutoAssignTemplateService.hasDefaultTemplate.and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS);

      this.AutoAssignTemplateService.hasDefaultTemplate.and.returnValue(this.$q.resolve(false));
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS + 1);
    });
  });

  describe('AccountLinking20 notification', function () {
    it('should not be displayed if no sites need configuration', function () {
      var TOTAL_NOTIFICATIONS = 10;
      spyOn(this.LinkedSitesService, 'linkedSitesNotConfigured').and.returnValue(this.$q.resolve(false));
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS);
    });

    it('should be displayed if one or several sites needs configuration', function () {
      var TOTAL_NOTIFICATIONS = 10;
      spyOn(this.LinkedSitesService, 'linkedSitesNotConfigured').and.returnValue(this.$q.resolve(true));
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS + 1);
    });
  });

  describe('Expert Virtual Assistant notification', function () {
    var TOTAL_NOTIFICATIONS = 10;
    it('should display the Expert Virtual Assistant Notification if there is an EVA missing default space', function () {
      this.EvaService.getMissingDefaultSpaceEva.and.returnValue(this.$q.resolve({ name: 'evaTest' }));
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS + 1);
    });

    it('should not display the Expert Virtual Assistant Notification', function () {
      this.initController();
      expect(this.controller.notifications.length).toBe(TOTAL_NOTIFICATIONS);
    });
  });

  describe('updateSsoCertificateNow search param', function () {
    it('should be removed if present', function () {
      spyOn(this.$location, 'search').and.returnValue({
        updateSsoCertificateNow: 'true',
      });
      this.initController();
      expect(this.$location.search).toHaveBeenCalledWith('updateSsoCertificateNow', null);
    });

    it('should open sso-certificate.sso-certificate-check dialog', function () {
      spyOn(this.$location, 'search').and.returnValue({
        updateSsoCertificateNow: 'true',
      });
      var orgData = _.cloneDeep(this.orgServiceJSONFixture.getOrgNoSip);
      orgData.ssoEnabled = true;
      this.Orgservice.getOrg.and.returnValue(this.$q.resolve({ data: orgData }));

      var orgCertificates = _.cloneDeep(this.certificateTestData.orgCertificates);
      orgCertificates.expirationDate = moment().format(); // make sure the expiration date is today

      spyOn(this.SsoCertificateService, 'getOrgCertificates').and.returnValue(this.$q.resolve(orgCertificates));
      spyOn(this.$state, 'go').and.callFake(_.noop);

      this.initController();
      expect(this.$state.go).toHaveBeenCalledWith('sso-certificate.sso-certificate-check');
    });
  });

  describe('directory connector upgrade notification', function () {
    it('should be added', function () {
      this.initController();
      var dcNotificationExists = false;
      _.forEach(this.controller.notifications, function (notif) {
        if (notif.name === 'dirConnectorUpgrade') {
          dcNotificationExists = true;
        }
      });
      expect(dcNotificationExists).toBeTruthy();
    });
  });
});
