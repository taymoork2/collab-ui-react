'use strict';

var testModule = require('./callerIdService');

describe('Service: CallerId', function () {
  beforeEach(angular.mock.module(testModule));

  var CallerId, $httpBackend, HuronConfig, companyNumber;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_CallerId_, _$httpBackend_, _HuronConfig_) {
    CallerId = _CallerId_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    companyNumber = getJSONFixture('huron/json/lineSettings/companyNumber.json');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('listCompanyNumbers', function () {
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/companynumbers').respond(companyNumber);
    });

    it('should list company numbers', function () {
      CallerId.listCompanyNumbers().then(function (response) {
        expect(response.length).toEqual(3);
      });
      $httpBackend.flush();
    });
  });
});
