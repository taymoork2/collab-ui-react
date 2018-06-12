import { IWebExSite } from './meeting-settings.interface';

describe('Controller: MeetingSettingsCtrl', () => {
  const actingSubscriptions = _.clone(getJSONFixture('core/json/customerSubscriptions/getSubscriptionsData.json'));
  const conferenceServices = _.clone(getJSONFixture('core/json/authInfo/confServices.json'));
  const actingSubscription = _.find(actingSubscriptions, { subscriptionId: '235235-2352532-42352311d-87235221-d05b7c3523596f577' });
  const transferredSubscriptionServices = _.find(actingSubscriptions, { subscriptionId: '2675675-2365756-42365756-8767575-d05b7c67657' });
  const savedDataFromMeetingSetup = _.clone(getJSONFixture('core/json/setupWizard/meeting-settings/savedSitesData.json'));

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$controller',
      '$q',
      '$rootScope',
      '$scope',
      '$translate',
      'Analytics',
      'Authinfo',
      'Config',
      'FeatureToggleService',
      'Notification',
      'SetupWizardService',
      'TrialTimeZoneService',
      'TrialWebexService');

    spyOn(this.TrialTimeZoneService, 'getTimeZones').and.returnValue(this.$q.resolve({}));
    spyOn(this.SetupWizardService, 'getPendingAudioLicense').and.returnValue({ offerName: 'TSP' });
    spyOn(this.SetupWizardService, 'getActingSubscriptionLicenses').and.returnValue(actingSubscription['licenses']);
    spyOn(this.SetupWizardService, 'getActingSubscriptionPendingTransferServices').and.returnValue(transferredSubscriptionServices['licenses']);
    spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(conferenceServices);
    spyOn(this.SetupWizardService, 'validateCCASPPartner').and.returnValue(this.$q.resolve({ isValid: true }));
    spyOn(this.SetupWizardService, 'getCCASPPartners').and.returnValue(this.$q.resolve(['partner1', 'partner2']));
    spyOn(this.TrialWebexService, 'getProvisioningWebexSitesData').and.returnValue({});
    spyOn(this.Analytics, 'trackServiceSetupSteps').and.returnValue(this.$q.resolve());
    this.savedDataFromMeetingSetup = savedDataFromMeetingSetup;
    this.actingSubscription = actingSubscription;
  });

  function initController(): void {
    this.initController('MeetingSettingsCtrl', {});
  }

  describe('upon initialization', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should find existing WebEx licenses on acting subscription and push them to sitesArray', function () {
      expect(this.SetupWizardService.getActingSubscriptionLicenses).toHaveBeenCalled();
      expect(this.controller.sitesArray.length).toBe(3);
      const hasSiteUrlFromActiveLicense = _.some(this.controller.sitesArray, { siteUrl: 'frankSinatraTest.dmz' });
      expect(this.controller.sitesArray[0]['keepExistingSite']).toBeTruthy();
      expect(hasSiteUrlFromActiveLicense).toBe(true);
    });

    it('should extract WebEx licenses from transferred subscription services on acting subscription and push them to sitesArray', function () {
      expect(this.SetupWizardService.getActingSubscriptionPendingTransferServices).toHaveBeenCalled();
      expect(this.controller.webexSitesFromTransferredSubscriptionServices.length).toBe(1);
      const hasSiteUrlFromTransferredWebexLicence = _.some(this.controller.sitesArray, { siteUrl: 'shafiTest.dmz' });
      expect(this.controller.sitesArray[0]['keepExistingSite']).toBeTruthy();
      expect(hasSiteUrlFromTransferredWebexLicence).toBe(true);
    });

    it('should find existing Webex trial licenses on acting subscription and push them to sitesArray', function () {
      expect(this.Authinfo.getConferenceServices).toHaveBeenCalled();
      const hasSiteUrlFromTrialLicense = _.some(this.controller.existingTrialSites, { siteUrl: 'sqcie2e30.dmz' });
      expect(hasSiteUrlFromTrialLicense).toBe(true);
    });

    it('should ignore existing online trial sites', function () {
      const hasSiteUrlFromOnlineTrialLicense = _.some(this.controller.existingTrialSites, { siteUrl: 'someonlinesite.my' });
      const addsTrialSiteToExistingWebexSites = _.some(this.controller.existingWebexSites, { siteUrl: 'someonlinesite.my' });
      expect(hasSiteUrlFromOnlineTrialLicense).toBe(false);
      expect(addsTrialSiteToExistingWebexSites).toBe(false);
      expect(this.controller.existingTrialSites.length).toBe(1);
    });

    it('should ignore trial site that is not status active', function () {
      const hasSiteUrlfromInactiveTrialLicense = _.some(this.controller.existingTrialSites, { siteUrl: 'testsqcie2e30inactive.dmz' });
      const addsInactiveTrialSiteToExistingWebexSites = _.some(this.controller.existingWebexSites, { siteUrl: 'testsqcie2e30inactive.dmz' });
      expect(hasSiteUrlfromInactiveTrialLicense).toBe(false);
      expect(addsInactiveTrialSiteToExistingWebexSites).toBe(false);
      expect(this.controller.existingTrialSites.length).toBe(1);
    });

    it('should set the user management setup type correctly', function () {
      const sparkSetupSite = _.find(this.controller.sitesArray, { siteUrl: 'frankSinatraTest.dmz' });
      const legacySetupSite = _.find(this.controller.sitesArray, { siteUrl: 'frankSinatraTestWX.dmz' });
      expect(this.controller.sitesArray.length).toEqual(3);
      expect(sparkSetupSite['setupType']).toBeUndefined();
      expect(legacySetupSite.hasOwnProperty('setupType')).toBeTruthy();
      expect(legacySetupSite['setupType']).toEqual(this.Config.setupTypes.legacy);
    });
    it('should correctly identify CI Unified sites', function () {
      expect(this.controller.sitesArray[0].isCIUnifiedSite).toBe(true);
      expect(this.controller.sitesArray[1].isCIUnifiedSite).toBe(false);
    });

  });

  describe('when returning back to meeting setup', function () {
    it('should set \'keep existing site\' correctly', function () {
      // existing subscription services
      const actingSubscriptionData = this.actingSubscription;
      const uniqPreExistingSavedSites = _.chain(actingSubscriptionData.licenses).map('siteUrl').uniq().value();
      // unique sites associated with licenses from existing subscription services
      _.remove(uniqPreExistingSavedSites, _.isUndefined);
      // data we have stashed while going through meeting setup
      const returnedFromGetProvisioningWebexSitesData = _.get(this, 'savedDataFromMeetingSetup');
      // sites info from this data
      const savedSites = _.get(returnedFromGetProvisioningWebexSitesData, 'webexLicencesPayload.webexProvisioningParams.webexSiteDetailsList') as any[];
      this.TrialWebexService.getProvisioningWebexSitesData.and.returnValue(returnedFromGetProvisioningWebexSitesData);

      initController.apply(this);

      //saved sites from eixsting subscriptions . They should have keepExistingSite set to true.
      const preExistingRetrievedSites = _.filter(this.controller.sitesArray, (site: IWebExSite) => {
        return _.includes(uniqPreExistingSavedSites, site.siteUrl + this.Config.siteDomainUrl.webexUrl);
      });
      // new saved sites
      const newRetrievedites = _.reject(this.controller.sitesArray, (site: IWebExSite) => {
        return _.includes(uniqPreExistingSavedSites, site.siteUrl + this.Config.siteDomainUrl.webexUrl);
      });
      // all sites should be carries over
      expect(this.controller.sitesArray.length).toEqual(savedSites.length);
      // all sites carried over from existing subscriptions have to have 'keepExisting' flag be true
      expect(_.every(preExistingRetrievedSites, { keepExistingSite: true })).toBeTruthy();
      // all new sites that wwere save should have 'keepExisting' flag be false
      expect(_.every(newRetrievedites, { keepExistingSite: true })).toBeFalsy();
    });

  });

  describe('License distribution', function () {
    beforeEach(function () {
      initController.apply(this);
    });
  });
  describe('when licenses include a TSP Audio package', function () {
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'hasPendingTSPAudioPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getTSPPartners').and.returnValue(this.$q.resolve(['abc', 'def']));
      initController.apply(this);
    });
    it('fetches the TSP partners', function () {
      expect(this.SetupWizardService.getTSPPartners).toHaveBeenCalled();
    });
  });

  describe('when a second transfer code is used', function () {
    beforeEach(function () {
      initController.apply(this);
      this.controller.transferSiteUrl = 'mywebexsite';
      this.controller.transferSiteCode = '12345678';
      this.controller.sitesArray = [
        {
          siteUrl: 'myFirstTransferredSite',
          setupType: 'TRANSFER',
        },
        {
          siteUrl: 'myExistingTrialSite',
          setupType: 'TRIALCONVERT',
        },
      ];
      const transferredSite =  {
        siteUrl: 'mySecondTransferredsite',
        setupType: 'TRANSFER',
      };

      this.$scope.$apply();
      this.controller.addTransferredSites([transferredSite], '12345678', true);
      this.$scope.$digest();
    });
    it('replaces the earlier transferred site with the new one and does not remove trial sites', function () {
      const hasSecondTransferredSite = _.some(this.controller.sitesArray, { siteUrl: 'mySecondTransferredsite' });
      const hasFirstTransferredSite = _.some(this.controller.sitesArray, { siteUrl: 'myFirstTransferredSite' });
      expect(this.controller.sitesArray.length).toBe(2);
      expect(hasSecondTransferredSite).toBe(true);
      expect(hasFirstTransferredSite).toBe(false);
    });
  });

  describe('when pending licenses include CCASP and there are no CCASP active licenses', function () {
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'hasPendingCCASPPackage').and.returnValue(true);
      initController.apply(this);
      spyOn(this.controller, 'setNextDisableStatus').and.callThrough();
      this.controller.ccasp.partnerNameSelected = 'bob';
      this.controller.ccasp.subscriptionId = '123';
    });
    it('gets the list of ccaspPartners', function () {
      expect(this.SetupWizardService.getCCASPPartners).toHaveBeenCalled();
      expect(this.controller.ccasp.partnerOptions.length).toBe(2);
    });
    it('validates correctly', function () {
      expect(this.controller.audioPartnerName).toBe(null);
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe('bob');
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(false);
      expect(this.controller.ccasp.isError).toEqual(false);
    });
    it('validates incorrectly', function () {
      expect(this.controller.audioPartnerName).toBe(null);
      this.SetupWizardService.validateCCASPPartner.and.returnValue(this.$q.resolve({ isValid: false }));
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe(null);
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(true);
      this.controller.ccasp.isError = true;
    });
  });

  describe('pending when licenses include CCASP and there is a CCASP active license', function () {
    beforeEach(function () {
      const ccaspActivePackcage = {
        licenseId: 'CCASP_8c8098f4-e324-45af-8abc-ff75594090c8_testccanew002-ittest.dmz.webex.com',
        offerName: 'CCASP',
        licenseType: 'AUDIO',
        status: 'ACTIVE',
        ccaspPartnerName: 'West IP Communications',
        ccaspSubscriptionId: 'Sub1154854',
      };
      spyOn(this.SetupWizardService, 'hasPendingCCASPPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getActiveCCASPPackage').and.returnValue(ccaspActivePackcage);
      initController.apply(this);
      spyOn(this.controller, 'setNextDisableStatus').and.callThrough();
    });
    it('should not get the list of ccaspPartners ', function () {
      expect(this.SetupWizardService.getCCASPPartners).not.toHaveBeenCalled();
    });
    it('should populate partner subscription data from active subscription', function () {
      expect(this.controller.audioPartnerName).toEqual('West IP Communications');
      expect(this.controller.ccasp.subscriptionId).toBe('Sub1154854');
    });
  });

  describe('pending when licenses include CCAUser active license', function () {
    beforeEach(function () {
      const license = {
        licenseId: 'CCAUser_8c8098f4-e324-45af-8abc-ff75594090c8_testccanew002-ittest.dmz.webex.com',
        offerName: 'CCAUser',
        licenseType: 'AUDIO',
        status: 'ACTIVE',
        ccaspPartnerName: 'West IP Communications',
      };
      spyOn(this.SetupWizardService, 'hasPendingCCAUserPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getActiveCCAUserPackage').and.returnValue(license);
      initController.apply(this);
    });
    it('should not get the list of ccaspPartners ', function () {
      expect(this.SetupWizardService.getCCASPPartners).not.toHaveBeenCalled();
    });
    it('should populate partner name from active subscription', function () {
      expect(this.controller.audioPartnerName).toBe('West IP Communications');
    });
  });

  describe('pending when licenses include CCAUser and no active license', function () {
    beforeEach(function () {
      const license = {
        licenseId: 'CCAUser_8c8098f4-e324-45af-8abc-ff75594090c8_testccanew002-ittest.dmz.webex.com',
        offerName: 'CCAUser',
        licenseType: 'AUDIO',
        status: 'INACTIVE',
        ccaspPartnerName: 'West IP Communications',
      };
      spyOn(this.SetupWizardService, 'hasPendingCCAUserPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getPendingCCAUserPackage').and.returnValue(license);
      spyOn(this.SetupWizardService, 'getActiveCCAUserPackage').and.returnValue(null);
      initController.apply(this);
    });
    it('should not get the list of ccaspPartners ', function () {
      expect(this.SetupWizardService.getCCASPPartners).not.toHaveBeenCalled();
    });
    it('should populate partner name from pending subscription', function () {
      expect(this.controller.audioPartnerName).toBe('West IP Communications');
    });
  });

});
