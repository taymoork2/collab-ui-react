describe('Component: pstn-trialSetup', () => {

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

  let meResponse = { data: {}, status: 200, statusText: 'OK' };

  beforeEach(function () {
    this.initModules('huron.pstn-trialSetup');
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$q',
      'PstnService',
      '$httpBackend',
    );
  });

  function initComponent() {
    this.$httpBackend.expectGET('modules/huron/pstn/pstnProviders/pstnProviders.json').respond(200, []);
    this.compileComponent('ucPstnTrialSetup', {});
    spyOn(this.PstnService, 'listResellerCarriersV2');
    spyOn(this.PstnService, 'listDefaultCarriersV2');
    spyOn(this.PstnService, 'getCarrierCapabilities');
    this.PstnService.listResellerCarriersV2.and.returnValue(this.$q.reject());
    this.PstnService.listDefaultCarriersV2.and.returnValue(this.$q.resolve(swivelCarrierDetails));
    this.PstnService.getCarrierCapabilities.and.returnValue(this.$q.resolve([]));
    this.$httpBackend.flush();
  }

  describe('init', () => {
    beforeEach(initComponent);

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should be created successfully', function () {
      this.$scope.$apply();
      expect(this.controller).toBeDefined();
    });

    it('should skip when clicked', function () {
      this.$httpBackend.expectGET(/.*\/v1\/Users\b.*/).respond(200, meResponse);
      this.$httpBackend.expectGET(/.*\/v1\/organizations\b.*/).respond(200, meResponse);
      this.$httpBackend.expectGET(/.*\/organization\/trials\b.*/).respond(200, meResponse);
      this.$httpBackend.expectGET(/.*\/v1\/Orgs\b.*/).respond(200, meResponse);
      this.$scope.$parent.trial = {
        nextStep: () => {},
      };
      this.controller.skip(true);
      this.$scope.$apply();
      expect(this.controller.trialData.enabled).toBe(false);
      this.$httpBackend.flush();
    });

    describe('Enter info to the controller and expect the same out of the service', function () {
      let address = {
        streetAddress: '1234 First St',
        unit: '4321',
        city: 'Dallas',
        state: 'TX',
        zip: '75080',
      };

      it('should reset the address', function () {
        this.controller.trialData.details.emergAddr = address;
        this.controller.resetAddress();
        this.$scope.$apply();
        expect(this.controller.trialData.details.emergAddr.streetAddress).toBe('');
        expect(this.controller.trialData.details.emergAddr.unit).toBe('');
        expect(this.controller.trialData.details.emergAddr.city).toBe('');
        expect(this.controller.trialData.details.emergAddr.state).toBe('');
        expect(this.controller.trialData.details.emergAddr.zip).toBe('');
      });
    });

    describe('Carrier Selection', function () {
      it('should select one swivel carrier if the carriers array is of length 1', function () {
        this.PstnService.listResellerCarriersV2.and.returnValue(this.$q.reject());
        this.PstnService.listDefaultCarriersV2.and.returnValue(this.$q.resolve(swivelCarrierDetails));
        this.$scope.$apply();
        expect(this.controller.trialData.details.pstnProvider.uuid).toEqual(swivelCarrierDetails[0].uuid);
        expect(this.controller.providerImplementation).toEqual(swivelCarrierDetails[0].apiImplementation);
      });
    });

  });
});
