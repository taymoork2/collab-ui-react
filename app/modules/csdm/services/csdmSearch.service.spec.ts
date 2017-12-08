import searchModule from './index';
import { SearchObject } from './search/searchObject';
import { Caller } from './csdmSearch.service';
import { SearchTranslator } from './search/searchTranslator';
import { QueryParser } from './search/queryParser';
import translateModule from '../../core/scripts/services/missing-translation-handler.factory';

describe('CsdmSearchService', () => {
  beforeEach(function () {
    this.initModules(searchModule, translateModule);
    this.injectDependencies('$httpBackend', 'CsdmSearchService', 'UrlConfig', 'Authinfo');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('--org--');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingRequest();
    this.$httpBackend.verifyNoOutstandingExpectation();
  });

  it('service is initialized', function () {
    expect(this.CsdmSearchService).toBeDefined();
  });
  describe('perform empty search', () => {
    it('should return a data object', function () {
      const searchObj = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search';
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      this.CsdmSearchService.search(searchObj);
      this.$httpBackend.flush();
    });
  });

  describe('perform type search', () => {
    it('should return a data object', function () {
      const searchObj = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), 'cloudberry');
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search';
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      this.CsdmSearchService.search(searchObj);
      this.$httpBackend.flush();
    });
  });

  describe('perform type and any search', () => {
    it('should return a data object', function () {
      const searchObj = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), 'product:sx10,any:test');
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search';
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      this.CsdmSearchService.search(searchObj);
      this.$httpBackend.flush();
    });
  });

  describe('perform two consequtive search', () => {
    it('should cancel the first request', function () {
      const searchObj = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search';
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      let queryOneExecuted = false;
      let queryOneFinally = false;
      let queryTwoExecuted = false;
      this.CsdmSearchService.search(searchObj).then(() => {
        queryOneExecuted = true;
      }).finally(() => {
        queryOneFinally = true;
      });
      this.CsdmSearchService.search(searchObj).then(() => {
        queryTwoExecuted = true;
      });
      this.$httpBackend.flush();
      expect(queryOneExecuted).toBe(false);
      expect(queryOneFinally).toBe(true);
      expect(queryTwoExecuted).toBe(true);
    });
  });

  describe('perform two consequtive search with different caller', () => {
    it('should allow both requests', function () {
      const searchObj = SearchObject.createWithQuery(new QueryParser(new SearchTranslator(null, null)), '');
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search';
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      this.$httpBackend.expectPOST(url, this.CsdmSearchService.constructSearchRequest(searchObj)).respond(200);
      let queryOneExecuted = false;
      let queryOneFinally = false;
      let queryTwoExecuted = false;
      this.CsdmSearchService.search(searchObj, Caller.searchOrLoadMore).then(() => {
        queryOneExecuted = true;
      }).finally(() => {
        queryOneFinally = true;
      });
      this.CsdmSearchService.search(searchObj, Caller.aggregator).then(() => {
        queryTwoExecuted = true;
      });
      this.$httpBackend.flush();
      expect(queryOneExecuted).toBe(true);
      expect(queryOneFinally).toBe(true);
      expect(queryTwoExecuted).toBe(true);
    });
  });
});
