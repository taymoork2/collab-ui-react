import dialPlanServiceModule from './index';

describe('Service: DialPlanService', () => {
  const dialPlanAustralia = getJSONFixture('huron/json/dialPlans/dialPlan-aunp.json');
  const dialPlanNorthAmerica = getJSONFixture('huron/json/dialPlans/dialPlan-nanp.json');

  beforeEach(function() {
    this.initModules(dialPlanServiceModule);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'DialPlanService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
  });

  afterEach(function () {
    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getCustomerDialPlanCountryCode', () => {
    it('should not return a plus sign in the country code', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/dialplans').respond(dialPlanAustralia);
      this.DialPlanService.getCustomerDialPlanCountryCode().then(function (response) {
        expect(response.indexOf('+') === -1).toBe(true);
      });
    });

    it('should return 61 for Australian customer', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/dialplans').respond(dialPlanAustralia);
      this.DialPlanService.getCustomerDialPlanCountryCode(this.Authinfo.getOrgId()).then(function (response) {
        expect(angular.equals(response, '61')).toBe(true);
      });
    });
  });

  describe('getCustomerDialPlan', () => {
    it('should return dialPlan for Australia', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/dialplans').respond(dialPlanAustralia);
      this.DialPlanService.getDialPlan().then(function (response) {
        expect(angular.equals(response, dialPlanAustralia)).toBe(true);
      });
    });

    it('should return dialPlanDetails for North America', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/dialplans').respond(dialPlanNorthAmerica);
      this.DialPlanService.getDialPlan().then(function (response) {
        expect(angular.equals(response, dialPlanNorthAmerica)).toBe(true);
      });
    });
  });

});
