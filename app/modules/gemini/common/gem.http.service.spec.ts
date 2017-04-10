import anything = jasmine.anything;
describe('Service: GmHttp', () => {

  beforeEach(function () {
    angular.mock.module('Core');
    angular.mock.module('Gemini');
    this.injectDependencies('UrlConfig', '$httpBackend', '$q', 'GmHttpService');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('httpGet', function () {
    this.$httpBackend.whenGET(anything).respond(this.$q.resolve());
    this.GmHttpService.httpGet(anything).then(() => {
      expect(this.GmHttpService.httpConfig.method).toBe('GET');
    });

    this.$httpBackend.flush();
  });

  it('httpPost', function () {
    this.$httpBackend.whenPOST(anything).respond(this.$q.resolve());
    this.GmHttpService.httpPost(anything).then(() => {
      expect(this.GmHttpService.httpConfig.method).toBe('POST');
    });

    this.$httpBackend.flush();
  });

  it('httpPUT', function () {
    this.$httpBackend.whenPUT(anything).respond(this.$q.resolve());
    this.GmHttpService.httpPut(anything).then(() => {
      expect(this.GmHttpService.httpConfig.method).toBe('PUT');
    });

    this.$httpBackend.flush();
  });

  it('httpPatch', function () {
    this.$httpBackend.whenPATCH(anything).respond(this.$q.resolve());
    this.GmHttpService.httpPatch(anything).then(() => {
      expect(this.GmHttpService.httpConfig.method).toBe('PATCH');
    });

    this.$httpBackend.flush();
  });

  it('httpDelete', function () {
    this.$httpBackend.whenDELETE(anything).respond(this.$q.resolve());
    this.GmHttpService.httpDelete(anything).then(() => {
      expect(this.GmHttpService.httpConfig.method).toBe('DELETE');
    });

    this.$httpBackend.flush();
  });

});
