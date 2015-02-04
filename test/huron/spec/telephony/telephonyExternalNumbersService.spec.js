'use strict';

describe('Service: ExternalNumberPool', function () {
  var $httpBackend, ExternalNumberPool, HuronConfig;
  var didList = ['+9999999999', '+8888888888', '+7777777777', '+6666666666', '+5555555555'];

  beforeEach(module('ui.router'));
  beforeEach(module('Huron'));
  beforeEach(module('ngResource'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(
    inject(
      function (_$httpBackend_, $resource, _ExternalNumberPool_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        ExternalNumberPool = _ExternalNumberPool_;
        HuronConfig = _HuronConfig_;
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(ExternalNumberPool).toBeDefined;
  });

  describe('create function', function () {
    it('should exist', function () {
      expect(ExternalNumberPool.create).toBeDefined;
    });

    it('should create 5 DIDs', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(201);
      ExternalNumberPool.create(didList).then(function(results) {
        expect(results.successes.length).toEqual(5);
      });
      $httpBackend.flush();
    });

    it('should fail to create 5 DIDs', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(500);
      ExternalNumberPool.create(didList).then(function(results) {
        expect(results.failures.length).toEqual(5);
      });
      $httpBackend.flush();
    });
  });

  describe('remove function', function () {
    it('should exist', function () {
      expect(ExternalNumberPool.remove).toBeDefined;
    });

    it('should remove DID', function () {
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/1').respond(204);
      ExternalNumberPool.deletePool('1').then(function(result) {

      });
      $httpBackend.flush();
    });
  });

  describe('removeAll function', function () {
    it('should exist', function () {
      expect(ExternalNumberPool.removeAll).toBeDefined;
    });

    it('should remove all DIDs', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(200, getJSONFixture('huron/json/externalNumbers/externalNumbers.json'));
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/3f51ef5b-584f-42db-9ad8-8810b5e9e9e3').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/0bd715e8-ddaf-4096-9be2-e6cbcdd12f74').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/45973447-eab3-480f-9d33-26e41616b97c').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/f74e8480-d913-4879-a4e8-bb17602c99fc').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/93e2f24e-bf2c-4410-a0fc-1c0e5a88459b').respond(204);
      ExternalNumberPool.deleteAll().then(function(results) {
        expect(results.length).toEqual(5);
      });
      $httpBackend.flush();
    });

    it('should remove all DIDs and handle an error', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(200, getJSONFixture('huron/json/externalNumbers/externalNumbers.json'));
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/3f51ef5b-584f-42db-9ad8-8810b5e9e9e3').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/0bd715e8-ddaf-4096-9be2-e6cbcdd12f74').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/45973447-eab3-480f-9d33-26e41616b97c').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/f74e8480-d913-4879-a4e8-bb17602c99fc').respond(500);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/93e2f24e-bf2c-4410-a0fc-1c0e5a88459b').respond(404);
      ExternalNumberPool.deleteAll().then(function(results) {
        expect(results.length).toEqual(5);
      });
      $httpBackend.flush();
    });
  });

});