import defaultCountryModule from './index';

describe('Component: defaultCountry', () => {
  const DEFAULT_COUNTRY_SELECT = '.csSelect-container[name="defaultCountry"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const COUNTRY_US = 'US';
  const COUNTRY_CANADA = 'CA';
  const defaultCountryOptions = getJSONFixture('huron/json/settings/countries.json');

  beforeEach(function() {
    this.initModules(defaultCountryModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucDefaultCountry', {
      defaultCountry: 'defaultCountry',
      defaultCountryOptions: 'defaultCountryOptions',
      onChangeFn: 'onChangeFn(defaultCountry)',
    });

    this.$scope.defaultCountry = COUNTRY_US;
    this.$scope.defaultCountryOptions = defaultCountryOptions;
    this.$scope.$apply();
  });

  it('should have a select box with options', function() {
    expect(this.view).toContainElement(DEFAULT_COUNTRY_SELECT);
    expect(this.view.find(DEFAULT_COUNTRY_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('United States');
    expect(this.view.find(DEFAULT_COUNTRY_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('Canada');
  });

  it('should invoke onChangeFn when a country is chosen', function() {
    this.view.find(DEFAULT_COUNTRY_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(COUNTRY_CANADA);
  });

});
