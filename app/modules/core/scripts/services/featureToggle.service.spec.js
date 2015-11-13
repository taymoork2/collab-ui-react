'use strict';

describe('FeatureToggleService', function () {
  beforeEach(module('Core'));

  var httpBackend, $q, Config, AuthInfo, FeatureToggleService;
  var forOrg = false;
  var forUser = true;
  var userId = '1';
  var orgId = '2';
  var getUserFeatureToggles;

  beforeEach(inject(function (_$httpBackend_, _$q_, _Config_, _Authinfo_, _FeatureToggleService_) {
    httpBackend = _$httpBackend_;
    $q = _$q_;
    Config = _Config_;
    AuthInfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;

    getUserFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');

  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should give you an org url if you are calling an org based fn', function () {
    var orgUrl = FeatureToggleService.getUrl(forOrg, orgId);
    expect(orgUrl).toContain('rules/' + orgId);
  });

  it('should give you an user url if you are calling a user based fn', function () {
    var userUrl = FeatureToggleService.getUrl(forUser, userId);
    expect(userUrl).toContain('users/' + userId);
  });

  it('should verify that you have a user id', function () {
    FeatureToggleService.getFeaturesForUser().then(function (data) {
      expect(data).toBe('userId is undefined');
    });
  });

  it('should verify that you have an org id', function () {
    FeatureToggleService.getFeaturesForOrg().then(function (data) {
      expect(data).toBe('orgId is undefined');
    });
  });

  it('should verify that you have a feature when querying a user id', function () {
    FeatureToggleService.getFeatureForUser(userId).then(function (data) {
      expect(data).toBe('feature is undefined');
    });
  });

  it('should return a 3 set array when it is queried by a user', function () {
    httpBackend.when('GET', FeatureToggleService.getUrl(forUser, userId)).respond(200, getUserFeatureToggles);
    FeatureToggleService.getFeaturesForUser(userId).then(function (data) {
      expect(data.data.developer).toEqual(getUserFeatureToggles.developer);
      expect(data.data.entitlement).toEqual(getUserFeatureToggles.entitlement);
      expect(data.data.user).toEqual(getUserFeatureToggles.user);
    });
    httpBackend.flush();
  });

  it('should return false for a feature if it wasnt returned for a user', function () {
    httpBackend.when('GET', FeatureToggleService.getUrl(forUser, userId)).respond(200, getUserFeatureToggles);
    FeatureToggleService.getFeatureForUser(userId, 'non-existant-feature').then(function (data) {
      expect(data).toBe(false);
    });
    httpBackend.flush();
  });

  it('should return accurate value for a feature when queried by a user', function () {
    httpBackend.when('GET', FeatureToggleService.getUrl(forUser, userId)).respond(200, getUserFeatureToggles);
    FeatureToggleService.getFeatureForUser(userId, 'android-add-guest-release').then(function (data) {
      expect(data).toBe(true);
    });
    httpBackend.flush();
  });

});
