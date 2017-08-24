'use strict';

describe('Service: SetupWizard Service', function () {

  const order = getJSONFixture('core/json/orders/pendingOrder.json');

  function init() {
    this.initModules('Core');
    this.injectDependencies('$httpBackend', '$q', 'SetupWizardService', 'UrlConfig');
    this.adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
  }

  beforeEach(init);
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('hasCCASPPackage()', function () {
    it('should identify CCASP order', function () {
      this.SetupWizardService.pendingLicenses = order.licenseFeatures;
      let result = this.SetupWizardService.hasCCASPPackage();
      expect(result).toBe(true);
      _.remove(this.SetupWizardService.pendingLicenses, { offerName: 'CCASP' });
      result = this.SetupWizardService.hasCCASPPackage();
      expect(result).toBe(false);
    });

    it('should return a sorted list of partners if partners are returned or an empty array', function () {
      const partners = ['somepartner', 'yetanother', 'anotherpartner'];
      const url = `${this.UrlConfig.getAdminServiceUrl()}partners/ccasp`;
      this.$httpBackend.when('GET', url).respond(200, { ccaspPartnerList: partners });
      this.SetupWizardService.getCCASPPartners().then((result) => {
        expect(result.length).toEqual(3);
        expect(result)[0].toEqual('anotherpartner');
        expect(result)[2].toEqual('yetanother');
      });
      this.$httpBackend.flush();
    });
  });
  describe('validateCCASPPartner()', function () {
    it('should return FALSE if \'INVALID\' is returned from the API call regardless of status', function () {
      spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('123');
      const verifyUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/123/ccasp/verify`;
      this.$httpBackend.when('POST', verifyUrl).respond(200, 'INVALID');
      this.SetupWizardService.validateCCASPPartner('123', 'someName').then((result) => {
        expect(result).toBe(false);
      });
      this.$httpBackend.flush();
    });
    it('should return TRUE if \'VALID\' is returned from the API call and status is 200', function () {
      spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('123');
      const verifyUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/123/ccasp/verify`;
      this.$httpBackend.when('POST', verifyUrl).respond(200, 'VALID');
      this.SetupWizardService.validateCCASPPartner('123', 'someName').then((result) => {
        expect(result).toBe(true);
      });
      this.$httpBackend.flush();
    });
    it('should return FALSE if status is 400 regardless of the data returned', function () {
      spyOn(this.SetupWizardService, 'getActingSubscriptionServiceOrderUUID').and.returnValue('123');
      const verifyUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/123/ccasp/verify`;
      this.$httpBackend.when('POST', verifyUrl).respond(400, 'VALID');
      this.SetupWizardService.validateCCASPPartner('123', 'someName').then((result) => {
        expect(result).toBe(false);
      });
      this.$httpBackend.flush();
    });
  });
});

