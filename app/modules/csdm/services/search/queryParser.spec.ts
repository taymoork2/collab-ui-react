import searchModule from '../index';
import { QueryParser } from './queryParser';
import { SearchTranslator } from './searchTranslator';

describe('QueryParser', () => {
  let translate;

  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies('$translate');
    translate = this.$translate;
    spyOn(this.$translate, 'instant').and.callFake(key => 'translated.' + key);
    spyOn(this.$translate, 'proposedLanguage').and.returnValue('nb_NO');
  });

  afterEach(() => {
    translate = null;
  });

  it('should parse a simple term', () => {
    expectQueryToParseTo('term1', { query: 'term1' });
    expectQueryToParseTo(' term1', { query: 'term1' });
    expectQueryToParseTo('term1 ', { query: 'term1' });
  });

  it('should parse a simple phrase', () => {
    expectQueryToParseTo('"term1"', { query: 'term1' });
    expectQueryToParseTo(' "term2"', { query: 'term2' });
    expectQueryToParseTo('"term3" ', { query: 'term3' });
    expectQueryToParseTo('"term4 a"', { query: 'term4 a' });
    expectQueryToParseTo(' "term5 a"', { query: 'term5 a' });
    expectQueryToParseTo('"term6 a" ', { query: 'term6 a' });
  });

  it('should parse two terms', () => {
    expectQueryToParseTo('term1 term2', { and: [{ query: 'term1' }, { query: 'term2' }] });
    expectQueryToParseTo(' term1   term2 ', { and: [{ query: 'term1' }, { query: 'term2' }] });
    expectQueryToParseTo('term1 and term2', { and: [{ query: 'term1' }, { query: 'term2' }] });
    expectQueryToParseTo(' term1   and  "term2 n" ', { and: [{ query: 'term1' }, { query: 'term2 n' }] });

    expectQueryToParseTo('term1 and product: term2', {
      and: [{ query: 'term1' }, {
        query: 'term2',
        field: 'product',
      }],
    });
  });

  it('should parse parenthesis', () => {
    expectQueryToParseTo('(term1 term2)', { and: [{ query: 'term1' }, { query: 'term2' }] });
    expectQueryToParseTo(' (term1 OR term2) AND term3 ', { and: [{ or: [{ query: 'term1' }, { query: 'term2' }] }, { query: 'term3' }] });
    expectQueryToParseTo('(term1 OR term2)  term3 ', { and: [{ or: [{ query: 'term1' }, { query: 'term2' }] }, { query: 'term3' }] });
    expectQueryToParseTo(' ((term1 and (term4)  and  term2) OR term5) ', {
      or: [
        { and: [{ query: 'term1' }, { query: 'term4' }, { query: 'term2' }] },
        { query: 'term5' },
      ],
    });
  });

  it('should parse an unknown field query as a term', () => {
    expectQueryToParseTo('field1: sipUrl', { and: [{ query: 'field1:' }, { query: 'sipurl' }] });
    expectQueryToParseTo('field1 : sipUrl', { and: [{ query: 'field1' }, { query: ':' }, { query: 'sipurl' }] });
  });

  it('should detect field starts correctly', () => {
    expect(new QueryParser(new SearchTranslator(translate, null)).startsField('product:')).toBeTruthy();
    expect(new QueryParser(new SearchTranslator(translate, null)).startsField('products:')).toBeFalsy();
    expect(new QueryParser(new SearchTranslator(translate, null)).startsField('translated.spacesPage.statusHeader=')).toBeTruthy();
  });

  it('should parse a field query', () => {
    expectQueryToParseTo('product: term1', { query: 'term1', field: 'product' });
    expectQueryToParseTo(' product: term2', { query: 'term2', field: 'product' });
    expectQueryToParseTo('product: term3 ', { query: 'term3', field: 'product' });
    expectQueryToParseTo('product: "term1 b" ', { query: 'term1 b', field: 'product' });
    expectQueryToParseTo('product: (term1 b) ', {
      and: [{ query: 'term1', field: 'product' },
        { query: 'b', field: 'product' }],
    });

    expectQueryToParseTo(' product= term1', { query: 'term1', field: 'product', type: 'exact' });
  });

  describe('translation', () => {
    it('should translate a field query for future upgracechannels', () => {
      //Unknown sw upgrade channel:
      expectQueryToParseTo('translated.deviceSettings.softwareUpgradeChannel="new SecretOne"', { query: 'New_Secretone', field: 'upgradechannel', type: 'exact' });
      //Translated upgrade channel:
      expectQueryToParseTo('translated.deviceSettings.softwareUpgradeChannel="Stable Preview"', { query: 'Stable_Preview', field: 'upgradechannel', type: 'exact' });
    });
  });

  it('should parse mixed and+or queries', () => {
    expectQueryToParseTo('(a and b) or c', { or: [{ and: [{ query: 'a' }, { query: 'b' }] }, { query: 'c' }] });
    expectQueryToParseTo('a and (b or c)', { and: [{ query: 'a' }, { or: [{ query: 'b' }, { query: 'c' }] }] });
    expectQueryToParseTo('(a or b) and c', { and: [{ or: [{ query: 'a' }, { query: 'b' }] }, { query: 'c' }] });
    expectQueryToParseTo('a or (b and c)', { or: [{ query: 'a' }, { and: [{ query: 'b' }, { query: 'c' }] }] });

    expectQueryToParseTo('(a b) or c', { or: [{ and: [{ query: 'a' }, { query: 'b' }] }, { query: 'c' }] });
    expectQueryToParseTo('a (b or c)', { and: [{ query: 'a' }, { or: [{ query: 'b' }, { query: 'c' }] }] });
    expectQueryToParseTo('(a or b) c', { and: [{ or: [{ query: 'a' }, { query: 'b' }] }, { query: 'c' }] });
    expectQueryToParseTo('a or (b c)', { or: [{ query: 'a' }, { and: [{ query: 'b' }, { query: 'c' }] }] });

    expectQueryToThrow('a and b or c');
    expectQueryToThrow('a b or c');
    expectQueryToThrow('a or b and c');
    expectQueryToThrow('a or b c');
  });

  it('should throw on invalid searches', () => {
    expectQueryToThrow('hei (mac');
    expectQueryToThrow('serial: (mac:67');
    expectQueryToThrow('hei (mac()');
    expectQueryToThrow('hei "mac');
    expectQueryToThrow('(hei) (');
    expectQueryToThrow('((hei)');
    expectQueryToThrow('(activeInterface) yo(sipUrl1');
    expectQueryToThrow('(activeInterface) yo(');
  });

  it('should allow the non-translated field names', () => {
    expectLookupByTranslatedField('product', 'product');
    expectLookupByTranslatedField('mac', 'mac');
    expectLookupByTranslatedField('ip', 'ip');
  });

  it('should allow the non-translated field names case insensitive', () => {
    expectLookupByTranslatedField('proDuct', 'product');
    expectLookupByTranslatedField('MAC', 'mac');
    expectLookupByTranslatedField('Product', 'product');
  });

  it('should allow the translated field names', () => {
    expectLookupByTranslatedField('translated.spacesPage.nameHeader', 'displayname');
    expectLookupByTranslatedField('translated.spacesPage.statusHeader', 'connectionstatus');
    expectLookupByTranslatedField('translated.deviceSettings.softwareUpgradeChannel', 'upgradechannel');
    expectLookupByTranslatedField('translated.deviceOverviewPage.networkConnectivity', 'activeinterface');
    expectLookupByTranslatedField('translated.spacesPage.typeHeader', 'product');
    expectLookupByTranslatedField('translated.deviceOverviewPage.macAddr', 'mac');
    expectLookupByTranslatedField('translated.deviceOverviewPage.ipAddr', 'ip');
    expectLookupByTranslatedField('translated.deviceOverviewPage.sipUrl', 'sipurl');
    expectLookupByTranslatedField('translated.deviceOverviewPage.issues', 'errorcodes');
    expectLookupByTranslatedField('translated.deviceOverviewPage.serial', 'serial');
    expectLookupByTranslatedField('translated.spacesPage.tags', 'tag');
  });

  function expectLookupByTranslatedField(translationValue: string, expectedField: string) {
    expect(new QueryParser(new SearchTranslator(translate, null)).getUniversalFieldName(translationValue)).toEqual(expectedField);
  }

  it('should allow the translated field names case insensitive', () => {
    expectLookupByTranslatedField('TranslaTed.deviceoverviewPage.networkConnectivity', 'activeinterface');
  });

  it('should not allow unknown field names', () => {
    expect(new QueryParser(new SearchTranslator(translate, null)).getUniversalFieldName('proXduct')).toBeUndefined();
    expect(new QueryParser(new SearchTranslator(translate, null)).getUniversalFieldName('maXc')).toBeUndefined();
    expect(new QueryParser(new SearchTranslator(translate, null)).getUniversalFieldName('proXduct')).toBeUndefined();
  });

  function expectQueryToThrow(query: string) {
    try {
      new QueryParser(new SearchTranslator(translate, null)).parseQueryString(query);
      fail('Query did not throw:' + query);
    } catch (e) {
    }
  }

  function expectQueryToParseTo(query: string, expectedObject: any) {
    const parsedQuery = new QueryParser(new SearchTranslator(translate, null)).parseQueryString(query);
    expect(JSON.stringify(parsedQuery)).toEqual(JSON.stringify(expectedObject));
  }
});
