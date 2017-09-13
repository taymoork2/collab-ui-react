import searchModule from './index';
import { SearchObject } from './search/searchObject';
import { Caller } from './csdmSearch.service';

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
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?size=20&from=0&query=&aggregates=product,connectionStatus,productFamily,activeInterface,errorCodes,software,upgradeChannel';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search(<SearchObject>{});
      this.$httpBackend.flush();
    });
  });

  describe('perform type search', () => {
    it('should return a data object', function () {
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?query=cloudberry&size=20&from=0&aggregates=product,connectionStatus,productFamily,activeInterface,errorCodes,software,upgradeChannel';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search({ query: 'cloudberry' });
      this.$httpBackend.flush();
    });
  });

  describe('perform type and any search', () => {
    it('should return a data object', function () {
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?query=product:sx10,any:test&size=20&sortField=connectionStatus&sortOrder=asc&from=0&aggregates=product,connectionStatus,productFamily,activeInterface,errorCodes,software,upgradeChannel';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search(SearchObject.create('product:sx10,any:test'));
      this.$httpBackend.flush();
    });
  });

  describe('perform two consequtive search', () => {
    it('should cancel the first request', function () {
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?size=20&from=0&query=&aggregates=product,connectionStatus,productFamily,activeInterface,errorCodes,software,upgradeChannel';
      this.$httpBackend.expectGET(url).respond(200);
      this.$httpBackend.expectGET(url).respond(200);
      let queryOneExecuted = false;
      let queryOneFinally = false;
      let queryTwoExecuted = false;
      this.CsdmSearchService.search(<SearchObject>{}).then(() => {
        queryOneExecuted = true;
      }).finally(() => {
        queryOneFinally = true;
      });
      this.CsdmSearchService.search(<SearchObject>{}).then(() => {
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
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?size=20&from=0&query=&aggregates=product,connectionStatus,productFamily,activeInterface,errorCodes,software,upgradeChannel';
      this.$httpBackend.expectGET(url).respond(200);
      this.$httpBackend.expectGET(url).respond(200);
      let queryOneExecuted = false;
      let queryOneFinally = false;
      let queryTwoExecuted = false;
      this.CsdmSearchService.search(<SearchObject>{}, Caller.searchOrLoadMore).then(() => {
        queryOneExecuted = true;
      }).finally(() => {
        queryOneFinally = true;
      });
      this.CsdmSearchService.search(<SearchObject>{}, Caller.aggregator).then(() => {
        queryTwoExecuted = true;
      });
      this.$httpBackend.flush();
      expect(queryOneExecuted).toBe(true);
      expect(queryOneFinally).toBe(true);
      expect(queryTwoExecuted).toBe(true);
    });
  });
});
