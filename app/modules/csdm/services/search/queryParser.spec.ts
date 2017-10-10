import { QueryParser } from './queryParser';

describe('QueryParser', () => {

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

  it('should parse a field query', () => {
    expectQueryToParseTo('product: term1', { query: 'term1', field: 'product' });
    expectQueryToParseTo(' product: term1', { query: 'term1', field: 'product' });
    expectQueryToParseTo('product: term1 ', { query: 'term1', field: 'product' });
    expectQueryToParseTo('product: "term1 b" ', { query: 'term1 b', field: 'product' });
    expectQueryToParseTo('product: (term1 b) ', {
      and: [{ query: 'term1', field: 'product' },
        { query: 'b', field: 'product' }],
    });

    expectQueryToParseTo(' product= term1', { query: 'term1', field: 'product', queryType: 'exact' });
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
    expectQueryToThrow('a and b or c');
    expectQueryToThrow('a or b and c');
    expectQueryToThrow('a or b and c');
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

  function expectQueryToThrow(query: string) {
    try {
      QueryParser.parseQueryString(query);
      fail('Query did not throw:' + query);
    } catch (e) {
    }
  }

  function expectQueryToParseTo(query: string, expectedObject: any) {
    const parsedQuery = QueryParser.parseQueryString(query);
    expect(JSON.stringify(parsedQuery)).toEqual(JSON.stringify(expectedObject));
  }
});
