'use strict';

describe('Service: ExternalNumberPool', function () {
  var $httpBackend, ExternalNumberPool, HuronConfig;

  beforeEach(angular.mock.module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(
    inject(
      function (_$httpBackend_, _ExternalNumberPool_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        ExternalNumberPool = _ExternalNumberPool_;
        HuronConfig = _HuronConfig_;
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(ExternalNumberPool).toBeDefined();
  });

  describe('create function', function () {
    it('should exist', function () {
      expect(ExternalNumberPool.create).toBeDefined();
    });

    it('should create a DID', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(201);
      ExternalNumberPool.create('1', '+9999999999');
      $httpBackend.flush();
    });

    it('should fail to create DID', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(500);
      ExternalNumberPool.create('1', '+8888888888');
      $httpBackend.flush();
    });
  });

  describe('deletePool function', function () {
    it('should remove DID', function () {
      $httpBackend.expectDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/1').respond(204);
      ExternalNumberPool.deletePool('1', '1');
      $httpBackend.flush();
    });
  });

  describe('deleteAll function', function () {
    it('should remove all DIDs', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools').respond(200, getJSONFixture('huron/json/externalNumbers/externalNumbers.json'));
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/3f51ef5b-584f-42db-9ad8-8810b5e9e9e3').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/0bd715e8-ddaf-4096-9be2-e6cbcdd12f74').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/45973447-eab3-480f-9d33-26e41616b97c').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/f74e8480-d913-4879-a4e8-bb17602c99fc').respond(204);
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools/93e2f24e-bf2c-4410-a0fc-1c0e5a88459b').respond(204);
      ExternalNumberPool.deleteAll('1').then(function (results) {
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
      ExternalNumberPool.deleteAll('1').then(function (results) {
        expect(results.length).toEqual(5);
      });
      $httpBackend.flush();
    });
  });

  describe('getExternalNumbers function', function () {
    it('should exist', function () {
      expect(ExternalNumberPool.getExternalNumbers).toBeDefined();
    });
    it('should query for all assigned, unassigned, and all types of numbers', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers('customerId1');
      $httpBackend.flush();
    });
    it('should query for all number types matching a pattern', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?order=pattern&pattern=%25%2B15551234567%25').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        '+15551234567');
      $httpBackend.flush();
    });
    it('should query for all numbers when using the NO_PATTERN_MATCHING param', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING);
      $httpBackend.flush();
    });
    it('should query for unassigned numbers of all types when using the NO_PATTERN_MATCHING and UNASSIGNED_NUMBERS params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?directorynumber=&order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.UNASSIGNED_NUMBERS);
      $httpBackend.flush();
    });
    it('should query for all numbers of all types when using the NO_PATTERN_MATCHING and ASSIGNED_AND_UNASSIGNED_NUMBERS params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.ASSIGNED_AND_UNASSIGNED_NUMBERS);
      $httpBackend.flush();
    });
    it('should query for unassigned numbers of all types when using the NO_PATTERN_MATCHING and UNASSIGNED_NUMBERS params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?directorynumber=&order=pattern&pattern=%25%2B15551234567%25').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        '+15551234567',
        ExternalNumberPool.UNASSIGNED_NUMBERS);
      $httpBackend.flush();
    });
    it('should query for all numbers of all types when using the NO_PATTERN_MATCHING and ASSIGNED_AND_UNASSIGNED_NUMBERS params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?order=pattern&pattern=%25%2B15551234567%25').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        '+15551234567',
        ExternalNumberPool.ASSIGNED_AND_UNASSIGNED_NUMBERS);
      $httpBackend.flush();
    });
    it('should query for unassigned numbers of all types when using the NO_PATTERN_MATCHING, UNASSIGNED_NUMBERS, and ALL_EXTERNAL_NUMBER_TYPES params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?directorynumber=&order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.UNASSIGNED_NUMBERS,
        ExternalNumberPool.ALL_EXTERNAL_NUMBER_TYPES);
      $httpBackend.flush();
    });
    it('should query for assigned and unassigned numbers of all number types when using the NO_PATTERN_MATCHING, UNASSIGNED_NUMBERS, and ALL_EXTERNAL_NUMBER_TYPES params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.ASSIGNED_AND_UNASSIGNED_NUMBERS,
        ExternalNumberPool.ALL_EXTERNAL_NUMBER_TYPES);
      $httpBackend.flush();
    });
    it('should query for assigned and unassigned PSTN numbers when using the NO_PATTERN_MATCHING, ASSIGNED_AND_UNASSIGNED_NUMBERS, and FIXED_LINE_OR_MOBILE params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?externalnumbertype=Fixed+Line+or+Mobile&order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.ASSIGNED_AND_UNASSIGNED_NUMBERS,
        ExternalNumberPool.FIXED_LINE_OR_MOBILE);
      $httpBackend.flush();
    });
    it('should query for assigned and unassigned Toll-Free numbers when using the NO_PATTERN_MATCHING, ASSIGNED_AND_UNASSIGNED_NUMBERS, and TOLL_FREE params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?externalnumbertype=Toll+Free&order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.ASSIGNED_AND_UNASSIGNED_NUMBERS,
        ExternalNumberPool.TOLL_FREE);
      $httpBackend.flush();
    });
    it('should query for assigned and unassigned PSTN numbers when using the NO_PATTERN_MATCHING, UNASSIGNED_NUMBERS, and FIXED_LINE_OR_MOBILE params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?directorynumber=&externalnumbertype=Fixed+Line+or+Mobile&order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.UNASSIGNED_NUMBERS,
        ExternalNumberPool.FIXED_LINE_OR_MOBILE);
      $httpBackend.flush();
    });
    it('should query for assigned and unassigned Toll-Free numbers when using the NO_PATTERN_MATCHING, UNASSIGNED_NUMBERS, and TOLL_FREE params', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/customerId1/externalnumberpools?directorynumber=&externalnumbertype=Toll+Free&order=pattern').respond(200);
      ExternalNumberPool.getExternalNumbers(
        'customerId1',
        ExternalNumberPool.NO_PATTERN_MATCHING,
        ExternalNumberPool.UNASSIGNED_NUMBERS,
        ExternalNumberPool.TOLL_FREE);
      $httpBackend.flush();
    });
  });

  describe('queryExternalNumberPools function', function () {
    it('should exist', function () {
      expect(ExternalNumberPool.queryExternalNumberPools).toBeDefined();
    });
  });

});
