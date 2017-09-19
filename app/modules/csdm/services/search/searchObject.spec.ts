import { SearchObject } from './searchObject';

describe('converting search string', () => {
  it('product:sx10 should give searchObjectWith product=sx10', function () {
    const s = SearchObject.create('product:sx10');
    expect(_.get(s, 'tokenizedQuery.product.query')).toBe('sx10');
  });
  it('sx10 should give searchObjectWith any=sx10', function () {
    const s = SearchObject.create('sx10');
    expect(_.get(s, 'tokenizedQuery.any.query')).toBe('sx10');
  });
  it('product:sx10,test should give searchObjectWith product=sx10', function () {
    const s = SearchObject.create('product:sx10,test');
    expect(_.get(s, 'tokenizedQuery.product.query')).toBe('sx10');
    expect(_.get(s, 'tokenizedQuery.any.query')).toBe('test');
  });
  it('product:sx10,ip:54,test should give searchObjectWith product sx10 ip 54 and any=test', function () {
    const s = SearchObject.create('product:sx10,ip:54,test');
    expect(_.get(s, 'tokenizedQuery.product.query')).toBe('sx10');
    expect(_.get(s, 'tokenizedQuery.any.query')).toBe('test');
    expect(_.get(s, 'tokenizedQuery.ip.query')).toBe('54');
  });
  it('product:sx10,ip:54,any:test should give searchObjectWith product sx10 ip 54 and any=test', function () {
    const s = SearchObject.create('product:sx10,ip:54,test');
    expect(_.get(s, 'tokenizedQuery.product.query')).toBe('sx10');
    expect(_.get(s, 'tokenizedQuery.any.query')).toBe('test');
    expect(_.get(s, 'tokenizedQuery.ip.query')).toBe('54');
  });
});
