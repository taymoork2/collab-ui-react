import pstnWizard from './index';
import { IAuthLicense } from '../pstn.model';

describe('Service: PstnWizardService', () => {
  const consecutiveOrder = {
    data: {
      numbers: [
        '+12145551000',
        '+12145551001',
      ],
    },
    numberType: 'DID',
    orderType: 'NUMBER_ORDER',
  };

  const singleOrder = {
    data: {
      numbers: '+12145551000',
    },
    numberType: 'DID',
    orderType: 'NUMBER_ORDER',
  };

  const nonconsecutiveOrder = {
    data: {
      numbers: [
        '+12145551234',
        '+12145551678',
      ],
    },
    numberType: 'DID',
    orderType: 'NUMBER_ORDER',
  };
  const portOrder = {
    data: {
      numbers: [
        '+12145557001',
        '+12145557002',
      ],
    },
    orderType: 'PORT_ORDER',
  };
  const advancedOrder = {
    data: {
      areaCode: 321,
      length: 2,
      consecutive: false,
    },
    numberType: 'DID',
    orderType: 'BLOCK_ORDER',
  };
  const advancedNxxOrder = {
    data: {
      areaCode: 321,
      length: 2,
      nxx: 201,
      consecutive: false,
    },
    numberType: 'DID',
    orderType: 'BLOCK_ORDER',
  };
  const customerOrgId = '123-456-7890';
  const swivelProvider = {
    uuid: '098-7654-321',
    apiImplementation: 'SWIVEL',
  };
  const swivelOrder = ['+4697793400', '+18007164851'];

  const customerAccount = getJSONFixture('huron/json/pstnSetup/customerAccount.json');

  beforeEach(function () {
    this.initModules(pstnWizard);
    this.injectDependencies(
      '$httpBackend',
      'Auth',
      'Authinfo',
      'HuronConfig',
      'PstnWizardService',
      '$q',
      'PstnModel',
      'PstnService',
      'FeatureToggleService',
      '$rootScope',
      'Orgservice',
    );

    spyOn(this.Auth, 'getCustomerAccount').and.returnValue(this.$q.resolve(customerAccount));
    spyOn(this.Orgservice, 'getAdminOrgUsage').and.returnValue(this.$q.resolve(customerAccount));
    installPromiseMatchers();

  });

  describe('showOrderQuantity', function () {
    it('should not show quantity for single order', function () {
      expect(this.PstnWizardService.showOrderQuantity(singleOrder)).toBeFalsy();
    });

    it('should not show quantity if is a consecutive order', function () {
      expect(this.PstnWizardService.showOrderQuantity(consecutiveOrder)).toBeFalsy();
    });

    it('should show quantity if is nonconsecutive order', function () {
      expect(this.PstnWizardService.showOrderQuantity(nonconsecutiveOrder)).toBeTruthy();
    });

    it('should show quantity if is a port order', function () {
      expect(this.PstnWizardService.showOrderQuantity(portOrder)).toBeTruthy();
    });

    it('should show quantity if is an advanced order', function () {
      expect(this.PstnWizardService.showOrderQuantity(advancedOrder)).toBeTruthy();
    });
  });

  describe('formatTelephoneNumber', function () {
    it('should format a single order', function () {
      expect(this.PstnWizardService.formatTelephoneNumber(singleOrder)).toEqual('(214) 555-1000');
    });

    it('should format a consecutive order', function () {
      expect(this.PstnWizardService.formatTelephoneNumber(consecutiveOrder)).toEqual('(214) 555-1000 - 1001');
    });

    it('should format a nonconsecutive order', function () {
      expect(this.PstnWizardService.formatTelephoneNumber(nonconsecutiveOrder)).toEqual('(214) 555-1XXX');
    });

    it('should format a port order', function () {
      expect(this.PstnWizardService.formatTelephoneNumber(portOrder)).toEqual('pstnSetup.portNumbersLabel');
    });

    it('should format an advanced order', function () {
      expect(this.PstnWizardService.formatTelephoneNumber(advancedOrder)).toEqual('(' + advancedOrder.data.areaCode + ') XXX-XXXX');
    });

    it('should format an advanced order with nxx', function () {
      expect(this.PstnWizardService.formatTelephoneNumber(advancedNxxOrder)).toEqual('(' + advancedNxxOrder.data.areaCode + ') ' + advancedNxxOrder.data.nxx + '-XXXX');
    });
  });

  describe('blockByopNumberAddForPartnerAdmin', function() {

    it('should not block number Add if admin is not partner', function() {
      spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
      spyOn(this.Authinfo, 'isPartner').and.returnValue(false);

      const _blockByopNumberAddForPartnerAdmin = this.PstnWizardService.blockByopNumberAddForPartnerAdmin();
      this.$rootScope.$digest();

      expect(_blockByopNumberAddForPartnerAdmin).toBe(false);
    });

    it('should  block number Add if admin is partner', function() {
      spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(true);
      spyOn(this.Authinfo, 'isPartner').and.returnValue(false);
      spyOn(this.PstnModel, 'getProvider').and.returnValue(swivelProvider);
      spyOn(this.PstnModel, 'isEsaSigned').and.returnValue(false);

      const _blockByopNumberAddForPartnerAdmin = this.PstnWizardService.blockByopNumberAddForPartnerAdmin();
      this.$rootScope.$digest();

      expect(_blockByopNumberAddForPartnerAdmin).toBe(true);
    });
  });

  describe('create numbers for BYOP', function () {
    beforeEach(function () {
      spyOn(this.PstnService, 'orderNumbersV2Swivel').and.returnValue(this.$q.resolve());
      spyOn(this.PstnService, 'orderNumbers').and.returnValue(this.$q.resolve());
      spyOn(this.PstnModel, 'isCustomerExists').and.returnValue(false);
      spyOn(this.PstnModel, 'getCustomerId').and.returnValue(customerOrgId);
      spyOn(this.PstnModel, 'getProvider').and.returnValue(swivelProvider);
      spyOn(this.PstnModel, 'getProviderId').and.returnValue(swivelProvider.uuid);
      spyOn(this.PstnService, 'createCustomerV2').and.returnValue(this.$q.resolve());
      this.PstnWizardService.setSwivelOrder(swivelOrder);
    });

    it('should call V2 order API if huronEnterprisePrivateTrunking feature toggle is on', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      const promise = this.PstnWizardService.placeOrder().then(() => {
        expect(this.PstnService.orderNumbersV2Swivel).toHaveBeenCalledWith(customerOrgId, swivelOrder);
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should call V1 order API if huronEnterprisePrivateTrunking feature toggle is off', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      const promise = this.PstnWizardService.placeOrder().then(() => {
        expect(this.PstnService.orderNumbers).toHaveBeenCalledWith(customerOrgId, swivelProvider.uuid, swivelOrder);
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });

  describe('Finalize import of numbers for Private PSTN', function () {
    beforeEach(function () {
      spyOn(this.PstnService, 'createCustomerV2').and.returnValue(this.$q.resolve());
      spyOn(this.PstnService, 'updateCustomerCarrier').and.returnValue(this.$q.resolve());
      spyOn(this.PstnService, 'updateCustomerE911Signee').and.returnValue(this.$q.resolve());
      spyOn(this.PstnService, 'orderNumbersV2Swivel').and.returnValue(this.$q.resolve());
    });

    it('should create customer if customer doesn\'t exist', function () {
      spyOn(this.PstnModel, 'isCustomerExists').and.returnValue(false);
      spyOn(this.PstnModel, 'isEsaSigned').and.returnValue(true);
      this.PstnWizardService.setSwivelOrder(swivelOrder);

      this.PstnWizardService.finalizeImport();
      this.$rootScope.$digest();
      expect(this.PstnModel.isCustomerExists).toHaveBeenCalled();
      expect(this.PstnService.createCustomerV2).toHaveBeenCalled();
      expect(this.PstnModel.isEsaSigned).toHaveBeenCalled();
      expect(this.PstnService.orderNumbersV2Swivel).toHaveBeenCalled();
    });

    it('should update carrier if carrier doesn\'t exist', function () {
      spyOn(this.PstnModel, 'isCustomerExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isCarrierExists').and.returnValue(false);
      spyOn(this.PstnModel, 'isEsaSigned').and.returnValue(true);
      spyOn(this.PstnModel, 'isEsaDisclaimerAgreed').and.returnValue(true);
      this.PstnWizardService.setSwivelOrder(swivelOrder);

      this.PstnWizardService.finalizeImport();
      this.$rootScope.$digest();
      expect(this.PstnModel.isCustomerExists).toHaveBeenCalled();
      expect(this.PstnService.createCustomerV2).not.toHaveBeenCalled();
      expect(this.PstnModel.isCarrierExists).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerCarrier).toHaveBeenCalled();
      expect(this.PstnModel.isEsaSigned).toHaveBeenCalled();
      expect(this.PstnModel.isEsaDisclaimerAgreed).not.toHaveBeenCalled();
      expect(this.PstnService.orderNumbersV2Swivel).toHaveBeenCalled();
    });

    it('should log e911 signee if the esa is not signed and  esadisclaimer is "Agreed"', function () {
      spyOn(this.PstnModel, 'isCustomerExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isCarrierExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isEsaSigned').and.returnValue(false);
      spyOn(this.PstnModel, 'isEsaDisclaimerAgreed').and.returnValue(true);
      this.PstnWizardService.setSwivelOrder(swivelOrder);

      this.PstnWizardService.finalizeImport();
      this.$rootScope.$digest();
      expect(this.PstnModel.isCustomerExists).toHaveBeenCalled();
      expect(this.PstnService.createCustomerV2).not.toHaveBeenCalled();
      expect(this.PstnModel.isCarrierExists).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerCarrier).not.toHaveBeenCalled();
      expect(this.PstnModel.isEsaSigned).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerE911Signee).toHaveBeenCalled();
      expect(this.PstnService.orderNumbersV2Swivel).toHaveBeenCalled();
    });

    it('should not log e911 signee if the esa is not signed and  esadisclaimer is "Skipped"', function () {
      spyOn(this.PstnModel, 'isCustomerExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isCarrierExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isEsaSigned').and.returnValue(false);
      spyOn(this.PstnModel, 'isEsaDisclaimerAgreed').and.returnValue(false);

      this.PstnWizardService.finalizeImport();
      this.$rootScope.$digest();
      expect(this.PstnModel.isCustomerExists).toHaveBeenCalled();
      expect(this.PstnService.createCustomerV2).not.toHaveBeenCalled();
      expect(this.PstnModel.isCarrierExists).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerCarrier).not.toHaveBeenCalled();
      expect(this.PstnModel.isEsaSigned).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerE911Signee).not.toHaveBeenCalled();
      expect(this.PstnService.orderNumbersV2Swivel).not.toHaveBeenCalled();
    });

    it('should not import numbers is swivel numbers are empty', function () {
      spyOn(this.PstnModel, 'isCustomerExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isCarrierExists').and.returnValue(true);
      spyOn(this.PstnModel, 'isEsaSigned').and.returnValue(false);
      spyOn(this.PstnModel, 'isEsaDisclaimerAgreed').and.returnValue(true);
      this.PstnWizardService.setSwivelOrder([]);

      this.PstnWizardService.finalizeImport();
      this.$rootScope.$digest();
      expect(this.PstnModel.isCustomerExists).toHaveBeenCalled();
      expect(this.PstnService.createCustomerV2).not.toHaveBeenCalled();
      expect(this.PstnModel.isCarrierExists).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerCarrier).not.toHaveBeenCalled();
      expect(this.PstnModel.isEsaSigned).toHaveBeenCalled();
      expect(this.PstnService.updateCustomerE911Signee).toHaveBeenCalled();
      expect(this.PstnService.orderNumbersV2Swivel).not.toHaveBeenCalled();
    });
  });

  describe('Trial Test', function () {
    let licenses: IAuthLicense[];
    beforeEach(function () {
      licenses = _.cloneDeep<IAuthLicense[]>(customerAccount.data.customers[0].licenses);
    });
    it('should be a trial', function () {
      expect(this.PstnWizardService.isTrialCallOrRoom(licenses)).toEqual(true);
    });
    it('should be a trial if no Call or Room is set', function () {
      licenses = licenses.splice(0, 2);
      expect(this.PstnWizardService.isTrialCallOrRoom(licenses)).toEqual(true);
    });
    it('should not be a trial with "isTrial" set to false', function () {
      licenses[0].isTrial = false;
      licenses[1].isTrial = false;
      expect(this.PstnWizardService.isTrialCallOrRoom(licenses)).toEqual(false);
    });
    it('should not be a trial with only one "isTrial" set to false', function () {
      licenses[1].isTrial = false;
      expect(this.PstnWizardService.isTrialCallOrRoom(licenses)).toEqual(false);
    });
  });

});
