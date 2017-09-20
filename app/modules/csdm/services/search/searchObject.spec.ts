import { SearchObject } from './searchObject';

describe('converting search string', () => {
  it('product:sx10 should give searchObjectWith product=sx10', function () {
    const s = SearchObject.createWithQuery('product:sx10');
    expect(_.get(s, 'parsedQuery.query')).toBe('sx10');
    expect(_.get(s, 'parsedQuery.field')).toBe('product');
  });
  it('invalid query should set hasError', function () {
    const s = SearchObject.createWithQuery('sx10 (');
    expect(s.hasError).toBeTruthy();
  });
});
