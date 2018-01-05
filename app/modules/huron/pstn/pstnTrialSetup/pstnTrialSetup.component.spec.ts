import pstnTrialSetup from './index';
import { PstnModel } from '../pstn.model';
import { PstnCarrier } from '../pstnProviders';
import { SWIVEL, INTELEPEER } from '../pstn.const';

describe('Component: PstnTrialSetupComponent', () => {
  beforeEach(function () {
    this.initModules(pstnTrialSetup);
    this.injectDependencies(
      '$scope',
      '$timeout',
      '$q',
      'FeatureToggleService',
      '$httpBackend',
      'Analytics',
      'PstnModel',
      'PstnService',
      'TrialPstnService',
    );
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
  });

  function initComponent() {
    this.compileComponent('ucPstnTrialSetup', {});
    spyOn(this.controller.Analytics, 'trackTrialSteps').and.returnValue({});
    spyOn(this.PstnService, 'listResellerCarriersV2');
    spyOn(this.PstnService, 'listDefaultCarriersV2');
    spyOn(this.PstnService, 'getCarrierCapabilities');
    spyOn(this.controller, 'disableNextButton').and.callThrough();
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
      const address = {
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
      const pstnCarrier: PstnCarrier = new PstnCarrier();
      const pstnCarriers: PstnCarrier[] = [pstnCarrier];

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

    describe('Disable Next', function () {
      it('should return true for invalid tokens', function () {
        this.controller.invalidCount = 1;
        expect(this.controller.disableNextButton()).toBeTruthy();
      });

      it('should return true for pmp with no numbers', function () {
        this.controller.invalidCount = 0;
        this.controller.providerSelected = true;
        this.controller.providerImplementation = 'My API';
        this.controller.trialData.details.pstnNumberInfo.numbers = [];
        expect(this.controller.disableNextButton()).toBeTruthy();
      });

      it('should return true for pmp with no address verified', function () {
        this.controller.invalidCount = 0;
        this.controller.providerSelected = true;
        this.controller.providerImplementation = 'My API';
        this.controller.addressFound = false;
        expect(this.controller.disableNextButton()).toBeTruthy();
      });

      it('should return false for SWIVEL', function () {
        this.controller.invalidCount = 0;
        this.controller.providerSelected = true;
        this.controller.providerImplementation = this.controller.SWIVEL;
        this.controller.trialData.details.swivelNumbers = [ '9726783456' ];
        expect(this.controller.disableNextButton()).toBeFalsy();
      });

    });

    describe('Start Trial button with API is SWIVEL', function () {
      beforeEach(function () {
        this.controller.trialForm.$invalid = false;
        this.controller.providerImplementation = SWIVEL;
        this.controller.addressFound = true;
        this.controller.disableNextButton.and.returnValue(false);
      });

      it ('should NOT be disabled if the form is invalid and disableNextButton is false', function () {
        this.controller.trialForm.$invalid = true;
        expect(this.controller.isDisabled()).toEqual(false);
      });

      it ('should be disabled if the form is invalid and disableNextButton is true', function () {
        this.controller.trialForm.$invalid = true;
        this.controller.disableNextButton.and.returnValue(true);
        expect(this.controller.isDisabled()).toEqual(true);
      });

      it ('should NOT be disabled if the address wasn\'t validated', function () {
        this.controller.addressFound = false;
        expect(this.controller.isDisabled()).toEqual(false);
      });
    });

    describe('Start Trial button with API is NOT SWIVEL', function () {
      beforeEach(function () {
        this.controller.trialForm.$invalid = false;
        this.controller.providerImplementation = INTELEPEER;
        this.controller.addressFound = true;
        this.controller.disableNextButton.and.returnValue(false);
      });

      it ('should be disabled if the form is invalid', function () {
        this.controller.trialForm.$invalid = true;
        expect(this.controller.isDisabled()).toEqual(true);
      });

      it ('should be disabled if the address wasn\'t validated', function () {
        this.controller.addressFound = false;
        expect(this.controller.isDisabled()).toEqual(true);
      });
    });

  });
});
