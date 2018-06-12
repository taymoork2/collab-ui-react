import module from './index';

describe('Service: WebExSite Service', function () {
  beforeEach(function init() {
    this.initModules(module);
    this.injectDependencies(
      '$q',
      '$scope',
      'Authinfo',
      'SetupWizardService',
      'WebExSiteService',
    );
    const subscriptions = [
      {
        subscriptionId: 'db820f2c-7e2f-442e-8974-75cdc6ba0d3d',
        externalSubscriptionId: 'ex123',
      },
      {
        subscriptionId: '284bcf35-dc0e-441c-ae1b-11a255959016',
        externalSubscriptionId: 'ex456',
      },
    ];
    this.allLicenses = getJSONFixture('core/json/authInfo/complexCustomerCases/customerWithCCASPActiveLicenses.json').allLicenses;
    const allCenterDetails = getJSONFixture('core/json/setupWizard/meeting-settings/centerDetails.json');
    this.allConferenceLicenses = getJSONFixture('core/json/setupWizard/sites/conference-licenses.json');
    spyOn(this.Authinfo, 'getLicenses').and.returnValue(this.allLicenses);
    spyOn(this.SetupWizardService, 'updateSitesInActiveSubscription');
    spyOn(this.SetupWizardService, 'getConferenceLicensesBySubscriptionId').and.callFake(function (subId) {
      if (subId === 'ex123') {
        return this.allConferenceLicenses[0];
      }
      if (subId === 'ex456') {
        return this.allConferenceLicenses[1];
      }
    });
    spyOn(this.SetupWizardService, 'getExistingConferenceServiceDetails').and.callFake(function(subId) {
      if (subId === 'ex123') {
        return allCenterDetails[0];
      }
      if (subId === 'ex456') {
        return allCenterDetails[1];
      }
    });
    spyOn(this.Authinfo, 'getSubscriptions').and.returnValue(subscriptions);
  });

  describe('getting center details for all subscriptions', function () {
    beforeEach(function () {
      this.WebExSiteService.getAllCenterDetailsFromSubscriptions();
      this.$scope.$apply();
    });
    it('should call the server once for each subscrption', function () {
      expect(this.SetupWizardService.getExistingConferenceServiceDetails).toHaveBeenCalledTimes(2);
    });
    it('should assign the filtered results to the centerDetailsFromSubscriptions property', function () {
      expect(this.WebExSiteService.centerDetailsFromSubscriptions.length).toBe(2);
      expect(this.WebExSiteService.centerDetailsFromSubscriptions[0].externalSubscriptionId).toBe('ex123');
      expect(this.WebExSiteService.centerDetailsFromSubscriptions[0].purchasedServices.length).toBe(4);
    });
  });

  describe('When looking for subscriptions that have mismatched license counts', function () {
    beforeEach(function () {
      this.WebExSiteService.getAllCenterDetailsFromSubscriptions();
      this.$scope.$apply();
    });
    it('should return a list of subscriptions with licenses that need redistributing', function () {
      this.WebExSiteService.findSubscriptionsWithUnsyncedLicenses().then(function(result) {
        expect(result.length).toBe(1);
        expect(result[0].externalSubscriptionId).toBe('ex123');
      });
      this.$scope.$apply();
    });
  });

  describe('When extracting center details from licenses', function () {
    it('correctly gets and formats the center details', function () {
      const expectedResults = [
        {
          serviceName: 'MC',
          quantity: 30,
        },
      ];
      expect(this.WebExSiteService.extractCenterDetailsFromSingleSubscription(this.allConferenceLicenses[1])).toEqual(expectedResults);
    });
  });

  describe('getting audiopartner info', function () {
    it('should return audio partner name and ccaspSubscriptionId for CCASP ', function () {
      const result = this.WebExSiteService.getAudioPackageInfo('Sub100448');
      expect(result.audioPartnerName).toBe('West IP Communications');
      expect(result.ccaspSubscriptionId).toBe('Sub120766');
      expect(result.audioPackage).toBe('CCASP');
    });

    it('should not throw if there is no audio licenses in subscription', function () {
      let result;
      expect(() => {
        result = this.WebExSiteService.getAudioPackageInfo('noSubIdLikeThis');
      }).not.toThrow();
      expect(result).toEqual({ audioPackage: null });
    });

    it('should return audio partner name but not ccaspSubscriptionId if the audio type is TSP', function () {
      const alteredLicenses = _.cloneDeep(this.allLicenses);
      const index = _.findIndex(alteredLicenses, { licenseType: 'AUDIO', billingServiceId: 'Sub100448' });
      alteredLicenses[index].offerName = 'TSP';
      alteredLicenses[index].tspPartnerName = 'Bob';
      this.Authinfo.getLicenses.and.returnValue(alteredLicenses);
      const result = this.WebExSiteService.getAudioPackageInfo('Sub100448');
      expect(result.audioPartnerName).toBe('Bob');
      expect(result.ccaspSubscriptionId).toBeUndefined();
      expect(result.audioPackage).toBe('TSP');
    });
  });

  describe('deleteSite() function', function () {
    it('should get audiopartner information and set appropriate payload to the SetupWizardService.updateSitesInActiveSubscription', function () {
      const remainingSite = [
        {
          centerType: 'EE',
          quantity: 100,
          siteUrl: 'cognizanttraining',
        },
        {
          centerType: 'MC',
          quantity: 100,
          siteUrl: 'cognizanttraining',
        },
      ];
      const expectedResult = {
        externalSubscriptionId: 'Sub100448',
        webexProvisioningParams: {
          webexSiteDetailsList: remainingSite,
          audioPartnerName: 'West IP Communications',
          asIs: false,
          siteManagementAction: 'DELETE',
          ccaspSubscriptionId: 'Sub120766',
        },
      };
      this.WebExSiteService.deleteSite('Sub100448', remainingSite);
      expect(this.SetupWizardService.updateSitesInActiveSubscription).toHaveBeenCalledWith(expectedResult);
    });
  });
});
