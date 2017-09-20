import preferredLanguageModule from './index';

describe('Component: preferredLanguage', () => {
  const PREFERRED_LANG_SELECT = '.csSelect-container[name="preferredLanguage"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const LANG_ENGLISH = 'en_US';
  const LANG_SVENSKA = 'sv_SE';
  const preferredLanguageOptions = getJSONFixture('huron/json/settings/languages.json');

  beforeEach(function() {
    this.initModules(preferredLanguageModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucSettingsPreferredLanguage', {
      preferredLanguage: 'preferredLanguage',
      preferredLanguageOptions: 'preferredLanguageOptions',
      onChangeFn: 'onChangeFn(preferredLanguage)',
    });

    this.$scope.preferredLanguage = LANG_ENGLISH;
    this.$scope.preferredLanguageOptions = preferredLanguageOptions;
    this.$scope.$apply();
  });

  it('should have a select box with options', function() {
    expect(this.view).toContainElement(PREFERRED_LANG_SELECT);
    expect(this.view.find(PREFERRED_LANG_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('English (United States)');
    expect(this.view.find(PREFERRED_LANG_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('French (Canadian)');
    expect(this.view.find(PREFERRED_LANG_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('Español (España)');
    expect(this.view.find(PREFERRED_LANG_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('Svenska');
  });

  it('should invoke onChangeFn when a language is chosen', function() {
    this.view.find(PREFERRED_LANG_SELECT).find(DROPDOWN_OPTIONS).get(3).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(LANG_SVENSKA);
  });

});
