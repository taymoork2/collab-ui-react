import searchModule from './index';
import { SearchObject } from './search/searchObject';

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
      const url = this.UrlConfig.getCsdmServiceUrl() + '/organization/--org--/devices/_search?query=product:sx10,any:test&size=20&from=0&aggregates=product,connectionStatus,productFamily,activeInterface,errorCodes,software,upgradeChannel';
      this.$httpBackend.expectGET(url).respond(200);
      this.CsdmSearchService.search(SearchObject.create('product:sx10,any:test'));
      this.$httpBackend.flush();
    });
  });
});
