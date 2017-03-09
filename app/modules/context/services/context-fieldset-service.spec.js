'use strict';

describe('Service: contextFieldsetsService', function () {

  var fieldsetData, fieldId;
  var dictionaryUrl = 'https://dictionary.produs1.ciscoccservice.com';

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      'ContextFieldsetsService',
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

  it('should get fieldsets and process results successfully', function () {
    fieldsetData = [
      {
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
          'Context_Notes',
          'Context_Mobile_Phone',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD4',
            'lastUpdated': '2017-02-02T21:22:35.106Z',
          },
          {
            'id': 'Agent_ID',
            'lastUpdated': '2017-01-23T16:48:50.021Z',
          },
          {
            'id': 'Context_Mobile_Phone',
            'lastUpdated': '2017-01-23T16:48:50.096Z',
          },
          {
            'id': 'Context_Notes',
            'lastUpdated': '2017-01-23T16:48:49.159Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        'id': 'aaa_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      }];

    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/fieldset/v1/search?q=id:*&maxEntries=200').respond(200, fieldsetData);
    this.ContextFieldsetsService.getFieldsets().then(function (response) {
      expect(response[0].id).toEqual('aaa_custom_fieldset');
      expect(response[0].lastUpdated).not.toBeNull();
    });
    this.$httpBackend.flush();
  });


  it('should reject when get fieldset is called and get returns failure response', function () {
    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/fieldset/v1/search?q=id:*&maxEntries=200').respond(404, 'Not found');
    this.ContextFieldsetsService.getFieldsets().then(function (errorResponse) {
      expect(errorResponse.data).toBe('Not found');
      expect(errorResponse.status).toBe(404);
    });
    this.$httpBackend.flush();
  });

  it('should reject when get fieldset membership is called and get returns failure response', function () {
    fieldId = 'someField';
    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/fieldset/v1/search?q=fieldId:' + fieldId + '&maxEntries=200').respond(404, 'Not found');
    this.ContextFieldsetsService.getFieldMembership(fieldId).then(function (errorResponse) {
      expect(errorResponse.data).toBe('Not found');
      expect(errorResponse.status).toBe(404);
    });
    this.$httpBackend.flush();
  });

  it('should get ids of fieldsets to which the given field belongs', function () {
    fieldId = 'AAA_TEST_FIELD';
    fieldsetData = [
      {
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD',
          'Agent_ID',
          'AAA_TEST_FIELD4',
          'Context_Notes',
          'Context_Mobile_Phone',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
          {
            'id': 'AAA_TEST_FIELD4',
            'lastUpdated': '2017-02-02T21:22:35.106Z',
          },
          {
            'id': 'Agent_ID',
            'lastUpdated': '2017-01-23T16:48:50.021Z',
          },
          {
            'id': 'Context_Mobile_Phone',
            'lastUpdated': '2017-01-23T16:48:50.096Z',
          },
          {
            'id': 'Context_Notes',
            'lastUpdated': '2017-01-23T16:48:49.159Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/aaa_custom_fieldset',
        'id': 'aaa_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      },
      {
        'orgId': 'd06308f8-c24f-4281-8b6f-03f672d34231',
        'description': 'aaa custom fieldset with some long description description description description description',
        'fields': [
          'AAA_TEST_FIELD',
          'Context_Notes',
        ],
        'publiclyAccessible': false,
        'fieldDefinitions': [
          {
            'id': 'AAA_TEST_FIELD',
            'lastUpdated': '2017-02-02T17:12:33.167Z',
          },
          {
            'id': 'Context_Notes',
            'lastUpdated': '2017-01-23T16:48:49.159Z',
          },
        ],
        'refUrl': '/dictionary/fieldset/v1/id/ccc_custom_fieldset',
        'id': 'ccc_custom_fieldset',
        'lastUpdated': '2017-02-10T19:37:36.998Z',
      }];

    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/fieldset/v1/search?q=fieldId:' + fieldId + '&maxEntries=200').respond(200, fieldsetData);
    this.ContextFieldsetsService.getFieldMembership(fieldId).then(function (response) {
      expect(response.length).toEqual(2);
      expect(response[0]).toEqual('aaa_custom_fieldset');
      expect(response[1]).toEqual('ccc_custom_fieldset');
    });
    this.$httpBackend.flush();
  });

  it('should get empty response when field does not belong to any fieldsets', function () {
    fieldId = 'AAA_TEST_FIELD';
    fieldsetData = [];

    this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/fieldset/v1/search?q=fieldId:' + fieldId + '&maxEntries=200').respond(200, fieldsetData);
    this.ContextFieldsetsService.getFieldMembership(fieldId).then(function (response) {
      expect(response).not.toBeNull();
      expect(response.length).toEqual(0);
    });
    this.$httpBackend.flush();
  });

});
