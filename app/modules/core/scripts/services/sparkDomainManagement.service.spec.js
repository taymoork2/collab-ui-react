'use strict';

describe('SparkDomainManagementService: Service', function () {
  beforeEach(module('Core'));

  var authInfo = {
    getOrgId: sinon.stub().returns('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  var $httpBackend, Auth, Authinfo, Config, SparkDomainManagementService, $q;
  var sparkDomainRegex = /.*\/settings\/domain\.*/;

  beforeEach(inject(function (_$q_, _$httpBackend_, _Config_, _SparkDomainManagementService_) {
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    SparkDomainManagementService = _SparkDomainManagementService_;
    $q = _$q_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should verify that a domain is passed for checkAvailability and addSipUriDomain calls', function () {
    SparkDomainManagementService.checkDomainAvailability().catch(function (data) {
      expect(data).toBe('A Sip Uri Domain input value must be entered');
    });

    SparkDomainManagementService.addSipUriDomain().catch(function (data) {
      expect(data).toBe('A Sip Uri Domain input value must be entered');
    });
  });

  it('should present that the domain is not available', function () {
    $httpBackend.whenPOST(sparkDomainRegex).respond(function () {
      var data = {
        'isDomainAvailable': false,
        'isDomainReserved': true
      };
      return [200, data];
    });

    SparkDomainManagementService.checkDomainAvailability('amtest2').then(function (response) {
      expect(response.data.isDomainReserved).toBe(true);
      expect(response.data.isDomainAvailable).toBe(false);
    });

    $httpBackend.flush();
  });

  it('should present that the domain is available', function () {
    $httpBackend.whenPOST(sparkDomainRegex).respond(function () {
      var data = {
        'isDomainAvailable': true,
        'isDomainReserved': false
      };
      return [200, data];
    });

    SparkDomainManagementService.checkDomainAvailability('shafiTest3').then(function (response) {
      expect(response.data.isDomainReserved).toBe(false);
      expect(response.data.isDomainAvailable).toBe(true);
    });

    $httpBackend.flush();
  });

  it('should add a Sip Uri Domain', function () {
    $httpBackend.whenPOST(sparkDomainRegex).respond(function () {
      var data = {
        'isDomainAvailable': false,
        'isDomainReserved': true
      };
      return [200, data, {}];
    });

    SparkDomainManagementService.addSipUriDomain('shafiTest3').then(function (response) {
      expect(response.data.isDomainReserved).toBe(true);
      expect(response.data.isDomainAvailable).toBe(false);
    });

    $httpBackend.flush();
  });

});
