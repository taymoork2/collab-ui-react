describe('Controller: MeetingSettingsCtrl', () => {
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
  });

  function initController(): void {
    this.initController('MeetingSettingsCtrl', {});
  }

  describe('upon initialization', function () {
    beforeEach(function () {
      initController.apply(this);
    });
    //TODO: write different initialization test
    xit('should call findExistingWebexTrialSites()', function () {
      expect(this.controller.findExistingWebexTrialSites).toHaveBeenCalled();
    });

  });

  describe('upon click of the Validate button ', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should call validateWebexSiteUrl() and expect the site to be added to the sitesArray', function () {
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
  });

  describe('upon click of the Validate button test the error condition: ', function () {
    beforeEach(function () {
      this.TrialWebexService.validateSiteUrl.and.returnValue(this.$q.resolve({ isValid: false, errorCode: 'invalidSite' }));
      initController.apply(this);
    });

    it('should call validateWebexSiteUrl() and expect showError to be called', function () {
      this.controller.siteModel.siteUrl = 'testSiteHere';
      this.controller.siteModel.timeZone = 'someTimeZoneHere';
      this.controller.validateMeetingSite();
      this.$scope.$apply();

      expect(this.controller.sitesArray.length).toBe(0);
      expect(this.controller.error.isError).toBe(true);
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
    const transferCodeResponse = {
      data: {
        siteList: [{
          siteUrl: 'mytransferredsite.webex.com',
          timezone: '4',
        } ],
      },
    };
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'validateTransferCode').and.returnValue(this.$q.resolve(transferCodeResponse));
      initController.apply(this);
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteDetails = {
        siteUrl: 'mywebexsite',
        transferCode: '12345678',
      };
      this.$scope.$apply();
      this.$rootScope.$broadcast('wizard-meeting-settings-migrate-site-event');
      this.$scope.$digest();
    });
    it('validates and processes the transfer code', function () {
      expect(this.SetupWizardService.validateTransferCode).toHaveBeenCalledWith({
        siteUrl: 'mywebexsite.webex.com',
        transferCode: '12345678',
      });
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.distributedLicensesArray[0].length).toBe(1);
      expect(this.controller.distributedLicensesArray[0][0].isTransferSite).toBe(true);
    });
  });

  describe('when a second transfer code is used', function () {
    const transferCodeResponse = {
      data: {
        siteList: [{
          siteUrl: 'mySecondTransferredsite.webex.com',
          timezone: '4',
        } ],
      },
    };
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'validateTransferCode').and.returnValue(this.$q.resolve(transferCodeResponse));
      initController.apply(this);
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteDetails = {
        siteUrl: 'mywebexsite',
        transferCode: '12345678',
      };
      this.controller.sitesArray = [
        {
          siteUrl: 'myFirstTransferredSite',
          isTransferSite: true,
        },
      ];
      this.$scope.$apply();
      this.$rootScope.$broadcast('wizard-meeting-settings-migrate-site-event');
      this.$scope.$digest();
    });
    it('replaces the earlier transferred site with the new one', function () {
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.distributedLicensesArray[0][0].siteUrl).toBe('mySecondTransferredsite');
    });
  });

  describe('when licenses include CCASP', function () {
    beforeEach(function () {
      spyOn(this.SetupWizardService, 'hasCCASPPackage').and.returnValue(true);
      spyOn(this.SetupWizardService, 'getCCASPPartners').and.returnValue(this.$q.resolve(['partner1', 'partner2']));
      initController.apply(this);
      spyOn(this.controller, 'setNextDisableStatus').and.callThrough();
      this.controller.ccasp.partnerNameSelected = 'bob';
      this.controller.ccasp.subscriptionId = '123';
    });
    it('gets the list of ccaspPartners', function () {
      expect(this.SetupWizardService.getCCASPPartners).toHaveBeenCalled();
      expect(this.controller.ccasp.partnerOptions.length).toBe(2);
    });
    it('validates correctly', function() {
      expect(this.controller.audioPartnerName).toBe(null);
      spyOn(this.SetupWizardService, 'validateCCASPPartner').and.returnValue(this.$q.resolve(true));
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe('bob');
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(false);
      expect(this.controller.ccasp.isError).toEqual(false);
    });
    it('validates incorrectly', function() {
      expect(this.controller.audioPartnerName).toBe(null);
      spyOn(this.SetupWizardService, 'validateCCASPPartner').and.returnValue(this.$q.resolve(false));
      this.controller.ccaspValidate();
      this.$scope.$digest();
      expect(this.controller.audioPartnerName).toBe(null);
      expect(this.controller.setNextDisableStatus).toHaveBeenCalledWith(true);
      this.controller.ccasp.isError = true;
    });
  });
});
