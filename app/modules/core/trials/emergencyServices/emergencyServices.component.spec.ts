describe('Component: EmergencyServicesCtrl', () => {
  let FORM_SECTION = '.cs-form__section';
  let SPINNER = '.icon-spinner';
  let address = {
    streetAddress: '111 Street',
    unit: '',
    city: 'ABC',
    state: 'TX',
    zip: '75082',
  };

  beforeEach(function () {
    this.initModules('trial.emergencyServices');
    this.injectDependencies(
      '$scope',
    );
    this.$scope.resetAddrress = jasmine.createSpy('resetAddrress');
    this.$scope.validation = true;
    this.$scope.addressFound = true;
    this.$scope.address = address;
  });

  function initComponent() {
    this.compileComponent('emergencyServices', {
      address: 'address',
      validation: 'validation',
      addressLoading: 'adressLoading',
      addressFound: 'addressFound',
      readOnly: 'readOnly',
      countryCode: 'countryCode',
      resetAddress: 'resetAddrress',
    });
  }

  describe('Initialize the Component', () => {
    beforeEach(initComponent);

    it('check whether the address is displayed', function () {
      expect(this.view.find(FORM_SECTION).get(0)).toContainText(address.city);
    });

    it('show the spinner when address loads', function () {
      this.$scope.addressLoading = true;
      this.$scope.$apply();
      expect(this.view.find(SPINNER)).toExist();
    });

  });

});
