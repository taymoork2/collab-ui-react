import searchModule from '../index';
import { SearchObject } from './searchObject';
import { QueryParser } from './queryParser';
import { SearchTranslator } from './searchTranslator';
import { FieldQuery, OperatorAnd, OperatorOr } from './searchElement';

describe('converting search string', () => {

  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies('$translate');
    spyOn(this.$translate, 'instant').and.callFake(key => 'translated.' + key);
    spyOn(this.$translate, 'proposedLanguage').and.returnValue('nb_NO');
  });

  it('product:sx10 should give searchObjectWith product=sx10', function () {
    const s = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), 'product:sx10');
    expect(_.get(s, 'parsedQuery.query')).toBe('sx10');
    expect(_.get(s, 'parsedQuery.field')).toBe('product');
  });

  it('invalid query should set hasError', function () {
    const s = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), 'sx10 (');
    expect(s.hasError).toBeTruthy();
  });

  describe('addParsedSearchElement', () => {

    it('adding search element element to empty so should set it', () => {
      const fq = new FieldQuery('Added one');
      const so = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      so.addParsedSearchElement(fq, false);

      expect(so.getBullets().length).toBe(1);
      expect(so.getBullets()[0].isEqual(fq)).toBe(true);
    });

    it('adding search element element to existing fq should make another pill', () => {
      const fq1 = new FieldQuery('Added one');
      const fq2 = new FieldQuery('Added two');
      const fq3 = new FieldQuery('added one', QueryParser.Field_UpgradeChannel);
      const fq4 = new FieldQuery('added one', QueryParser.Field_UpgradeChannel, FieldQuery.QueryTypeExact);

      const so = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      so.addParsedSearchElement(fq1, false);
      so.addParsedSearchElement(fq2, false);
      expect(so.getBullets().length).toBe(2);
      expect(new OperatorAnd([fq1, fq2], false).isEqual(new OperatorAnd(so.getBullets(), false))).toBe(true);
      expect(new OperatorAnd([fq2, fq1], false).isEqual(new OperatorAnd(so.getBullets(), false))).toBe(true);
      expect(new OperatorAnd([fq2], false).isEqual(so.getBullets()[0].getParent())).toBe(false);
      expect(new OperatorAnd([fq2, fq1, new FieldQuery('Added three')], false).isEqual(so.getBullets()[0].getParent())).toBe(false);

      so.addParsedSearchElement(fq3, false);
      expect(so.getBullets().length).toBe(3);

      so.addParsedSearchElement(fq4, false);
      expect(so.getBullets().length).toBe(4);
    });

    it('adding an equal search element element to existing fq should not make another pill', () => {
      const fq1a = new FieldQuery('Added one');
      const fq1b = new FieldQuery('Added one');
      const fq1c = new FieldQuery('added one');
      const fq1d = new FieldQuery('added one', '');

      const so = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      so.addParsedSearchElement(fq1a, false);

      so.addParsedSearchElement(fq1b, false);
      expect(so.getBullets().length).toBe(1);
      expect(fq1a.isEqual(so.getBullets()[0])).toBe(true);

      so.addParsedSearchElement(fq1c, false);
      expect(so.getBullets().length).toBe(1);
      expect(fq1a.isEqual(so.getBullets()[0])).toBe(true);

      so.addParsedSearchElement(fq1d, false);
      expect(so.getBullets().length).toBe(1);
      expect(fq1a.isEqual(so.getBullets()[0])).toBe(true);
    });

    it('adding an equal search element element to existing fq with toggle should remove the pill', () => {
      const fq1a = new FieldQuery('Added one');
      const fq1b = new FieldQuery('Added one');
      const fq1c = new FieldQuery('added one');
      const fq1d = new FieldQuery('added one', '');

      const so = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      so.addParsedSearchElement(fq1a, true);
      expect(so.getBullets().length).toBe(1);
      expect(fq1a.isEqual(so.getBullets()[0])).toBe(true);

      so.addParsedSearchElement(fq1b, true);
      expect(so.getBullets().length).toBe(0);

      so.addParsedSearchElement(fq1c, true);
      expect(so.getBullets().length).toBe(1);
      expect(fq1a.isEqual(so.getBullets()[0])).toBe(true);

      so.addParsedSearchElement(fq1d, true);
      expect(so.getBullets().length).toBe(0);
    });


    it('adding an exact field pill should transform an existing of the same field to OR', () => {

      //Applies to all fields except tags and errorcodes(?)
      verifyAddingSameFieldExactPillBehavior(QueryParser.Field_Tag, 'FirstTag', 'Secondtag', 'Thirdtag', false);
      verifyAddingSameFieldExactPillBehavior(QueryParser.Field_UpgradeChannel, 'Stable', 'Beta', 'Preview', true);
      verifyAddingSameFieldExactPillBehavior(QueryParser.Field_ConnectionStatus, 'ONLINE', 'DISCONNECTED', 'OFFLINE_EXPIRED', true);
    });

    function verifyAddingSameFieldExactPillBehavior(field: string, val1: string, val2: string, val3: string, expectJoinToOr: boolean) {
      const fq1a = new FieldQuery(_.upperFirst(val1), field, FieldQuery.QueryTypeExact);
      const fq1b = new FieldQuery(_.toLower(val1), field, FieldQuery.QueryTypeExact);
      const fq2 = new FieldQuery(val2, field, FieldQuery.QueryTypeExact);
      const fq3 = new FieldQuery(val3, field, FieldQuery.QueryTypeExact);

      const so = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      so.addParsedSearchElement(fq1a, false);
      so.addParsedSearchElement(fq1b, false);

      expect(so.getBullets().length).toBe(1);
      expect(fq1a.isEqual(so.getBullets()[0])).toBe(true);

      so.addParsedSearchElement(fq2, false);
      if (expectJoinToOr) {
        expect(so.getBullets().length).toBe(1, 'failed for ' + field);
        expect(new OperatorOr([fq1a, fq2], false).isEqual(so.getBullets()[0])).toBe(true, 'failed for ' + field);
      } else {
        expect(so.getBullets().length).toBe(2, 'failed for ' + field);
        expect(new OperatorAnd([fq1a, fq2], false).isEqual(new OperatorAnd(so.getBullets()))).toBe(true, 'failed for ' + field);
      }

      so.addParsedSearchElement(fq3, false);
      if (expectJoinToOr) {
        expect(so.getBullets().length).toBe(1, 'failed for ' + field);
        expect(new OperatorOr([fq1a, fq2, fq3], false).isEqual(so.getBullets()[0])).toBe(true, 'failed for ' + field);
      } else {
        expect(so.getBullets().length).toBe(3, 'failed for ' + field);
        expect(new OperatorAnd([fq1a, fq2, fq3], false).isEqual(new OperatorAnd(so.getBullets()))).toBe(true, 'failed for ' + field);
      }
    }
  });
});
