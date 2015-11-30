'use strict';
describe('HelpdeskService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, Service, urlBase, ServiceDescriptor, $scope, q;

  beforeEach(inject(function (_Config_, _$rootScope_, _$httpBackend_, _HelpdeskService_, _ServiceDescriptor_, _$q_) {
    Service = _HelpdeskService_;
    ServiceDescriptor = _ServiceDescriptor_;
    $scope = _$rootScope_.$new();
    q = _$q_;
    urlBase = _Config_.getAdminServiceUrl();

    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  it('searching orgs', function () {

    var orgResponseMock = {
      "id": "ce8d17f8-1734-4a54-8510-fae65acc505e",
      "displayName": "Marvel Partners",
      "meta": {
        "created": "2015-04-03T00:06:14.681Z",
        "uri": "https://identity.webex.com/organization/scim/v1/Orgs/ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "zone": "AllZone",
      "ssoEnabled": false,
      "dirsyncEnabled": false,
      "schemas": ["urn:cisco:codev:identity:organization:core:1.0"],
      "services": [
        "squared-call-initiation",
        "atlas-portal",
        "spark",
        "squared-fusion-uc",
        "squared-syncup",
        "cloudmeetings",
        "webex-squared",
        "ciscouc"
      ],
      "selfSubscribeServices": ["squared-call-initiation", "squared-syncup", "cloudMeetings", "webex-squared"],
      "manages": [{
        "orgId": "aed98e0f-485b-46b5-8623-ed48bab2f882",
        "roles": ["id_full_admin"]
      }, {
        "orgId": "192e66a3-3f63-45a2-a0a3-e2c5f1a97396",
        "roles": ["id_full_admin"]
      }, {
        "orgId": "bc1d8493-69a7-4ba7-a0c0-62abf1b57ac6",
        "roles": ["id_full_admin"]
      }],
      "isPartner": false,
      "delegatedAdministration": true,
      "isTestOrg": true,
      "orgSettings": []
    };

    $httpBackend
      .when('GET', urlBase + 'helpdesk/organizations/1234')
      .respond(orgResponseMock);

    Service.getOrg('1234').then(function (res) {
      expect(res.isTestOrg).toBe(true);
    });

    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it("list hybrid services", function () {
    var serviceDescriptionsMock = [{
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-uc",
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-cal",
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-mgmt",
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-irrelevant",
    }];

    sinon.stub(ServiceDescriptor, 'servicesInOrg');
    var deferred = q.defer();
    deferred.resolve(serviceDescriptionsMock);
    ServiceDescriptor.servicesInOrg.returns(deferred.promise);

    var result;
    Service.getHybridServices("1234").then(function (res) {
      result = res;
    });

    $scope.$apply();
    expect(result[0].id).toEqual("squared-fusion-uc");
    expect(result[1].id).toEqual("squared-fusion-cal");
    expect(result[2].id).toEqual("squared-fusion-mgmt");
  });

});
