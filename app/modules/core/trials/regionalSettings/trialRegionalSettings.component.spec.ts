describe('Component: trialRegionalSettings', () => {
  const COUNTRY_SELECT = '.csSelect-container[name="defaultCountry"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';

  let countryList = getJSONFixture('core/json/trials/countryList.json');

  beforeEach(function () {
    this.initModules('trial.regionalSettings');
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent() {
    this.compileComponent('trialRegionalSettings', {
      defaultCountry: 'defaultCountry',
      defaultCountryList: 'defaultCountryList',
      onChangeFn: 'onChangeFn(country)',
    });
  }

  describe('Default country not chosen', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      this.$scope.defaultCountryList = countryList;
      this.$scope.$apply();
    });

    it('should have a drop down select box with options', function () {
      expect(this.view).toContainElement(COUNTRY_SELECT);
      expect(this.view.find(COUNTRY_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('Austria');
    });

    it('should invoke onChangeFn when a country is selected', function () {
      this.view.find(COUNTRY_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(jasmine.objectContaining({
        id: 'AT',
      }));
    });
  });

});
