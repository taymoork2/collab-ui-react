import module from './index';

describe('Component: WebexSiteLicensesComponent', function () {
  const licenses = getJSONFixture('core/json/authInfo/complexCustomerCases/multipleOfferLicenses.json');

  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$componentController', '$q', '$rootScope', '$scope', 'Config', 'SetupWizardService', 'WebExSiteService');
    this.$scope.fixtures = {
      sitesArray: [{
        siteUrl: 'abc.dmz',
        timezone: '1',
      }, {
        siteUrl: 'site2.dmz',
        timezone: '1',
        setupType: 'TRANSFER',
      },
      {
        siteUrl: 'site3.dmz',
        timezone: '1',
      }],
      conferenceLicenses: licenses.confLicenses,
      existingWebexSites: [{
        siteUrl: 'abc.dmz',
        centerType: 'MC',
        quantity: 100,
      },
      {
        siteUrl: 'abc.dmz',
        centerType: 'EE',
        quantity: 100,
      },
      {
        siteUrl: 'site3.dmz',
        centerType: 'EE',
        quantity: 100,
      }],
      centerDetails: [
        { serviceName: 'MC', quantity: 100 },
        { serviceName: 'EE', quantity: 200 },
      ],
    };

    initSpies.apply(this);

    this.compileComponent('webexSiteLicenses', {
      conferenceLicensesInSubscription: this.$scope.fixtures.conferenceLicenses,
      sitesArray: this.$scope.fixtures.sitesArray,
      existingWebexSites: this.$scope.fixtures.existingWebexSites,
      onDistributionChange: 'onDistributionChangeFn(sites, isValid)',
    });
  });

  function initSpies() {
    this.$scope.onDistributionChangeFn = jasmine.createSpy('onDistributionChangeFn');
    spyOn(this.SetupWizardService, 'getConferenceLicensesBySubscriptionId').and.returnValue(licenses.confLicenses);
    spyOn(this.WebExSiteService, 'extractCenterDetailsFromSingleSubscription').and.returnValue(this.$scope.fixtures.centerDetails);
  }

  describe('When first opened', () => {
    it('should get centerDetails and distributedLicensesArray correctly', function () {
      expect(this.controller.centerDetails).toEqual(this.$scope.fixtures.centerDetails);
      expect(this.WebExSiteService.extractCenterDetailsFromSingleSubscription).toHaveBeenCalled();
      expect(this.controller.distributedLicensesArray.length).toBe(3);
      expect(this.controller.distributedLicensesArray[0].length).toBe(2);
    });
  });

  describe('License distribution', () => {
    it('should getLicensesRemaining', function () {
      const remaining = this.controller.getLicensesRemaining('EE');
      const total = this.controller.getLicensesAssignedTotal('EE');
      expect(remaining).toEqual(0);
      expect(total).toEqual(200);
    });

    it('should getLicensesForSite correctly ', function () {
      const remaining = this.controller.getLicensesForSite('abc.dmz');
      expect(remaining).toEqual(200);
    });

    it('should getLicensesAssignedTotal correctly', function () {
      const result = this.controller.getLicensesAssignedTotal('EE');
      expect(result).toEqual(200);
    });

    it('should set default site license value when only site', function () {
      const sitesArray = [
        { quantity: 10, siteUrl: 'site1' },
      ];
      const distributedLicensesArray = [];
      const centerDetails = [
        { serviceName: 'MC', quantity: 150 },
      ];
      this.controller.sitesArray = _.clone(sitesArray);
      this.controller.distributedLicensesArray = _.clone(distributedLicensesArray);
      this.controller.centerDetails = _.clone(centerDetails);
      this.controller.constructDistributedSitesArray();
      this.$scope.$apply();
      expect(this.controller.distributedLicensesArray[0][0].quantity).toEqual(150);
    });

    it('should set site license to zero when more then one site', function () {
      const sitesArray = [
        { quantity: 10, siteUrl: 'site1' },
        { quantity: 20, siteUrl: 'site1' },
      ];
      const distributedLicensesArray = [];
      const centerDetails = [
        { serviceName: 'MC', quantity: 150 },
      ];
      this.controller.sitesArray = _.clone(sitesArray);
      this.controller.distributedLicensesArray = _.clone(distributedLicensesArray);
      this.controller.centerDetails = _.clone(centerDetails);
      this.controller.constructDistributedSitesArray();
      this.$scope.$apply();
      expect(this.controller.distributedLicensesArray[0][0].quantity).toEqual(0);
    });

    it('should calculate license quantity for sites correctly', function () {
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

  describe('Validation of license distribution', () => {
    it('should NOT validate if there is a site without licenses', function () {
      expect(this.controller.distributedLicensesArray[1][0].quantity).toBe(0);
      expect(this.controller.distributedLicensesArray[1][1].quantity).toBe(0);
      this.controller.validateData();
      expect(this.$scope.onDistributionChangeFn).toHaveBeenCalledWith([], false );
    });

    it('should NOT validate if there are more licenses assigned to the sites than actual licenses', function () {
      this.controller.distributedLicensesArray[2][0].quantity = 2;
      this.controller.validateData();
      expect(this.$scope.onDistributionChangeFn).toHaveBeenCalledWith([], false );
    });

    it('should validate if all licenses are asigned and there are no sites without licenses', function () {
      this.controller.distributedLicensesArray[1][0].quantity = 2;
      this.controller.distributedLicensesArray[0][0].quantity = this.controller.distributedLicensesArray[0][0].quantity - 2;
      this.controller.validateData();
      expect(this.$scope.onDistributionChangeFn).toHaveBeenCalledWith(jasmine.any(Object), true);
    });

  });
});
