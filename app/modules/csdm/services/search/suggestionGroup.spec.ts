import serviceModule from '../index';
import { SearchTranslator } from './searchTranslator';
import { AllContainingGroup, FieldSuggestionGroup } from './suggestionGroup';
import { FieldQuery } from './searchElement';
import { ISuggestion } from './suggestion';
import { RankingValues } from './SuggestionRanking';
import { SearchObject } from './searchObject';
import { QueryParser } from './queryParser';

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
    it(
      `it ranks suggestion equal to group baseline when suggestion doesn't match but its a field query with field equals`,
      function () {
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

  describe('AllContainingGroup', () => {
    beforeEach(function () {
      this.allContain = new AllContainingGroup(this.$translate);
    });

    it('simple query should set hidden to false', function () {
      const se = new FieldQuery('simple', '');
      this.allContain.updateBasedOnInput(se);
      expect(this.allContain.hidden).toBe(false);
    });

    it('simple query should set hidden to false', function () {
      const se = new FieldQuery('simple', undefined);
      this.allContain.updateBasedOnInput(se);
      expect(this.allContain.hidden).toBe(false);
    });

    it('should set hidden to true', function () {
      const se = new FieldQuery('simple', 'product');
      this.allContain.updateBasedOnInput(se);
      expect(this.allContain.hidden).toBe(true);
    });

    it('query with "and" should be visible', function () {

      const so = SearchObject.createWithQuery(new QueryParser(this.searchTranslator), 'c');
      so.setWorkingElementText('');
      this.allContain.updateBasedOnInput(so.getWorkingElement());
      so.setWorkingElementText('a b');
      this.allContain.updateBasedOnInput(so.getWorkingElement());
      expect(this.allContain.suggestions.length).toBe(2);
      expect(this.allContain.suggestions[0].searchString).toBe('(a and b)');
      expect(this.allContain.suggestions[1].searchString).toBe('"a b"');
    });

    describe('query with "or" ', () => {
      beforeEach(function () {
        this.so = SearchObject.createWithQuery(new QueryParser(this.searchTranslator), 'c');
        this.so.setWorkingElementText('');
        this.allContain.updateBasedOnInput(this.so.getWorkingElement());
        this.so.setWorkingElementText('a or b');
        this.allContain.updateBasedOnInput(this.so.getWorkingElement());
      });

      it('should be visible', function () {
        expect(this.allContain.suggestions[0].searchString).toBe('(a or b)');
      });
      describe('extended with multiple cases', () => {
        it('should be visible and containing last search', function () {
          this.so.setWorkingElementText('a or b or c');
          this.allContain.updateBasedOnInput(this.so.getWorkingElement());
          expect(this.allContain.suggestions[0].searchString).toBe('(a or b or c)');
        });
      });
    });

  });
});
