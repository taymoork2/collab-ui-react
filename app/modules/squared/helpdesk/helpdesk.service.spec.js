'use strict';
describe('HelpdeskService', function () {
  beforeEach(angular.mock.module('Squared'));

  var $timeout, $httpBackend, Service, urlBase, ServiceDescriptor, $scope, q, HelpdeskMockData, CsdmConverter, HelpdeskHttpRequestCanceller;

  beforeEach(inject(function (_$timeout_, UrlConfig, _$rootScope_, _$httpBackend_, _HelpdeskService_, _ServiceDescriptor_, _$q_, _HelpdeskMockData_, _CsdmConverter_, _HelpdeskHttpRequestCanceller_) {
    Service = _HelpdeskService_;
    ServiceDescriptor = _ServiceDescriptor_;
    HelpdeskHttpRequestCanceller = _HelpdeskHttpRequestCanceller_;
    $scope = _$rootScope_.$new();
    q = _$q_;
    $timeout = _$timeout_;
    urlBase = UrlConfig.getAdminServiceUrl();
    HelpdeskMockData = _HelpdeskMockData_;
    CsdmConverter = _CsdmConverter_;

    $httpBackend = _$httpBackend_;
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

  it('resolves org displayname for user', function () {
    var orgSearchResponseMock = {
      "items": [{
        "id": "2222",
        "displayName": "Bill Gates Foundation"
      }]
    };

    var userSearchResult = [{
      "active": true,
      "id": "1111",
      "organization": {
        id: "2222"
      },
      "userName": "bill.gates",
      "displayName": "Bill Gates"
    }];

    $httpBackend
      .when('GET', urlBase + 'helpdesk/search/organizations?phrase=2222&limit=1')
      .respond(orgSearchResponseMock);

    expect(userSearchResult[0].organization.displayName).toBeFalsy();

    Service.findAndResolveOrgsForUserResults(userSearchResult, null, 10);

    $httpBackend.flush();

    expect(userSearchResult[0].organization.displayName).toEqual("Bill Gates Foundation");

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('user search times out', function () {

    var orgSearchResponseMock = {
      "items": [{
        "id": "2222",
        "displayName": "Bill Gates Foundation"
      }]
    };

    var userSearchResult = [{
      "active": true,
      "id": "1111",
      "organization": {
        id: "2222"
      },
      "userName": "bill.gates",
      "displayName": "Bill Gates"
    }];

    $httpBackend
      .when('GET', urlBase + 'helpdesk/search/users?phrase=whatever&limit=30&orgId=1111')
      .respond(orgSearchResponseMock);

    var result;
    var error;

    var x = Service.searchUsers("whatever", "1111", 30, null, null).then(function (res) {
      result = res;
    }).catch(function (err) {
      error = err;
    });

    $timeout.flush();

    $timeout.verifyNoPendingTasks();

    expect(error.cancelled).toBeFalsy();
    expect(error.timedout).toBeTruthy();

  });

  it('user search cancelled', function () {

    var orgSearchResponseMock = {
      "items": [{
        "id": "2222",
        "displayName": "Bill Gates Foundation"
      }]
    };

    var userSearchResult = [{
      "active": true,
      "id": "1111",
      "organization": {
        id: "2222"
      },
      "userName": "bill.gates",
      "displayName": "Bill Gates"
    }];

    $httpBackend
      .when('GET', urlBase + 'helpdesk/search/users?phrase=whatever&limit=30&orgId=1111')
      .respond(orgSearchResponseMock);

    var result;
    var error;

    var x = Service.searchUsers("whatever", "1111", 30, null, null).then(function (res) {
      result = res;
    }).catch(function (err) {
      error = err;
    });

    $scope.$apply();
    var cancelled = false;
    HelpdeskHttpRequestCanceller.cancelAll().then(function () {
      cancelled = true;
    });

    $timeout.flush();

    expect(cancelled).toBeTruthy();

    expect(error.cancelled).toBeTruthy();
    expect(error.timedout).toBeFalsy();

  });

  it("get list of hybrid services relevant services in an org", function () {
    var serviceDescriptionsMock = [{
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-not-fusion"
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-uc"
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-cal"
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-fusion-mgmt"
    }, {
      "acknowledged": false,
      "emailSubscribers": "",
      "enabled": false,
      "id": "squared-a-cool-service"
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
    expect(result.length).toBe(3);
    expect(result[0].id).toEqual("squared-fusion-uc");
    expect(result[1].id).toEqual("squared-fusion-cal");
    expect(result[2].id).toEqual("squared-fusion-mgmt");
  });

  it('finds cloudberry devices by display name', function () {
    var result = Service.filterDevices('Testing DR', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('94b3e13c-b1dd-5e2a-9b64-e3ca02de51d3');
    expect(result[0].displayName).toEqual('Testing DR');

    result = Service.filterDevices('test', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(2);
    expect(result[0].id).toEqual('94b3e13c-b1dd-5e2a-9b64-e3ca02de51d3');
    expect(result[0].displayName).toEqual('Testing DR');
    expect(result[1].id).toEqual('7cdf6cbe-6f84-5338-9064-87a20ec6f9c8');
    expect(result[1].displayName).toEqual('schnappi test');

    result = Service.filterDevices('balle', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(0);
  });

  it('finds cloudberry devices by serial', function () {
    var result = Service.filterDevices('FTT1927036B', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('c1641e38-4782-52ad-8953-e3e3f3aee5c0');
    expect(result[0].displayName).toEqual('Ellie');

    result = Service.filterDevices('FTT', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 10);
    expect(result.length).toBe(6);
  });

  it('finds cloudberry devices by MAC address', function () {
    // E8:ED:F3:B5:DB:8F should match when removing ':' or using any of '.','-' or no separator
    var result = Service.filterDevices('E8:ED:F3:B5:DB:8F', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('56c6a1f4-1e9d-50fc-b560-21496452ba72');
    expect(result[0].displayName).toEqual('manyhus-sx20');

    result = Service.filterDevices('E8EDF3B5DB8F', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('56c6a1f4-1e9d-50fc-b560-21496452ba72');

    result = Service.filterDevices('E8-ED-F3-B5-DB-8F', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('56c6a1f4-1e9d-50fc-b560-21496452ba72');

    result = Service.filterDevices('E8.ED.F3.B5.DB.8F', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('56c6a1f4-1e9d-50fc-b560-21496452ba72');

    result = Service.filterDevices('DC:EB', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 10);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('7cdf6cbe-6f84-5338-9064-87a20ec6f9c8');
    expect(result[0].displayName).toEqual('schnappi test');

    result = Service.filterDevices('DCEB', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 10);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('7cdf6cbe-6f84-5338-9064-87a20ec6f9c8');
  });

  it('finds cloudberry devices by cisUuid', function () {
    var result = Service.filterDevices('f50d76ed-b6d3-49fb-9b40-8cf4d993b7f6', CsdmConverter.convertCloudberryDevices(HelpdeskMockData.devices), 5);
    expect(result.length).toBe(1);
    expect(result[0].id).toEqual('94b3e13c-b1dd-5e2a-9b64-e3ca02de51d3');
    expect(result[0].displayName).toEqual('Testing DR');
  });
});
