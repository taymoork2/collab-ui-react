import reduxModule from './index';
import { highlightFilter, highlightAndTranslate, highlightFromSearch } from './highlightFilter';
import { SearchObject } from '../services/search/searchObject';
import { QueryParser } from '../services/search/queryParser';

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
describe('highlightFromSearchFilter', () => {
  let filter: (input: string, search: SearchObject | null, restrictToField: string) => string;
  beforeEach(function () {
    this.initModules(reduxModule);
    this.injectDependencies('DeviceSearchTranslator', '$translate', '$sanitize');
    filter = highlightFromSearch(this.$sanitize);
  });
  it('should highlight simple query', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), 'con');
    expect(filter('connection', so, '')).toBe('<b>con</b>nection');
  });
  it('should higlight for displayname', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), 'displayName:angu');
    expect(filter('angular 2.0 rock', so, 'displayname')).toBe('<b>angu</b>lar 2.0 rock');
  });
  it('should higlight for displayname in or case not tag', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator),
      '(displayName:angu or displayName:lar) 1.0 tags:rock');
    expect(filter('angular 2.0', so, 'displayname')).toBe('<b>angular</b> 2.0');
  });
  it('should higlight for displayname not tag', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), 'displayName:angu tag:rock');
    expect(filter('angular 2.0 rock', so, 'displayname')).toBe('<b>angu</b>lar 2.0 rock');
  });
  it('should higlight for displayname in complex search', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator),
      'product:sx and product:n and connectionstatus=OFFLINE_EXPIRED and (displayname:vander or displayname:ort) and displayname:bern');
    expect(filter('Bernardo Vandervort', so, 'displayname')).toBe('<b>Bern</b>ardo <b>Vander</b>v<b>ort</b>');
  });

});

describe('highlightAndTranslateFilter', () => {
  beforeEach(function () {
    this.initModules(reduxModule);
    this.injectDependencies('DeviceSearchTranslator', '$translate', '$sanitize');
    this.filter = highlightAndTranslate(this.$translate, this.$sanitize);
  });
  it('should highlight part from FieldQuery', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('con');

    const highlightAndRank = this.filter('connection', null, null, so.getWorkingElement(), 0);
    expect(highlightAndRank).toBe('<b>con</b>nection');
  });
  it('should highlight params for translation', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('con');
    const highlightAndRank = this.filter('previous translate', 'containing {{query}}', { query: 'connection' },
      so.getWorkingElement(), 0);
    expect(highlightAndRank).toBe('containing <b>con</b>nection');
  });
  it('should highlight params for translation with and case', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('a b');
    const highlightAndRank = this.filter('prev', 'containing {{query}}', { query: '(a and b)' }, so.getWorkingElement(),
      0);
    expect(highlightAndRank).toBe('containing (<b>a</b> and <b>b</b>)');
  });
  it('should highlight params for translation with multiple and or case', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('c b a o n r');
    const highlightAndRank = this.filter('prev', 'containing {{query}}',
      { query: '(c and b) or (r and a and o and n)' }, so.getWorkingElement(), 0);
    expect(highlightAndRank)
      .toBe('containing (<b>c</b> and <b>b</b>) or (<b>r</b> and <b>a</b> and <b>o</b> and <b>n</b>)');
  });
  it('should highlight edge cases for translation', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('c b a o n r');
    expect(this.filter('prev', 'containing {{query}}', { query: '"a b"' }, so.getWorkingElement(), 0))
      .toBe('containing &#34;<b>a</b> <b>b</b>&#34;');
    expect(this.filter('prev', 'containing {{query}}', { query: 'a b' }, so.getWorkingElement(), 0))
      .toBe('containing <b>a</b> <b>b</b>');
  });
  it('should highlight edge cases for non translated text', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('c b a o n r');
    expect(this.filter('a b', null, null, so.getWorkingElement(), 0)).toBe('<b>a</b> <b>b</b>');
  });
  it('should handle no highlight', function () {
    const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
    so.setWorkingElementText('');
    expect(this.filter('a b', null, null, so.getWorkingElement(), 0)).toBe('a b');
    expect(this.filter('', null, so.getWorkingElement(), 0)).toBe('');
  });
  describe('sanitizing', () => {
    it('should sanitize all existing html', function () {
      const so = SearchObject.createWithQuery(new QueryParser(this.DeviceSearchTranslator), '');
      so.setWorkingElementText('<b> con');
      expect(this.filter('prev', 'containing {{query}}', { query: '<b> connection' }, so.getWorkingElement(), 0))
        .toBe('containing &lt;b&gt; <b>con</b>nection');
      expect(this.filter('prev', 'containing {{query}}', { query: '<script>alert()</script> connection' },
        so.getWorkingElement(), 0)).toBe('containing &lt;script&gt;alert()&lt;/script&gt; <b>con</b>nection');
      expect(this.filter('<script>alert()</script> connection', null, null, so.getWorkingElement(), 0))
        .toBe('&lt;script&gt;alert()&lt;/script&gt; <b>con</b>nection');
    });
  });
});
