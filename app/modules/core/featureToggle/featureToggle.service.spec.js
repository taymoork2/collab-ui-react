'use strict';

describe('FeatureToggleService', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  var httpBackend, $q, Config, AuthInfo, Userservice, FeatureToggleService;
  var forOrg = false;
  var forUser = true;
  var userId = '1';
  var orgId = '2';
  var getUserMe;
  var getUserFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
  var userRegex = /.*\/locus\/api\/v1\/features\/users\.*/;
  var orgRegex = /.*\/features\/rules\.*/;

  beforeEach(inject(function (_$httpBackend_, _$q_, _Config_, _Authinfo_, _Userservice_, _FeatureToggleService_) {
    httpBackend = _$httpBackend_;
    $q = _$q_;
    Config = _Config_;
    AuthInfo = _Authinfo_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;

    getUserMe = getJSONFixture('core/json/users/me.json');

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(getUserMe, 200);
    });
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
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
    httpBackend.whenGET(userRegex).respond(200, getUserFeatureToggles);
    FeatureToggleService.getFeaturesForUser(userId).then(function (data) {
      var dev = getUserFeatureToggles.developer[0];
      var ettlmt = getUserFeatureToggles.entitlement[0];
      dev.val = dev.val === 'true' ? true : dev.val === 'false' ? false : dev.val;
      ettlmt.val = ettlmt.val === 'true' ? true : ettlmt.val === 'false' ? false : ettlmt.val;
      expect(data.developer[0]).toEqual(dev);
      expect(data.entitlement[0]).toEqual(ettlmt);
      expect(data.user).toEqual(getUserFeatureToggles.user);
    });
    httpBackend.flush();
  });

  it('should return false for a feature if it wasnt returned for a user', function () {
    httpBackend.whenGET(userRegex).respond(200, getUserFeatureToggles);
    FeatureToggleService.getFeatureForUser(userId, 'non-existant-feature').then(function (data) {
      expect(data).toBe(false);
    });
    httpBackend.flush();
  });

  it('should return accurate value for a feature when queried by a user', function () {
    httpBackend.whenGET(userRegex).respond(200, getUserFeatureToggles);
    FeatureToggleService.getFeatureForUser(userId, 'android-add-guest-release').then(function (data) {
      expect(data).toBe(true);
    });
    httpBackend.flush();
  });

  it('should return accurate value when GetStatus function is called for a feature', function () {
    httpBackend.whenGET(userRegex).respond(200, getUserFeatureToggles);
    var careStatus = FeatureToggleService.atlasCareTrialsGetStatus();
    careStatus.then(function (result) {
      expect(result).toBe(false);
    });
    var androidAddGuestReleaseStatus = FeatureToggleService.androidAddGuestReleaseGetStatus();
    androidAddGuestReleaseStatus.then(function (result) {
      expect(result).toBe(true);
    });
    httpBackend.flush();
  });

});
