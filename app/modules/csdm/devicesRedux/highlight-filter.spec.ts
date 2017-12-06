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
});
