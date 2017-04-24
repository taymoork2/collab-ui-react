describe('Service: pstnWizard', () => {
  let consecutiveOrder = {
    data: {
      numbers: [
        '+12145551000',
        '+12145551001',
      ],
    },
    numberType: 'DID',
    orderType: 'NUMBER_ORDER',
  };

  let singleOrder = {
    data: {
      numbers: '+12145551000',
    },
    numberType: 'DID',
    orderType: 'NUMBER_ORDER',
  };

  let nonconsecutiveOrder = {
    data: {
      numbers: [
        '+12145551234',
        '+12145551678',
      ],
    },
    numberType: 'DID',
    orderType: 'NUMBER_ORDER',
  };
  let portOrder = {
    data: {
      numbers: [
        '+12145557001',
        '+12145557002',
      ],
    },
    orderType: 'PORT_ORDER',
  };
  let advancedOrder = {
    data: {
      areaCode: 321,
      length: 2,
      consecutive: false,
    },
    numberType: 'DID',
    orderType: 'BLOCK_ORDER',
  };
  let advancedNxxOrder = {
    data: {
      areaCode: 321,
      length: 2,
      nxx: 201,
      consecutive: false,
    },
    numberType: 'DID',
    orderType: 'BLOCK_ORDER',
  };

  beforeEach(function () {
    this.initModules('huron.pstn-wizard');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'PstnWizardService',
      '$q',
    );
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

});
