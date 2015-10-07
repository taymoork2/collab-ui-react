'use strict';

describe('Service: RouterCompanyNumber', function () {
  var RouterCompanyNumber, $httpBackend, HuronConfig, companyNumber, data, ServiceSetup;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_RouterCompanyNumber_, _ServiceSetup_, _$httpBackend_, _HuronConfig_) {
    RouterCompanyNumber = _RouterCompanyNumber_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    ServiceSetup = _ServiceSetup_;
    companyNumber = getJSONFixture('huron/json/lineSettings/companyNumber.json');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('loadExternalNumberPool', function () {
    var extNumPool = [{
      uuid: '777-888-666',
      pattern: '+11234567890'
    }];

    beforeEach(function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&order=pattern').respond(extNumPool);
    });

    it('should list external number pool', function () {
      ServiceSetup.loadExternalNumberPool();
      $httpBackend.flush();

      expect(angular.equals(ServiceSetup.externalNumberPool, extNumPool)).toBe(true);
    });
  });

  describe('listCompanyNumbers', function () {
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers').respond(companyNumber);
    });

    it('should list Company Numbers', function () {
      RouterCompanyNumber.listCompanyNumbers().then(function (response) {
        expect(response.length).toEqual(3);
      });
      $httpBackend.flush();
    });
  });

  describe('saveCompanyNumber', function () {
    beforeEach(function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers').respond(201);
    });

    it('should save Company Number', function () {
      RouterCompanyNumber.saveCompanyNumber();
      $httpBackend.flush();
    });
  });

  describe('deleteCompanyNumber', function () {
    var companyNumber = {
      uuid: '5550f6e1-c1f5-493f-b9fd-666480cb0adf'
    };

    beforeEach(function () {
      $httpBackend.expectDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers/' + companyNumber.uuid).respond(204);
    });

    it('should delete the Company Number', function () {
      RouterCompanyNumber.deleteCompanyNumber(data, companyNumber.uuid);
      $httpBackend.flush();
    });
  });

  describe('updateCompanyNumber', function () {
    var companyNumber = {
      uuid: '5550f6e1-c1f5-493f-b9fd-666480cb0adf'
    };

    beforeEach(function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers').respond(201);
    });

    it('should save Company Number', function () {
      RouterCompanyNumber.updateCompanyNumber(companyNumber);
      $httpBackend.flush();
    });
  });

});
