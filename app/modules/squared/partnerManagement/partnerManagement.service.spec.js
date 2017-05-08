'use strict';

describe('PartnerManagementService:', function () {
  var svc;
  var UrlConfig;
  var $httpBackend;
  var $sanitize;

  var email = 'test@cisco.com';
  var org = 'test_org';

  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$httpBackend_, _$sanitize_, _PartnerManagementService_, _UrlConfig_) {
    svc = _PartnerManagementService_;
    UrlConfig = _UrlConfig_;
    $httpBackend = _$httpBackend_;
    $sanitize = _$sanitize_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should confirm search is making proper GET', function () {
    $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() +
      'organizations/search?emailAddress=' + encodeURIComponent(email)).respond(200);
    svc.search(email);
    $httpBackend.flush();
  });

  it('should confirm create is making proper POST', function () {
    var data = {
      name: org,
      email: email,
      partnerType: 'DISTI',
      isLifeCyclePartner: true,
    };

    var postedData = {
      'partnerOrgName': data.name,
      'partnerAdminEmail': data.email,
      'partnerType': data.partnerType.value,
      'isPartner': true,
      'isLifecyclePartner': ((data.lifeCyclePartner === true) ? 'true' : 'false'),
    };

    $httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'partners',
      postedData).respond(200);
    svc.create(data);
    $httpBackend.flush();
  });

  it('should confirm getOrgDetails is making proper GET', function () {
    $httpBackend.expectGET(UrlConfig.getAdminServiceUrl() +
        'organizations/' + $sanitize(org) + '/onboardinfo').respond(200);
    svc.getOrgDetails(org);
    $httpBackend.flush();
  });
});
