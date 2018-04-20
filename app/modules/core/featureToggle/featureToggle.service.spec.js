'use strict';

var testModule = require('./index').default;

describe('FeatureToggleService', function () {
  function init() {
    this.initModules(testModule);
    this.injectDependencies('$httpBackend', '$state', 'Authinfo', 'FeatureToggleService');
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    this.userId = '1';
    this.userRegex = /.*\/feature\/api\/v1\/features\/users\.*/;
    this.identityMe = 'https://identity.webex.com/identity/scim/null/v1/Users/me';
    this.huronToggleService = 'https://toggle.huron-int.com/toggle/api/v3/features/customers/export/developer/id';

    this.getUserMe = getJSONFixture('core/json/users/me.json');
    this.$httpBackend.whenGET(this.identityMe).respond(200, this.getUserMe);
    this.$httpBackend.whenGET(this.huronToggleService).respond(200, []);
    this.getUserFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
  }

  ///////////////////////////

  beforeEach(init);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should verify that you have a user id', function () {
    this.FeatureToggleService.getFeaturesForUser().then(fail)
      .catch(function (data) {
        expect(data).toBe('id is undefined');
      });
  });

  it('should verify that you have an org id', function () {
    this.FeatureToggleService.getFeaturesForOrg().then(fail)
      .catch(function (data) {
        expect(data).toBe('id is undefined');
      });
  });

  it('should verify that you have a feature when querying a user id', function () {
    this.FeatureToggleService.getFeatureForUser(this.userId).then(fail)
      .catch(function (data) {
        expect(data).toBe('feature is undefined');
      });
  });

  it('should return a 3 set array when it is queried by a user', function () {
    var _this = this;
    this.$httpBackend.whenGET(this.userRegex).respond(200, this.getUserFeatureToggles);
    this.FeatureToggleService.getFeaturesForUser(this.userId).then(function (data) {
      var dev = _this.getUserFeatureToggles.developer[0];
      var ettlmt = _this.getUserFeatureToggles.entitlement[0];
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
      expect(data.user).toEqual(_this.getUserFeatureToggles.user);
    });
    this.$httpBackend.flush();
  });

  it('should return false for a feature if it wasnt returned for a user', function () {
    this.$httpBackend.whenGET(this.userRegex).respond(200, this.getUserFeatureToggles);
    this.FeatureToggleService.getFeatureForUser(this.userId, 'non-existant-feature').then(function (data) {
      expect(data).toBe(false);
    });
    this.$httpBackend.flush();
  });

  it('should return accurate value for a feature when queried by a user', function () {
    this.$httpBackend.whenGET(this.userRegex).respond(200, this.getUserFeatureToggles);
    this.FeatureToggleService.getFeatureForUser(this.userId, 'android-add-guest-release').then(function (data) {
      expect(data).toBe(true);
    });
    this.$httpBackend.flush();
  });

  it('should return accurate value when GetStatus function is called for a feature', function () {
    this.$httpBackend.whenGET(this.userRegex).respond(200, this.getUserFeatureToggles);
    var careStatus = this.FeatureToggleService.atlasCareTrialsGetStatus();
    careStatus.then(function (result) {
      expect(result).toBe(false);
    });
    var androidAddGuestReleaseStatus = this.FeatureToggleService.androidAddGuestReleaseGetStatus();
    androidAddGuestReleaseStatus.then(function (result) {
      expect(result).toBe(true);
    });
    this.$httpBackend.flush();
  });

  describe('function stateSupportsFeature', function () {
    beforeEach(function () {
      spyOn(this.$state, 'go');
      spyOn(this.Authinfo, 'isSquaredUC').and.returnValue(false);
      this.$httpBackend.whenGET(this.userRegex).respond(200, this.getUserFeatureToggles);
      installPromiseMatchers();
    });

    it('should resolve successfully if a feature is supported', function () {
      var promise = this.FeatureToggleService.stateSupportsFeature('android-add-guest-release');
      this.$httpBackend.flush();
      expect(promise).toBeResolvedWith(true);
    });

    it('should reject if a feature is not supported while on a current state', function () {
      this.$state.$current.name = 'some-state';
      this.FeatureToggleService.stateSupportsFeature('non-existant-feature').then(fail)
        .catch(function (response) {
          expect(response).toBe('Requested feature is not supported by requested state');
        });
      this.$httpBackend.flush();
    });

    it('should redirect to login if a feature is not supported and no current state', function () {
      this.$state.$current.name = '';
      this.FeatureToggleService.stateSupportsFeature('non-existant-feature');
      this.$httpBackend.flush();
      expect(this.$state.go).toHaveBeenCalledWith('login');
    });
  });
});
