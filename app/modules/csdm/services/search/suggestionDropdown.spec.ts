import serviceModule from '../index';
import { SuggestionDropdown } from './suggestionDropdown';
import { SearchTranslator } from './searchTranslator';
import { QueryParser } from './queryParser';
import { ISuggestionGroup } from './suggestionGroup';

describe('SuggestionDropdown', () => {
  beforeEach(function () {
    this.initModules(serviceModule);
    this.injectDependencies('$translate', '$q', '$scope');
    this.searchTranslator = new SearchTranslator(this.$translate, null);

  });
  describe('with upgrade channel', () => {
    beforeEach(function () {
      this.upgradePromise = this.$q.resolve(true);
      this.dropdown = new SuggestionDropdown(this.searchTranslator, this.$translate, this.upgradePromise);
      this.$scope.$apply();
    });

    it('should include the upgrade channel group', function () {
      expect(_.some(this.dropdown.uiSuggestionGroups, (g: ISuggestionGroup) => g.field === QueryParser.Field_UpgradeChannel)).toBe(true);
    });
  });
  describe('without upgrade channel', () => {
    beforeEach(function () {
      this.upgradePromise = this.$q.resolve(false);
      this.dropdown = new SuggestionDropdown(this.searchTranslator, this.$translate, this.upgradePromise);
      this.$scope.$apply();
    });

    it('should include the upgrade channel group', function () {
      expect(_.some(this.dropdown.uiSuggestionGroups, (g: ISuggestionGroup) => g.field === QueryParser.Field_UpgradeChannel)).toBe(false);
    });
  });
});
