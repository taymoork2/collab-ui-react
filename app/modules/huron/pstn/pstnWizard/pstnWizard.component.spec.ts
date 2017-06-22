import pstnWizard from './index';

describe('Component: PstnWizardComponent', () => {

  const swivelCarrierDetails = [{
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
    this.initModules(pstnWizard);
    this.injectDependencies(
      '$httpBackend',
      '$scope',
      '$timeout',
      '$q',
      'PstnModel',
      'PstnService',
      'PstnWizardService',
      'PstnServiceAddressService',
      'HuronCountryService',
      'FeatureToggleService',
    );
  });

  function initComponent() {
    spyOn(this.PstnService, 'listResellerCarriersV2');
    spyOn(this.PstnService, 'listDefaultCarriersV2');
    spyOn(this.PstnService, 'getCarrierCapabilities');
    spyOn(this.HuronCountryService, 'getCountryList');
    spyOn(this.PstnWizardService, 'init');
    spyOn(this.PstnWizardService, 'initSites');
    spyOn(this.PstnWizardService, 'isSwivel');
    spyOn(this.FeatureToggleService, 'supports');
    spyOn(this.PstnModel, 'isEsaSigned');
    spyOn(this.PstnModel, 'isCustomerExists');
    spyOn(this.PstnModel, 'setNumbers');
    spyOn(this.PstnModel, 'setOrders');
    spyOn(this.PstnWizardService, 'setSwivelOrder');
    spyOn(this.PstnWizardService, 'finalizeImport');
    spyOn(this.PstnWizardService, 'blockByopNumberAddForPartnerAdmin');
    spyOn(this.PstnWizardService, 'blockByopNumberAddForAllAdmin');
    this.PstnWizardService.init.and.returnValue(this.$q.resolve());
    this.PstnWizardService.initSites.and.returnValue(this.$q.resolve());
    this.PstnService.listResellerCarriersV2.and.returnValue(this.$q.reject());
    this.PstnService.listDefaultCarriersV2.and.returnValue(this.$q.resolve(swivelCarrierDetails));
    this.PstnService.getCarrierCapabilities.and.returnValue(this.$q.resolve([]));
    this.HuronCountryService.getCountryList.and.returnValue(this.$q.resolve([]));
  }

  describe('init', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(false));
      this.compileComponent('ucPstnPaidWizard', {});
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should be created successfully', function () {
      expect(this.controller).toBeDefined();
      expect(this.controller.step).toBe(1);
    });

  });

  describe('I387 ByoPSTN feature toggle set', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
      this.PstnWizardService.isSwivel.and.returnValue(true);
      this.compileComponent('ucPstnPaidWizard', {});
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should make i387FeatureToggle as true', function () {
      expect(this.controller.i387FeatureToggle).toBe(true);
    });

    it('should go to the step 8 if the toggle is enabled', function () {
      this.controller.goToSwivelNumbers();
      expect(this.controller.step).toBe(8);
    });

    it('should go to the step 9 if the toggle is enabled and esa is signed', function () {
      this.PstnModel.isEsaSigned.and.returnValue(true);
      this.controller.goToSwivelNumbers();
      expect(this.controller.step).toBe(9);
    });

    it('should go to the step 1 if the toggle is enabled and previousStep is called from step 8', function () {
      this.controller.step = 8;
      this.controller.previousStep();
      expect(this.controller.step).toBe(1);
    });

    it('should hide back button on step 8 if customer exists', function () {
      this.controller.step = 8;
      this.PstnModel.isCustomerExists.and.returnValue(true);
      expect(this.controller.hideBackBtn()).toBe(true);
    });

    it('should hide back button on step 9 if esa is signed', function () {
      this.controller.step = 9;
      this.PstnModel.isEsaSigned.and.returnValue(true);
      expect(this.controller.hideBackBtn()).toBe(true);
    });

    it('should set swivel orders on step 9 if next button is clicked', function () {
      this.controller.step = 9;
      this.controller.invalidSwivelCount = 0;
      this.controller.swivelNumbers = ['+12342342343'];
      this.controller.nextStep();
      expect(this.PstnModel.setNumbers).toHaveBeenCalled();
      expect(this.PstnWizardService.setSwivelOrder).toHaveBeenCalled();
      expect(this.PstnModel.setOrders).toHaveBeenCalled();
    });

    it('should call finalizeImport on step 10 if next button is clicked', function () {
      this.controller.step = 10;
      this.PstnWizardService.finalizeImport.and.returnValue(this.$q.resolve());
      this.controller.nextStep();
      expect(this.PstnWizardService.finalizeImport).toHaveBeenCalled();
    });

    it('should see the Skip button on step 8', function () {
      this.controller.step = 8;
      expect(this.controller.showSkipBtn()).toBe(true);
    });

    it('should see the Skip button on step 9', function () {
      this.controller.step = 9;
      this.PstnModel.isEsaSigned.and.returnValue(false);
      expect(this.controller.showSkipBtn()).toBe(true);
    });

    it('should disable next if numbers is empty on step 9', function () {
      this.controller.step = 9;
      this.controller.swivelNumbers = [];
      expect(this.controller.nextDisabled()).toBe(true);
    });

    it('should enable next if numbers is not empty on step 9', function () {
      this.controller.step = 9;
      this.controller.swivelNumbers = ['+12342342343'];
      expect(this.controller.nextDisabled()).toBe(false);
    });

    it('should go to review if Skip button is clicked on step 8', function () {
      this.controller.step = 8;
      this.PstnModel.isEsaSigned.and.returnValue(false);
      this.controller.onSkip();
      expect(this.controller.step).toBe(10);
    });

    it('should go to review if Skip button is clicked on step 9', function () {
      this.controller.step = 9;
      this.PstnModel.isEsaSigned.and.returnValue(false);
      this.controller.onSkip();
      expect(this.controller.step).toBe(10);
    });

    it('should go to the step 9 if admin is partner and ESA is unsigned', function () {
      this.PstnWizardService.blockByopNumberAddForPartnerAdmin.and.returnValue(true);
      this.controller.goToSwivelNumbers();
      expect(this.controller.step).toBe(9);
    });

    it('should skip from step 9 to 10 if customer has not been setup, admin is partner and ESA is unsigned', function () {
      this.PstnWizardService.blockByopNumberAddForPartnerAdmin.and.returnValue(true);
      this.PstnModel.isCustomerExists.and.returnValue(false);
      this.controller.goToSwivelNumbers();
      this.controller.onSkip();
      expect(this.controller.step).toBe(10);
    });

    it('should go back from step 10 to step 9 if customer has not been setup, admin is partner and ESA is unsigned', function () {
      this.PstnWizardService.blockByopNumberAddForPartnerAdmin.and.returnValue(true);
      this.PstnModel.isCustomerExists.and.returnValue(false);
      this.controller.goToSwivelNumbers();
      this.controller.onSkip();
      this.controller.previousStep();
      expect(this.controller.step).toBe(9);
    });

    it('should skip from step 9 to dismissModal if customer has been setup', function () {
      spyOn(this.controller, 'dismissModal');
      this.PstnWizardService.blockByopNumberAddForAllAdmin.and.returnValue(true);
      this.PstnModel.isCustomerExists.and.returnValue(true);
      this.controller.goToSwivelNumbers();
      this.controller.onSkip();
      expect(this.controller.dismissModal).toHaveBeenCalled();
    });
  });

  describe('I387 ByoPSTN feature toggle NOT set', () => {
    beforeEach(initComponent);
    beforeEach(function() {
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(false));
      this.PstnWizardService.isSwivel.and.returnValue(true);
      this.compileComponent('ucPstnPaidWizard', {});
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should make i387FeatureToggle as false if feature toggle is not set', function () {
      expect(this.controller.i387FeatureToggle).toBe(false);
    });

    it('should go to the step 5 if the toggle is not enabled', function () {
      this.controller.goToSwivelNumbers();
      expect(this.controller.step).toBe(5);
    });
  });
});
