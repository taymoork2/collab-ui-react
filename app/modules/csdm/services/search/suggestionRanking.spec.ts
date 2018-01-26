import { Suggestion } from './suggestion';
import { FieldSuggestionGroup, ISuggestionGroup } from './suggestionGroup';
import { SearchTranslator } from './searchTranslator';
import serviceModule from '../index';
import { SuggestionRanking, RankingValues } from './SuggestionRanking';
import { SearchObject } from './searchObject';
import { QueryParser } from './queryParser';

describe('SuggestionRanking', () => {
  beforeEach(function () {
    this.initModules(serviceModule);
    this.injectDependencies('$translate', '$sanitize');
    this.searchTranslator = new SearchTranslator(this.$translate, null);
    this.test = (query: string, expectedRank: number) => {
      const productName = 'Cisco Telepresence SX10';
      const group: ISuggestionGroup = new FieldSuggestionGroup(this.searchTranslator, 'product');
      this.suggestion = new Suggestion(group, {
        field: group.field,
        readableField: group.readableField,
        translatedText: productName,
        textTranslationKey: null,
        textTranslationParams: null,
        searchString: `${group.field}="${productName}"`,
      });
      const so = SearchObject.createWithQuery(new QueryParser(this.searchTranslator), '');
      so.setWorkingElementText(query);
      const rank = SuggestionRanking.rankSuggestion(this.suggestion, so.getWorkingElement(), -1);
      expect(rank).toBe(expectedRank);
    };
  });

  describe('rankSuggestion', () => {
    it('should match a full word with start with score times word length', function () {
      this.test('cisco', RankingValues.QueryWordStartWithMatch * 5);
    });
    it('should match the full text', function () {
      this.test('cisco telepresence sx10', RankingValues.QueryWordStartWithMatch * (5 + 12 + 4));
      this.test('cisco tele presence sx 10', RankingValues.QueryWordStartWithMatch * (5 + 4 + 2) + RankingValues.QueryMatch * (8 + 2));
    });
    it('should count a hit once, the highest match', function () {
      this.test('s', RankingValues.QueryWordStartWithMatch);
      this.test('e', RankingValues.QueryMatch);
    });

    it('should rank to baseline if not all matches', function () {
      this.test('z', -1);
      this.test('Cisco z', -1);
      this.test('Cisco cisco', -1);
    });

    it('should rank to baseline if sub "and" gives no result', function () {
      this.test('Cisco and (tele and tele)', -1);
      this.test('Cisco and (nomatch and nomatch)', -1);
    });

    it('should rank if sub "and" gives result', function () {
      this.test('Cisco and (tele and sx)', RankingValues.QueryWordStartWithMatch * (5 + 4 + 2));
      this.test('Cisco and ()', RankingValues.QueryWordStartWithMatch * 5);
    });

    it('should rank to best hit on or', function () {
      this.test('z', -1);
      this.test('Cisco or z', RankingValues.QueryWordStartWithMatch * 5);
      this.test('Cisco or cisco', RankingValues.QueryWordStartWithMatch * 5);
    });

    it('order of mach do not matter', function () {
      this.test('x s', RankingValues.QueryWordStartWithMatch + RankingValues.QueryMatch);
      this.test('Tele cisco', RankingValues.QueryWordStartWithMatch * 5 + RankingValues.QueryWordStartWithMatch * 4);
    });

    it('order of mach on or do not matter', function () {
      this.test('x or s', RankingValues.QueryWordStartWithMatch);
      this.test('Tele or cisco', RankingValues.QueryWordStartWithMatch * 5);
    });

    it('should rank to baseline on no search', function () {
      this.test('', -1);
    });

    it('should rank s x will give match even it is one word', function () {
      this.test('s x', RankingValues.QueryWordStartWithMatch + RankingValues.QueryMatch);
    });
  });
});
