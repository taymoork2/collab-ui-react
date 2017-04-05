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

  describe('getfields', function () {
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
      }).catch(fail);
      this.$httpBackend.flush();
    });

    it('should reject when get fields is called and get returns failure response', function () {
      this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/field/v1/search?q=id:*&maxEntries=200').respond(404, 'Not found');
      this.ContextFieldsService.getFields().then(function () {
        fail('ContextFieldsService.getFields should have rejected');
      }).catch(function (errorResponse) {
        expect(errorResponse.data).toBe('Not found');
        expect(errorResponse.status).toBe(404);
      });
      this.$httpBackend.flush();
    });
  });

  describe('getField', function () {
    it('should get the field by id', function () {
      fieldData = {
        id: 'fieldId',
        foo: 'bar',
      };
      this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/field/v1/id/fieldId').respond(200, fieldData);
      this.ContextFieldsService.getField('fieldId').then(function (field) {
        expect(field.id).toBe('fieldId');
        expect(field.foo).toBe('bar');
      }).catch(fail);
      this.$httpBackend.flush();
    });

    it('should reject when get fails', function () {
      this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/field/v1/id/fieldId').respond(404, 'Not found');
      this.ContextFieldsService.getField('fieldId').then(function () {
        fail('ContextFieldsService.getField should have rejected');
      }).catch(function (errorResponse) {
        expect(errorResponse.data).toBe('Not found');
        expect(errorResponse.status).toBe(404);
      });
      this.$httpBackend.flush();
    });
  });

  describe('createField', function () {
    it('should return upon successful create', function () {
      this.$httpBackend.expectPOST(dictionaryUrl + '/dictionary/field/v1').respond(201, 'newField');
      this.ContextFieldsService.createField({}).then(function (response) {
        expect(response.data).toBe('newField');
        expect(response.status).toBe(201);
      }).catch(fail);
      this.$httpBackend.flush();
    });

    it('should reject if create fails', function () {
      this.$httpBackend.expectPOST(dictionaryUrl + '/dictionary/field/v1').respond(400, 'some error');
      this.ContextFieldsService.createField({}).then(function () {
        fail('ContextFieldsService.createField should have rejected');
      }).catch(function (errorResponse) {
        expect(errorResponse.data).toBe('some error');
        expect(errorResponse.status).toBe(400);
      });
      this.$httpBackend.flush();
    });
  });

  describe('createAndGetField', function () {
    it('should create, get, and return the field', function () {
      this.$httpBackend.expectPOST(dictionaryUrl + '/dictionary/field/v1').respond(201, 'newField');
      this.$httpBackend.expectGET(dictionaryUrl + '/dictionary/field/v1/id/someId').respond(200, {
        id: 'someId',
        foo: 'bar',
      });
      this.ContextFieldsService.createAndGetField({
        id: 'someId',
      }).then(function (field) {
        expect(field.id).toBe('someId');
        expect(field.foo).toBe('bar');
      }).catch(fail);
      this.$httpBackend.flush();
    });

    it('should reject if error occurs', function () {
      this.$httpBackend.expectPOST(dictionaryUrl + '/dictionary/field/v1').respond(400, 'some error');
      this.ContextFieldsService.createAndGetField({
        id: 'someId',
      }).then(function () {
        fail('ContextFieldsService.createAndGetField should have rejected');
      }).catch(function (errorResponse) {
        expect(errorResponse.data).toBe('some error');
        expect(errorResponse.status).toBe(400);
      });
      this.$httpBackend.flush();
    });
  });
});
