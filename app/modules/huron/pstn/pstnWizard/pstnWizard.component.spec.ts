describe('Component: pstn-wizard', () => {

  let swivelCarrierDetails = [{
    uuid: '4f5f5bf7-0034-4ade-8b1c-db63777f062c',
    name: 'INTELEPEER-SWIVEL',
    apiImplementation: 'SWIVEL',
    countryCode: '+1',
    country: 'US',
    defaultOffer: true,
    vendor: 'INTELEPEER',
    offers: [],
    services: [],
    url: 'https://terminus.huron-int.com/api/v1/customers/744d58c5-9205-47d6-b7de-a176e3ca431f/carriers/4f5f5bf7-0034-4ade-8b1c-db63777f062c',
  }];

  beforeEach(function () {
    this.initModules('huron.pstn-wizard');
    this.injectDependencies(
      '$httpBackend',
      '$scope',
      '$timeout',
      '$q',
      'PstnService',
      'PstnServiceAddressService',
      'PstnModel',
      'HuronCountryService',
      'PstnWizardService',
    );
  });

  function initComponent() {
    spyOn(this.PstnService, 'listResellerCarriersV2');
    spyOn(this.PstnService, 'listDefaultCarriersV2');
    spyOn(this.PstnService, 'getCarrierCapabilities');
    spyOn(this.HuronCountryService, 'getCountryList');
    spyOn(this.PstnWizardService, 'init');
    spyOn(this.PstnWizardService, 'initSites');
    this.PstnWizardService.init.and.returnValue(this.$q.resolve());
    this.PstnWizardService.initSites.and.returnValue(this.$q.resolve());
    this.PstnService.listResellerCarriersV2.and.returnValue(this.$q.reject());
    this.PstnService.listDefaultCarriersV2.and.returnValue(this.$q.resolve(swivelCarrierDetails));
    this.PstnService.getCarrierCapabilities.and.returnValue(this.$q.resolve([]));
    this.HuronCountryService.getCountryList.and.returnValue(this.$q.resolve([]));
    this.$httpBackend.expectGET('modules/huron/pstn/pstnProviders/pstnProviders.json').respond(200, []);
    this.compileComponent('ucPstnPaidWizard', {});
    this.$httpBackend.flush();
  }

  describe('init', () => {
    beforeEach(initComponent);

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should be created successfully', function () {
      expect(this.controller).toBeDefined();
      expect(this.controller.step).toBe(1);
    });

    it('nextStep and previousStep should increment and decrement the step by one and check if its disabled', function () {
      this.controller.nextStep();
      expect(this.controller.step).toBe(2);
      this.controller.nextStep();
      this.$httpBackend.expectGET('modules/huron/pstnSetup/states.json').respond(200, []);
      expect(this.controller.step).toBe(3);
      expect(this.controller.nextDisabled()).toBe(true);
      this.$httpBackend.flush();

      spyOn(this.PstnWizardService, 'isSwivel');
      this.PstnWizardService.isSwivel.and.returnValue(false);
      this.controller.previousStep();
      expect(this.controller.step).toBe(2);
    });

  });
});
