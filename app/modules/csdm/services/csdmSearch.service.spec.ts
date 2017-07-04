import searchModule from './index';
import { SearchObject } from './csdmSearch.service';

describe('CsdmSearchService', () => {
  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies('$httpBackend', 'CsdmSearchService', 'UrlConfig', 'Authinfo');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('--org--');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('service is initialized', function () {
    expect(this.CsdmSearchService).toBeDefined();
  });
  describe('perform empty search', () => {
    it('should return a data object', function () {
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?size=20&aggregates=product,connectionStatus,productFamily';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search(<SearchObject>{});
      this.$httpBackend.flush();
    });
  });

  describe('perform type search', () => {
    it('should return a data object', function () {
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?query=cloudberry&size=20&aggregates=product,connectionStatus,productFamily';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search({ query: 'cloudberry' });
      this.$httpBackend.flush();
    });
  });

  describe('perform type and any search', () => {
    it('should return a data object', function () {
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?query=type:cloudberry,test&size=20&aggregates=product,connectionStatus,productFamily';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search(SearchObject.create('product:sx10,any:test'));
      this.$httpBackend.flush();
    });
  });

  describe('converting search string', () => {
    it('product:sx10 should give searchObjectWith product=sx10', function () {
      const s = SearchObject.create('product:sx10');
      expect(_.get(s, 'tokenizedQuery.product')).toBe('sx10');
    });
    it('sx10 should give searchObjectWith any=sx10', function () {
      const s = SearchObject.create('sx10');
      expect(_.get(s, 'tokenizedQuery.any')).toBe('sx10');
    });
    it('product:sx10,test should give searchObjectWith product=sx10', function () {
      const s = SearchObject.create('product:sx10,test');
      expect(_.get(s, 'tokenizedQuery.product')).toBe('sx10');
      expect(_.get(s, 'tokenizedQuery.any')).toBe('test');
    });
    it('product:sx10,ip:54,test should give searchObjectWith product sx10 ip 54 and any=test', function () {
      const s = SearchObject.create('product:sx10,ip:54,test');
      expect(_.get(s, 'tokenizedQuery.product')).toBe('sx10');
      expect(_.get(s, 'tokenizedQuery.any')).toBe('test');
      expect(_.get(s, 'tokenizedQuery.ip')).toBe('54');
    });
    it('product:sx10,ip:54,any:test should give searchObjectWith product sx10 ip 54 and any=test', function () {
      const s = SearchObject.create('product:sx10,ip:54,test');
      expect(_.get(s, 'tokenizedQuery.product')).toBe('sx10');
      expect(_.get(s, 'tokenizedQuery.any')).toBe('test');
      expect(_.get(s, 'tokenizedQuery.ip')).toBe('54');
    });
  });
});
