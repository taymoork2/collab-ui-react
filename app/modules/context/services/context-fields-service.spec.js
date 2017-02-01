'use strict';

describe('Service: contextFieldsService', function () {

  var fieldData;
  var dictionaryUrl = 'https://dictionary.produs1.ciscoccservice.com';

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      'ContextFieldsService',
      'Discovery',
      '$q',
      '$httpBackend'
    );
    spyOn(this.Discovery, 'getEndpointForService').and.returnValue(this.$q.resolve(dictionaryUrl));
  });

  afterEach(inject(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  }));

  it('should get fields and verify results', function () {
    fieldData = [
      { 'classification': 'PII',
        'dataType': 'string',
        'searchable': 'false',
        'publiclyAccessible': true,
        'translations': { 'en_US': 'Agent ID' },
        'locales': [],
        'refUrl': '/dictionary/field/v1/id/Agent_ID',
        'id': 'Agent_ID',
        'lastUpdated': '2017-01-23T16:48:50.021Z' }];

    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/field/v1/search?q=id:*&maxEntries=200').respond(200, fieldData);
    this.ContextFieldsService.getFields().then(function (response) {
      expect(response[0].dataType).toEqual('string');
      expect(response[0].classification).toEqual('PII');
      expect(response[0].searchable).toEqual('false');
      expect(response[0].publiclyAccessible).toEqual(true);
      expect(response[0].lastUpdated).not.toBeNull();
    });
    this.$httpBackend.flush();
  });

  it('should reject when get fields is called and get returns failure response', function () {
    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/field/v1/search?q=id:*&maxEntries=200').respond(404, 'Not found');
    this.ContextFieldsService.getFields().then(function (errorResponse) {
      expect(errorResponse.data).toBe('Not found');
      expect(errorResponse.status).toBe(404);
    });
    this.$httpBackend.flush();
  });
});
