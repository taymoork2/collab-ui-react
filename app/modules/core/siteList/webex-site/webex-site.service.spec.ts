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
    this.allLicenses = getJSONFixture('core/json/authInfo/complexCustomerCases/customerWithCCASPActiveLicenses.json').allLicenses;
    spyOn(this.Authinfo, 'getLicenses').and.returnValue(this.allLicenses);
    spyOn(this.SetupWizardService, 'updateSitesInActiveSubscription');
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
