describe('Controller: MeetingSettingsCtrl', () => {
  const transferCodeResponse = getJSONFixture('core/json/orders/transferCodeResponse.json');
  const actingSubscription = getJSONFixture('core/json/customerSubscriptions/getSubscriptionsData.json');

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$controller',
      '$q',
      '$rootScope',
      '$scope',
      '$translate',
      'Authinfo',
      'Config',
      'Notification',
      'SetupWizardService',
      'TrialTimeZoneService',
      'TrialWebexService');

    spyOn(this.TrialTimeZoneService, 'getTimeZones').and.returnValue(this.$q.resolve({}));
    spyOn(this.TrialWebexService, 'validateSiteUrl').and.returnValue(this.$q.resolve({ isValid: true, errorCode: 'validSite' }));
    spyOn(this.SetupWizardService, 'getPendingAudioLicenses').and.returnValue([{ offerName: 'TSP' }]);
    // is this being used? the data format wasn't even right before
    spyOn(this.SetupWizardService, 'getActingSubscriptionLicenses').and.returnValue(actingSubscription[0].licenses);
    spyOn(this.SetupWizardService, 'validateCCASPPartner').and.returnValue(this.$q.resolve(true));
    spyOn(this.SetupWizardService, 'hasCCASPPackage').and.returnValue(true);
    spyOn(this.SetupWizardService, 'getCCASPPartners').and.returnValue(this.$q.resolve(['partner1', 'partner2']));
    spyOn(this.SetupWizardService, 'validateTransferCode').and.returnValue(this.$q.resolve(transferCodeResponse));
  });

  function initController(): void {
    this.initController('MeetingSettingsCtrl', {});
  }

  describe('upon initialization', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    xit('should find existing WebEx licenses on acting subscription and push them to sitesArray', function () {
      expect(this.SetupWizardService.getActingSubscriptionLicenses).toHaveBeenCalled();
      const hasSiteUrlFromActiveLicense = _.some(this.controller.sitesArray, { siteUrl: 'frankSinatraTest.dmz' });
      expect(hasSiteUrlFromActiveLicense).toBe(true);
      expect(this.controller.sitesArray).toBe(false);
    });
  });

  describe('upon click of the Validate button in site setup', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should call validateWebexSiteUrl() and if VALID add the site the sitesArray', function () {
      const siteUrl = 'testSiteHere';
      this.controller.siteModel.siteUrl = siteUrl;
      this.controller.siteModel.timezone = 'someTimeZoneHere';
      spyOn(this.controller, 'validateWebexSiteUrl').and.callThrough();
      this.controller.validateMeetingSite();
      this.$scope.$digest();

      expect(this.controller.validateWebexSiteUrl).toHaveBeenCalledWith(siteUrl.concat('.webex.com'));
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.disableValidateButton).toBe(false);
    });

    it('should call validateWebexSiteUrl() and if INVALID showError to be called and site not to be added', function () {
      this.TrialWebexService.validateSiteUrl.and.returnValue(this.$q.resolve({ isValid: false, errorCode: 'invalidSite' }));
      this.controller.siteModel.siteUrl = 'testSiteHere';
      this.controller.siteModel.timeZone = 'someTimeZoneHere';
      this.controller.validateMeetingSite();
      this.$scope.$apply();

      expect(this.controller.sitesArray.length).toBe(0);
      expect(this.controller.error.isError).toBe(true);
    });
  });

  describe('License distribution', function () {
    beforeEach(function () {
      initController.apply(this);
    });
    it('should calculate license quantity for sites correctly', function () {
      initController.apply(this);
      const sitesArray = [
        { quantity: 1, siteUrl: 'site1' },
        { quantity: 5, siteUrl: 'site2' },
      ];
      const distributedLicensesArray = [
        [{ centerType: 'EC', quantity: 3, siteUrl: 'site1' },
        { centerType: 'MC', quantity: 1, siteUrl: 'site1' },
        { centerType: 'TC', quantity: 4, siteUrl: 'site1' }],
        [{ centerType: 'EC', quantity: 1, siteUrl: 'site2' },
        { centerType: 'MC', quantity: 1, siteUrl: 'site2' },
        { centerType: 'TC', quantity: 0, siteUrl: 'site2' }],
      ];
      this.controller.sitesArray = _.clone(sitesArray);
      this.controller.distributedLicensesArray = _.clone(distributedLicensesArray);
      this.controller.updateSitesLicenseCount();
      this.$scope.$apply();

      expect(this.controller.sitesArray[0].quantity).toEqual(8);
      expect(this.controller.sitesArray[1].quantity).toEqual(2);
    });
  });
  describe('when licenses include a TSP Audio package', function () {
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'hasTSPAudioPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getTSPPartners').and.returnValue(this.$q.resolve(['abc', 'def']));
      initController.apply(this);
    });
    it('fetches the TSP partners', function () {
      expect(this.SetupWizardService.getTSPPartners).toHaveBeenCalled();
    });
  });

  describe('when a webex site is being transferred', function () {
    beforeEach(function () {
      initController.apply(this);
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteUrl = 'mywebexsite';
      this.controller.transferSiteCode = '12345678';
      this.$scope.$apply();
      this.controller.migrateTrialNext();
      this.$scope.$digest();
    });
    it('validates and processes the transfer code', function () {
      expect(this.SetupWizardService.validateTransferCode).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
      });
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.distributedLicensesArray[0].length).toBe(1);
      expect(this.controller.distributedLicensesArray[0][0].setupType).toBe('TRANSFER');
    });
  });

  describe('when a second transfer code is used', function () {
    _.set(transferCodeResponse, 'data.siteList[0].siteUrl', 'mySecondTransferredsite.webex.com');
    beforeEach(function () {
      this.SetupWizardService.validateTransferCode.and.returnValue(this.$q.resolve(transferCodeResponse));
      initController.apply(this);
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteUrl = 'mywebexsite';
      this.controller.transferSiteCode = '12345678';
      this.controller.sitesArray = [
        {
          siteUrl: 'myFirstTransferredSite',
          setupType: 'TRANSFER',
        },
      ];
      this.$scope.$apply();
      this.controller.migrateTrialNext();
      this.$scope.$digest();
    });
    it('replaces the earlier transferred site with the new one', function () {
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.distributedLicensesArray[0][0].siteUrl).toBe('mySecondTransferredsite');
    });
  });

  describe('when licenses include CCASP', function () {
    beforeEach(function () {
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
      this.SetupWizardService.validateCCASPPartner.and.returnValue(this.$q.resolve(false));
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe(null);
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(true);
      this.controller.ccasp.isError = true;
    });
  });
});
