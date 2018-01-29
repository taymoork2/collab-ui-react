import serviceModule from '../index';
import { SearchTranslator } from './searchTranslator';
import { FieldSuggestionGroup } from './suggestionGroup';
import { FieldQuery } from './searchElement';
import { ISuggestion } from './suggestion';
import { RankingValues } from './SuggestionRanking';

describe('SuggestionGroup', () => {
  beforeEach(function () {
    this.initModules(serviceModule);
    this.injectDependencies('$translate', '$sanitize');
    this.searchTranslator = new SearchTranslator(this.$translate, null);
    spyOn(this.$translate, 'instant').and.returnValue('product');
  });

  describe('FieldSuggestionGroup', () => {
    beforeEach(function () {
      this.group = new FieldSuggestionGroup(this.searchTranslator, 'product');
    });
    it('adds an empty suggestion on blank input change', function () {
      const se = new FieldQuery('');
      this.group.updateBasedOnInput(se);
      const suggestions = this.group.uiSuggestions;
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].translatedText).toBe('');
      expect(suggestions[0].searchString).toBe('product:');
    });
    it('adds an empty dummy suggestion on input change, but sets rating to zero and hidden to true', function () {
      const se = new FieldQuery('cisco', 'status');
      this.group.updateBasedOnInput(se);
      const suggestions = this.group.allSuggestions;
      expect(suggestions.length).toBe(1);
      expect(this.group.rank).toBe(0);
      expect(suggestions[0].translatedText).toBe('');
      expect(suggestions[0].searchString).toBe('product:');

      expect(this.group.hidden).toBe(true);
    });
    it('adds an contains suggestion on text input change for same field , product:cisco', function () {
      const se = new FieldQuery('cisco', 'product');
      this.group.updateBasedOnInput(se);
      const suggestions = this.group.uiSuggestions;
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].field).toContain('product');
      expect(suggestions[0].searchString).toBe('product:cisco');
    });
    it('adds suggestion on searchResults matching field', function () {
      const productName = 'Cisco Telepresence SX10';
      const productName2 = 'Cisco Telepresence SX20';
      this.group.updateSearchSuggestions([
        { field: 'product', readableField: 'Product', translatedText: productName },
        { field: 'proDuct', readableField: 'Product', translatedText: productName2 },
        { field: 'status', readableField: 'Status', translatedText: 'Online' }]);
      const suggestions: ISuggestion[] = this.group.allSuggestions;
      expect(suggestions.length).toBe(3); //including dummy
      expect(_.every(suggestions, (s) => s.field === 'product')).toBe(true);
      expect(suggestions[1].translatedText).toBe(productName);
    });
    it('recalculates rank on input change', function () {
      const productName = 'Cisco Telepresence SX10';
      this.group.updateSearchSuggestions([{
        field: 'product',
        readableField: 'Product',
        translatedText: productName,
      }, { field: 'status', translatedText: 'Online', count: 3 }]);
      const suggestions: ISuggestion[] = this.group.allSuggestions;
      expect(suggestions.length).toBe(2);
      expect(_.every(suggestions, (s) => {
        return s.translatedText === '' || s.rank === undefined;
      })).toBe(true);
      const se = new FieldQuery('');
      this.group.updateBasedOnInput(se);
      expect(suggestions[1].rank).toBe(0);
    });
    it('it ranks contains in word according to baseline', function () {
      const productName = 'Cisco Telepresence SX10';
      this.group.updateSearchSuggestions([{
        field: 'product',
        readableField: 'Product',
        translatedText: productName,
      }, { field: 'status', translatedText: 'Online', count: 3 }]);
      const suggestions: ISuggestion[] = this.group.allSuggestions;
      expect(suggestions.length).toBe(2);
      expect(_.every(suggestions, (s) => s.translatedText === '' || s.rank === undefined)).toBe(true);
      const se = new FieldQuery('10');
      this.group.updateBasedOnInput(se);
      expect(suggestions[1].rank).toBe(RankingValues.QueryMatch * 2);
    });
    it('it ranks start of word high', function () {
      const productName = 'Cisco Telepresence SX10';
      this.group.updateSearchSuggestions([{
        field: 'product',
        readableField: 'Product',
        translatedText: productName,
      }, { field: 'status', translatedText: 'Online', count: 3 }]);
      const suggestions: ISuggestion[] = this.group.allSuggestions;
      expect(suggestions.length).toBe(2);
      expect(_.every(suggestions, (s) => s.translatedText === '' || s.rank === undefined)).toBe(true);
      const se = new FieldQuery('sx10');
      this.group.updateBasedOnInput(se);
      expect(suggestions[1].rank).toBe(RankingValues.QueryWordStartWithMatch * 4);
    });
    it(`it ranks suggestion equal to group baseline when suggestion doesn't match but its a field query with field equals`, function () {
      const productName = 'Cisco Telepresence SX10';
      this.group.updateSearchSuggestions([{
        field: 'product',
        readableField: 'Product',
        translatedText: productName,
      }, { field: 'status', translatedText: 'Online', count: 3 }]);
      const suggestions: ISuggestion[] = this.group.allSuggestions;
      expect(suggestions.length).toBe(2);
      expect(_.every(suggestions, (s) => s.translatedText === '' || s.rank === undefined)).toBe(true);
      const se = new FieldQuery('', 'product');
      this.group.updateBasedOnInput(se);
      expect(suggestions[1].rank).toBe(RankingValues.GroupFieldHitSuggestionBaseline);
    });
  });
});
