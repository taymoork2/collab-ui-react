import pstnTrialSetup from './index';
import { PstnModel } from '../pstn.model';
import { PstnCarrier } from '../pstnProviders';

describe('Component: PstnTrialSetupComponent', () => {
  beforeEach(function () {
    this.initModules(pstnTrialSetup);
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$q',
      '$httpBackend',
      'Analytics',
      'PstnModel',
      'PstnService',
      'TrialPstnService',
    );
  });

  function initComponent() {
    this.compileComponent('ucPstnTrialSetup', {});
    spyOn(this.controller.Analytics, 'trackTrialSteps').and.returnValue({});
    spyOn(this.PstnService, 'listResellerCarriersV2');
    spyOn(this.PstnService, 'listDefaultCarriersV2');
    spyOn(this.PstnService, 'getCarrierCapabilities');
  }

  describe('init', () => {
    beforeEach(initComponent);

    it('should be created successfully', function () {
      this.$scope.$apply();
      expect(this.controller).toBeDefined();
    });

    it('should skip when clicked', function () {
      this.$scope.$parent.trial = {
        nextStep: () => {},
      };
      this.controller.skip(true);
      this.$scope.$apply();
      expect(this.controller.trialData.enabled).toBe(false);
      expect(this.controller.Analytics.trackTrialSteps).toHaveBeenCalled();
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
      let pstnCarrier: PstnCarrier = new PstnCarrier();
      let pstnCarriers: Array<PstnCarrier> = [pstnCarrier];

      it('should select one swivel carrier if the carriers array is of length 1', function () {
        pstnCarrier.name = 'Test Carrier 1';
        pstnCarrier.apiImplementation = 'My API';
        (<PstnModel>this.PstnModel).setCarriers(pstnCarriers);
        this.controller.onProviderReady();
        expect(this.controller.trialData.details.pstnProvider).toBe(pstnCarrier);
        expect(this.controller.providerImplementation).toBe(pstnCarrier.apiImplementation);
        expect(this.controller.providerSelected).toBe(true);
      });
    });

  });
});
