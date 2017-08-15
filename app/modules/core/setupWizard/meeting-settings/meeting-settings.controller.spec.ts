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
    spyOn(this.Authinfo, 'getConferenceServices').and.returnValue(this.$q.resolve(getJSONFixture('core/json/authInfo/confServices.json')));

    this.initController = (): void => {
      this.controller = this.$controller('MeetingSettingsCtrl', {
        $scope: this.$scope,
        $translate: this.$translate,
        Authinfo: this.Authinfo,
        Config: this.Config,
        Notification: this.Notification,
        SetupWizardService: this.SetupWizardService,
        TrialWebexService: this.TrialWebexService,
        TrialTimeZoneService: this.TrialTimeZoneService,
      });
      this.$scope.$apply();
    };
  });

  describe('upon initialization', function () {
    beforeEach(this.initController);

    it('should call findExistingWebexTrialSites()', function () {
      expect(this.controller.findExistingWebexTrialSites).toHaveBeenCalled();
    });

  });

  describe('upon click of the Validate button ', function () {
    beforeEach(this.initController);

    it('should call validateWebexSiteUrl() and expect the site to be added to the sitesArray', function () {
      this.controller.siteModel.siteUrl = 'testSiteHere';
      this.controller.siteModel.timeZone = 'someTimeZoneHere';
      spyOn(this.SetupWizardService, 'getPendingAudioLicenses').and.returnValue([{ offerName: 'TSP' }]);
      this.controller.validateMeetingSite();
      this.$scope.$apply();
      expect(this.controller.validateWebexSiteUrl).toHaveBeenCalledWith(this.siteModel.siteUrl.concat('.webex.com'));
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.sitesArray[0].audioPackageDisplay).toBe('TSP Audio');
      expect(this.controller.disableValidateButton).toBe(false);
    });
  });

  describe('upon click of the Validate button test the error condition: ', function () {
    beforeEach(function () {
      this.TrialWebexService.validateSiteUrl.and.returnValue(this.$q.resolve({ isValid: false, errorCode: 'invalidSite' }));
      this.initController();
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
      this.initController();
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
      this.initController();
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
      this.initController();
      this.controller.showTransferCodeInput = true;
      this.controller.centerDetails = [{ centerType: 'EE' }];
      this.controller.transferSiteDetails = {
        siteUrl: 'mywebexsite',
        transferCode: '12345678',
      };
      this.controller.sitesArray = [
        {
          siteUrl: 'myFirstTransferredSite.webex.com',
          isTransferSite: true,
        },
      ];
      this.$scope.$apply();
      this.$rootScope.$broadcast('wizard-meeting-settings-migrate-site-event');
      this.$scope.$digest();
    });
    it('replaces the earlier transferred site with the new one', function () {
      expect(this.controller.sitesArray.length).toBe(1);
      expect(this.controller.distributedLicensesArray[0][0].siteUrl).toBe('mySecondTransferredsite.webex.com');
    });
  });
});
