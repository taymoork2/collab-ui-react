import reduxModule from './index';
import { highlightFilter, highlightSearchAndTranslateFilter } from './highlightFilter';
import { QueryParser } from '../services/search/queryParser';
import { SearchObject } from '../services/search/searchObject';


describe('highlightfilter', () => {
  let filter: (input, textToHighlight) => string;
  beforeEach(function () {
    this.initModules(reduxModule);
    this.injectDependencies('DeviceSearchTranslator', '$translate', '$sanitize');
    filter = highlightFilter(this.$sanitize);
  });
  it('should highlight simple query', () => {
    expect(filter('connection', 'con')).toBe('<b>con</b>nection');
  });

  it('should highlight sub parts of query', () => {
    expect(filter('connection', 'con tion')).toBe('<b>con</b>nec<b>tion</b>');
  });
});

describe('highlightSearchfilter', () => {
  let filter: (input, translateParams: { [key: string]: string } | null, searchObject: SearchObject) => string;
  beforeEach(function () {
    this.initModules(reduxModule);
    this.injectDependencies('DeviceSearchTranslator', '$translate', '$sanitize');
  });
  beforeEach(function () {
    filter = highlightSearchAndTranslateFilter(this.$translate, this.$sanitize);
  });
  it('should highlight part from FieldQuery', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('con');
    expect(filter('connection', null, so)).toBe('<b>con</b>nection');
  });
  it('should highlight params for translation', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('con');
    expect(filter('containing {{query}}', { query: 'connection' }, so)).toBe('containing <b>con</b>nection');
  });
  it('should highlight params for translation with and case', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('a b');
    expect(filter('containing {{query}}', { query: '(a and b)' }, so)).toBe('containing (<b>a</b> and <b>b</b>)');
  });
  it('should highlight params for translation with multiple and or case', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('c b a o n r');
    expect(filter('containing {{query}}', { query: '(c and b) or (r and a and o and n)' }, so)).toBe('containing (<b>c</b> and <b>b</b>) or (<b>r</b> and <b>a</b> and <b>o</b> and <b>n</b>)');
  });
  it('should highlight edge cases for translation', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('c b a o n r');
    expect(filter('containing {{query}}', { query: '"a b"' }, so)).toBe('containing &#34;<b>a</b> <b>b</b>&#34;');
    expect(filter('containing {{query}}', { query: 'a b' }, so)).toBe('containing <b>a</b> <b>b</b>');
  });
  it('should highlight edge cases for non translated text', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('c b a o n r');
    expect(filter('a b', null, so)).toBe('<b>a</b> <b>b</b>');
  });
  it('should handle no highlight', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('');
    expect(filter('a b', null, so)).toBe('a b');
    expect(filter('', null, so)).toBe('');
  });
  describe('sanitizing', () => {
    it('should sanitize all existing html', function () {
      const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
      so.setWorkingElementText('<b> con');
      expect(filter('containing {{query}}', { query: '<b> connection' }, so)).toBe('containing &lt;b&gt; <b>con</b>nection');
      expect(filter('containing {{query}}', { query: '<script>alert()</script> connection' }, so)).toBe('containing &lt;script&gt;alert()&lt;/script&gt; <b>con</b>nection');
      expect(filter('<script>alert()</script> connection', null, so)).toBe('&lt;script&gt;alert()&lt;/script&gt; <b>con</b>nection');
    });
  });
});
