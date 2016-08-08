'use strict';

describe('FeatureToggleService', function () {
  beforeEach(angular.mock.module('Core'));

  var httpBackend, $state, Authinfo, FeatureToggleService;
  var userId = '1';
  var getUserMe;
  var getUserFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
  var userRegex = /.*\/locus\/api\/v1\/features\/users\.*/;
  var identityMe = 'https://identity.webex.com/identity/scim/null/v1/Users/me';
  var dirSyncRegex = /.*\/organization\/.*\/dirsync\.*/;

  beforeEach(inject(function (_$httpBackend_, _$state_, _Authinfo_, _FeatureToggleService_) {
    httpBackend = _$httpBackend_;
    $state = _$state_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;

    getUserMe = getJSONFixture('core/json/users/me.json');
    httpBackend.whenGET(identityMe).respond(200, getUserMe);
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
      if (dev.val === 'true') {
        dev.val = true;
      } else if (dev.val === 'false') {
        dev.val = false;
      } else {
        dev.val = dev.val;
      }
      if (ettlmt.val === 'true') {
        ettlmt.val = true;
      } else if (ettlmt.val === 'false') {
        ettlmt.val = false;
      } else {
        ettlmt.val = ettlmt.val;
      }
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

  describe('function stateSupportsFeature', function () {
    beforeEach(function () {
      spyOn($state, 'go');
      spyOn(Authinfo, 'isSquaredUC').and.returnValue(false);
      httpBackend.whenGET(userRegex).respond(200, getUserFeatureToggles);
      installPromiseMatchers();
    });

    it('should resolve successfully if a feature is supported', function () {
      var promise = FeatureToggleService.stateSupportsFeature('android-add-guest-release');
      httpBackend.flush();
      expect(promise).toBeResolvedWith(true);
    });

    it('should reject if a feature is not supported while on a current state', function () {
      $state.$current.name = 'some-state';
      var promise = FeatureToggleService.stateSupportsFeature('non-existant-feature');
      httpBackend.flush();
      expect(promise).toBeRejected();
    });

    it('should redirect to login if a feature is not supported and no current state', function () {
      $state.$current.name = '';
      FeatureToggleService.stateSupportsFeature('non-existant-feature');
      httpBackend.flush();
      expect($state.go).toHaveBeenCalledWith('login');
    });
  });

  describe('function supportsDirSync', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    });

    it('should return true for a DirSync org', function () {
      httpBackend.whenGET(dirSyncRegex).respond(200, {
        serviceMode: 'ENABLED'
      });
      FeatureToggleService.supportsDirSync().then(function (data) {
        expect(data).toBe(true);
      });
      httpBackend.flush();
    });

    it('should return false for a non-DirSync org', function () {
      httpBackend.whenGET(dirSyncRegex).respond(200, {
        serviceMode: 'DISABLED'
      });
      FeatureToggleService.supportsDirSync().then(function (data) {
        expect(data).toBe(false);
      });
      httpBackend.flush();
    });
  });

});
