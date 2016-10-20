'use strict';

describe('Service: HuronAssignedLine', function () {
  var $httpBackend, HuronConfig, HuronAssignedLine;

  var internalNumbers, directoryNumbersCopy;

  beforeEach(angular.mock.module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _HuronAssignedLine_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    HuronAssignedLine = _HuronAssignedLine_;

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    directoryNumbersCopy = getJSONFixture('huron/json/lineSettings/getDirectoryNumbersCopy.json');

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/copy').respond(directoryNumbersCopy);
    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=').respond(internalNumbers);
    $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/copy/b75952c0-2b37-4b33-a548-2641d7c233a7').respond(201, {}, {
      'location': '123456'
    });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('autoAssignDn', function () {
    it('should assign a new number', function () {
      HuronAssignedLine.assignDirectoryNumber('111-222-333').then(function (response) {
        expect(internalNumbers).toContain({
          pattern: response.pattern,
          uuid: response.uuid
        });
      });
      $httpBackend.flush();
    });

    it('should reject the promise if new number is not available', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=').respond([]);
      HuronAssignedLine.assignDirectoryNumber('111-222-333')
        .then(function (response) {
          expect(response).toBeFalsy();
        }, function (response) {
          expect(response).toEqual('directoryNumberPanel.unassignedNumberError');
        });
      $httpBackend.flush();
    });
  });

  describe('getUnassignedDirectoryNumber', function () {
    it('should return an unassigned number', function () {
      HuronAssignedLine.getUnassignedDirectoryNumber().then(function (response) {
        expect(response).toBeTruthy();
      });
      $httpBackend.flush();
    });

    it('should return undefined if no number available', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=').respond([]);
      HuronAssignedLine.getUnassignedDirectoryNumber().then(function (response) {
        expect(response).toBeUndefined();
      });
      $httpBackend.flush();
    });
  });

});
