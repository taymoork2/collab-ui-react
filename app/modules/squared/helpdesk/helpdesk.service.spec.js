'use strict';

describe('HelpdeskService', function () {
  beforeEach(angular.mock.module('Squared'));

  var $timeout, $httpBackend, Service, urlBase, ServiceDescriptorService, $scope, $q, HelpdeskMockData,
    CsdmConverter, HelpdeskHttpRequestCanceller, FeatureToggleService, CacheFactory;

  afterEach(function () {
    $timeout = $httpBackend = Service = urlBase = ServiceDescriptorService = $scope = $q = HelpdeskMockData =
      CsdmConverter = HelpdeskHttpRequestCanceller = FeatureToggleService = CacheFactory = undefined;
  });

  beforeEach(inject(function (_$timeout_, UrlConfig, _$rootScope_, _$httpBackend_, _HelpdeskService_, _ServiceDescriptorService_, _$q_, _HelpdeskMockData_, _CsdmConverter_, _HelpdeskHttpRequestCanceller_, _FeatureToggleService_, _CacheFactory_) {
    Service = _HelpdeskService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
    HelpdeskHttpRequestCanceller = _HelpdeskHttpRequestCanceller_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    $timeout = _$timeout_;
    urlBase = UrlConfig.getAdminServiceUrl();
    HelpdeskMockData = _HelpdeskMockData_;
    CsdmConverter = _CsdmConverter_;
    FeatureToggleService = _FeatureToggleService_;
    CacheFactory = _CacheFactory_;

    $httpBackend = _$httpBackend_;
  }));

  it('searching orgs', function () {
    var orgResponseMock = {
      id: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
      displayName: 'Marvel Partners',
      meta: {
        created: '2015-04-03T00:06:14.681Z',
        uri: 'https://identity.webex.com/organization/scim/v1/Orgs/ce8d17f8-1734-4a54-8510-fae65acc505e',
      },
      zone: 'AllZone',
      ssoEnabled: false,
      dirsyncEnabled: false,
      schemas: ['urn:cisco:codev:identity:organization:core:1.0'],
      services: [
        'squared-call-initiation',
        'atlas-portal',
        'spark',
        'squared-fusion-uc',
        'squared-syncup',
        'cloudmeetings',
        'webex-squared',
        'ciscouc',
      ],
      selfSubscribeServices: ['squared-call-initiation', 'squared-syncup', 'cloudMeetings', 'webex-squared'],
      manages: [{
        orgId: 'aed98e0f-485b-46b5-8623-ed48bab2f882',
        roles: ['id_full_admin'],
      }, {
        orgId: '192e66a3-3f63-45a2-a0a3-e2c5f1a97396',
        roles: ['id_full_admin'],
      }, {
        orgId: 'bc1d8493-69a7-4ba7-a0c0-62abf1b57ac6',
        roles: ['id_full_admin'],
      }],
      isPartner: false,
      delegatedAdministration: true,
      isTestOrg: true,
      orgSettings: [],
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
      items: [{
        id: '2222',
        displayName: 'Bill Gates Foundation',
      }],
    };

    var userSearchResult = [{
      active: true,
      id: '1111',
      organization: {
        id: '2222',
      },
      userName: 'bill.gates',
      displayName: 'Bill Gates',
    }];

    $httpBackend
      .when('GET', urlBase + 'helpdesk/search/organizations?phrase=2222&limit=1')
      .respond(orgSearchResponseMock);

    expect(userSearchResult[0].organization.displayName).toBeFalsy();

    Service.findAndResolveOrgsForUserResults(userSearchResult, null, 10);

    $httpBackend.flush();

    expect(userSearchResult[0].organization.displayName).toEqual('Bill Gates Foundation');

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('user search times out', function () {
    var orgSearchResponseMock = {
      items: [{
        id: '2222',
        displayName: 'Bill Gates Foundation',
      }],
    };

    $httpBackend
      .when('GET', urlBase + 'helpdesk/search/users?phrase=whatever&limit=30&orgId=1111')
      .respond(orgSearchResponseMock);

    var error;

    Service.searchUsers('whatever', '1111', 30, null, null).then(function () { }).catch(function (err) {
      error = err;
    });

    $timeout.flush();

    $timeout.verifyNoPendingTasks();

    expect(error.cancelled).toBeFalsy();
    expect(error.timedout).toBeTruthy();
  });

  it('user search cancelled', function () {
    var orgSearchResponseMock = {
      items: [{
        id: '2222',
        displayName: 'Bill Gates Foundation',
      }],
    };


    $httpBackend
      .when('GET', urlBase + 'helpdesk/search/users?phrase=whatever&limit=30&orgId=1111')
      .respond(orgSearchResponseMock);

    var error;

    Service.searchUsers('whatever', '1111', 30, null, null).then(function () { }).catch(function (err) {
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

  it('get list of hybrid services relevant services in an org', function () {
    var serviceDescriptionsMock = [{
      emailSubscribers: '',
      enabled: false,
      id: 'squared-not-fusion',
    }, {
      emailSubscribers: '',
      enabled: false,
      id: 'squared-fusion-uc',
    }, {
      emailSubscribers: '',
      enabled: false,
      id: 'squared-fusion-cal',
    }, {
      emailSubscribers: '',
      enabled: false,
      id: 'squared-fusion-mgmt',
    }, {
      emailSubscribers: '',
      enabled: false,
      id: 'squared-a-cool-service',
    }];

    spyOn(ServiceDescriptorService, 'getServices');
    var deferred = $q.defer();
    deferred.resolve(serviceDescriptionsMock);
    ServiceDescriptorService.getServices.and.returnValue(deferred.promise);

    var result;
    Service.getHybridServices('1234').then(function (res) {
      result = res;
    });

    $scope.$apply();
    expect(result.length).toBe(3);
    expect(result[0].id).toEqual('squared-fusion-uc');
    expect(result[1].id).toEqual('squared-fusion-cal');
    expect(result[2].id).toEqual('squared-fusion-mgmt');
  });

  describe('getOrgDisplayName', function () {
    beforeEach(function () {
      CacheFactory.get('helpdeskOrgDisplayNameCache').removeAll();
    });

    it('should return displayName when valid result returned', function () {
      $httpBackend
        .expect('GET', urlBase + 'helpdesk/search/organizations?phrase=testOrgId&limit=1')
        .respond(200, { items: [{ displayName: 'test', id: 'testOrgId' }] });

      Service.getOrgDisplayName('testOrgId')
        .then(function (displayName) {
          expect(displayName).toEqual('test');
        })
        .catch(function () {
          expect('rejected promise').toBeFalsy();
        });
      $httpBackend.flush();
    });

    it('should reject promise when response.items is not an array', function () {
      $httpBackend
        .expectGET(urlBase + 'helpdesk/search/organizations?phrase=testOrgId&limit=1')
        .respond(200, { items: 'this is not an array' });

      var caughtError = false;
      Service.getOrgDisplayName('testOrgId')
        .catch(function () {
          caughtError = true;
        })
        .finally(function () {
          expect(caughtError).toBeTruthy();
        });
      $httpBackend.flush();
    });

    it('should reject promise when response.items is an empty array', function () {
      $httpBackend
        .expectGET(urlBase + 'helpdesk/search/organizations?phrase=testOrgId&limit=1')
        .respond(200, { items: [] });

      var caughtError = false;
      Service.getOrgDisplayName('testOrgId')
        .catch(function () {
          caughtError = true;
        })
        .finally(function () {
          expect(caughtError).toBeTruthy();
        });
      $httpBackend.flush();
    });

    it('should reject promise when response.items does not contain displayName', function () {
      $httpBackend
        .expectGET(urlBase + 'helpdesk/search/organizations?phrase=testOrgId&limit=1')
        .respond(200, { items: [{ noName: 'test', id: 'testOrgId' }] });

      var caughtError = false;
      Service.getOrgDisplayName('testOrgId')
        .catch(function () {
          caughtError = true;
        })
        .finally(function () {
          expect(caughtError).toBeTruthy();
        });
      $httpBackend.flush();
    });

    it('should reject promise on HTTP error', function () {
      $httpBackend
        .expectGET(urlBase + 'helpdesk/search/organizations?phrase=testOrgId&limit=1')
        .respond(503, 'ignoreme');

      var caughtError = false;
      Service.getOrgDisplayName('testOrgId')
        .catch(function (result) {
          expect(result.status).toEqual(503);
          caughtError = true;
        })
        .finally(function () {
          expect(caughtError).toBeTruthy();
        });
      $httpBackend.flush();
    });
  });

  describe('search orders', function () {
    it('should filter orders matching allowable order tools', function () {
      var orders = [
        { orderingTool: 'CCW' },
        { orderingTool: 'CCW-CSB' },
        { orderingTool: 'CCW-CDC' },
        { orderingTool: 'foo' },
      ];
      var result = Service.filterOrders(orders);

      expect(result.length).toBe(3);
    });
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

  it('isSparkOnlineUser: detects when userData reflects that the user is a Spark Online user', function () {
    var result = Service.isSparkOnlineUser({});
    expect(result).toBe(false);

    result = Service.isSparkOnlineUser({ onlineOrderIds: null });
    expect(result).toBe(false);

    result = Service.isSparkOnlineUser({ onlineOrderIds: [] });
    expect(result).toBe(false);

    result = Service.isSparkOnlineUser({ onlineOrderIds: ['fake-onlineOrderId-0'] });
    expect(result).toBe(true);
  });

  it('getInviteResendUrl: returns an appropriate url depending on the userData provided', function () {
    var result = Service.getInviteResendUrl({ onlineOrderIds: ['fake-onlineOrderId-0'] });
    expect(result).toContain('helpdesk/actions/resendonlineorderactivation/invoke');

    result = Service.getInviteResendUrl();
    expect(result).toContain('helpdesk/actions/resendinvitation/invoke');
  });

  it('getInviteResendPayload: returns an appropriate object depending on the userData provided', function () {
    var result = Service.getInviteResendPayload({
      displayName: 'fake-displayName',
      email: 'fake-email',
    });
    expect(result).toEqual({
      inviteList: [{
        displayName: 'fake-displayName',
        email: 'fake-email',
      }],
    });

    result = Service.getInviteResendPayload({
      displayName: 'fake-displayName',
      email: 'fake-email',
      onlineOrderIds: ['fake-onlineOrderId-0'],
    });
    expect(result).toEqual({
      onlineOrderIds: ['fake-onlineOrderId-0'],
    });
  });

  it('invokeInviteEmail: invokes helper methods to determine where and what to POST', function () {
    var fakeUserData = {
      displayName: 'fake-displayName',
      email: 'fake-email',
      onlineOrderIds: ['fake-onlineOrderId-0'],
    };

    spyOn(Service, 'getInviteResendUrl').and.callThrough();
    spyOn(Service, 'getInviteResendPayload').and.callThrough();
    $httpBackend
      .expectPOST(/helpdesk\/actions\/resend.*\/invoke/).respond(200);

    Service.invokeInviteEmail(fakeUserData);
    $httpBackend.flush();

    expect(Service.getInviteResendUrl.calls.count()).toBe(1);
    expect(Service.getInviteResendUrl).toHaveBeenCalledWith(fakeUserData);
    expect(Service.getInviteResendPayload.calls.count()).toBe(1);
    expect(Service.getInviteResendPayload).toHaveBeenCalledWith(fakeUserData);

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getLatestEmailEvent:', function () {
    it('calls through to getEmailStatus()', function () {
      spyOn(Service, 'getEmailStatus').and.returnValue($q.resolve());
      Service.getLatestEmailEvent('fake-email@example.com');
      expect(Service.getEmailStatus.calls.count()).toBe(1);
      expect(Service.getEmailStatus).toHaveBeenCalledWith('fake-email@example.com');
    });

    it('should return the first item of the resolved promise\'s list', function () {
      spyOn(Service, 'getEmailStatus').and.returnValue($q.resolve([{ fake: 'data' }]));
      Service.getLatestEmailEvent('fake-email@example.com').then(function (latestEvent) {
        expect(latestEvent).toEqual({ fake: 'data' });
      });
      $scope.$apply();
    });
  });

  describe('getting the CSM link:', function () {
    beforeEach(installPromiseMatchers);
    it('fetches and encodes the CSM link', function () {
      $httpBackend
        .expectGET(urlBase + 'ordersetup/12345/csmlink').respond('https://local.ciscospark.com/#/order-setup?CSM&email=phtest77+mockorgOrderAdmin@gmail.com&orgId=abc&enc=def');
      var promise = Service.getOrderProcessingUrl('12345');
      $httpBackend.flush();
      expect(promise).toBeResolvedWith('https://local.ciscospark.com/#/order-setup?CSM&email=phtest77%2BmockorgOrderAdmin%40gmail.com&orgId=abc&enc=def');
    });
  });

  describe('unixTimestampToUTC:', function () {
    it('should print UTC formatted date time given a Unix timestamp in seconds', function () {
      var timestampInSec = 1482652800;
      expect(Service.unixTimestampToUTC(timestampInSec)).toBe('Sun, 25 Dec 2016 08:00:00 GMT');

      timestampInSec = 1480966041.160986;
      expect(Service.unixTimestampToUTC(timestampInSec)).toBe('Mon, 05 Dec 2016 19:27:21 GMT');
    });
  });

  describe('resendInviteEmail:', function () {
    var fakeUserData;

    afterEach(function () {
      fakeUserData = undefined;
    });

    beforeEach(function () {
      fakeUserData = {
        displayName: 'fake-displayName',
        email: 'fake-email',
        onlineOrderIds: ['fake-onlineOrderId-0'],
      };

      spyOn(Service, 'invokeInviteEmail');
    });

    it('always checks the feature-toggle FeatureToggleService.features.atlasEmailStatus', function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));

      Service.resendInviteEmail(fakeUserData);
      $scope.$apply();

      expect(FeatureToggleService.supports.calls.count()).toBe(1);
      expect(FeatureToggleService.supports).toHaveBeenCalledWith(FeatureToggleService.features.atlasEmailStatus);
    });

    it('when feature-toggle disabled: simply calls invokeInviteEmail', function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));

      Service.resendInviteEmail(fakeUserData);
      $scope.$apply();

      expect(Service.invokeInviteEmail.calls.count()).toBe(1);
      expect(Service.invokeInviteEmail).toHaveBeenCalledWith(fakeUserData);
    });

    it('when feature-toggle enabled: checks isEmailBlocked and does a delete before calling invokeInviteEmail', function () {
      spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
      spyOn(Service, 'isEmailBlocked').and.returnValue($q.resolve());

      $httpBackend
        .expectDELETE(/email\/bounces\?email=/).respond(200);

      Service.resendInviteEmail(fakeUserData);
      $httpBackend.flush();

      expect(Service.isEmailBlocked.calls.count()).toBe(1);
      expect(Service.isEmailBlocked).toHaveBeenCalledWith(fakeUserData.email);
      expect(Service.invokeInviteEmail.calls.count()).toBe(1);
      expect(Service.invokeInviteEmail).toHaveBeenCalledWith(fakeUserData);
    });
  });
});
