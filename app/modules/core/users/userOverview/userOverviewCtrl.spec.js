'use strict';

var testModule = require('./index').default;

describe('Controller: UserOverviewCtrl', function () {

  function init() {
    this.initModules(testModule, 'WebExApp', 'Sunlight', 'Huron');
    this.injectDependencies('$scope', '$controller', '$q', 'UserOverviewService', 'Utils', 'FeatureToggleService', 'Config', 'Authinfo', 'Userservice', 'UrlConfig', 'Notification');
    initData.apply(this);
    initDependencySpies.apply(this);
    initStateParams.apply(this);
  }

  function initData() {
    this.pristineCurrentUser = angular.copy(getJSONFixture('core/json/currentUser.json'));
    this.updatedUser = _.cloneDeep(this.pristineCurrentUser);
    this.updatedUser.trainSiteNames = ['testSite'];
    this.invitations = getJSONFixture('core/json/users/invitations.json');
    this.featureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
  }

  function initDependencySpies() {
    var _this = this;

    spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.pristineCurrentUser.meta.organizationID);

    this.getUserSpy = spyOn(this.UserOverviewService, 'getUser').and.callFake(function () {
      var getUserResponse = {
        user: _.cloneDeep(_this.updatedUser),
        sqEntitlements: _this.Utils.getSqEntitlements(_this.updatedUser)
      };
      getUserResponse.user.hasEntitlement = function (entitlement) {
        var index = _.findIndex(this.entitlements, function (ent) {
          return ent === entitlement;
        });
        return index > -1;
      };
      return _this.$q.when(getUserResponse);
    });

    spyOn(this.Userservice, 'resendInvitation').and.returnValue(this.$q.when({}));
    spyOn(this.FeatureToggleService, 'getFeatureForUser').and.returnValue(this.$q.when(function () { return true; }));
    spyOn(this.FeatureToggleService, 'getFeaturesForUser').and.returnValue(this.$q.when(function () { return _this.featureToggles; }));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.when(true));
    spyOn(this.FeatureToggleService, 'atlasSMPGetStatus').and.returnValue(this.$q.when(false));
    spyOn(this.Authinfo, 'isCSB').and.returnValue(false);

    spyOn(this.Notification, 'success');
    spyOn(this.Authinfo, 'isSquaredTeamMember').and.returnValue(false);
  }

  function initStateParams() {
    var _this = this;
    this.UserOverviewService.getUser()
      .then(function (response) {
        _this.$stateParams = {
          currentUser: response.user,
          entitlements: response.sqEntitlements
        };
      });
    this.$scope.$apply();
  }

  function initController() {
    this.controller = this.$controller('UserOverviewCtrl', {
      $scope: this.$scope,
      $stateParams: this.$stateParams,
      Config: this.Config,
      Authinfo: this.Authinfo,
      Userservice: this.Userservice,
      FeatureToggleService: this.FeatureToggleService
    });
    this.$scope.$apply();
  }

  beforeEach(init);

  beforeEach(function () {
    // save the original $stateParams so we can ensure it was not changed
    this.orginalStateParams = _.cloneDeep(this.$stateParams);
  });

  afterEach(function () {
    // make sure the controller did NOT modify the $stateParams. If it did, this is a bug!
    expect(this.$stateParams).toEqual(this.orginalStateParams);
  });

  ////////////////////

  describe('init', function () {

    it('should not set features list by default', function () {
      initController.apply(this);
      expect(this.controller.features).toBeUndefined();
    });

    it('should handle an empty response from feature toggles', function () {
      this.Authinfo.isSquaredTeamMember.and.returnValue(true);
      this.FeatureToggleService.getFeaturesForUser.and.returnValue(this.$q.when());

      initController.apply(this);
      expect(this.FeatureToggleService.getFeaturesForUser).toHaveBeenCalled();
      expect(this.Authinfo.isSquaredTeamMember).toHaveBeenCalled();
      expect(this.controller.isSharedMultiPartyEnabled).toBeFalsy();

    });

    it('should not set trainSiteNames list by default', function () {
      initController.apply(this);
      expect(this.controller.trainSiteNames).toBeUndefined();
    });

    it('should set trainSiteNames list when specified', function () {
      this.$stateParams.currentUser.trainSiteNames = ['testSite'];
      initController.apply(this);
      expect(this.controller.currentUser.trainSiteNames).toHaveLength(1);
    });
  });

  describe('Reload User on events', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should reload the user data from identity response and set subTitleCard to title', function () {
      this.updatedUser.title = "Test";
      this.updatedUser.displayName = "Display Name";
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.subTitleCard).toBe("Test");
    });

    it('should reload the user data from identity response and set title with givenName and FamilyName', function () {
      this.updatedUser.name = {
        givenName: "Given Name",
        familyName: "Family Name"
      };
      this.$scope.$broadcast('entitlementsUpdated');
      this.$scope.$digest();
      expect(this.controller.titleCard).toEqual("Given Name Family Name");
    });

    it('should reload the user data from identity response and set subTitleCard to addresses', function () {
      this.updatedUser.addresses.push({
        "locality": "AddressLine1"
      });
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.subTitleCard).toBe(' AddressLine1');

    });
  });

  describe('Handle entitlement changes', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should reload the user data from identity response when user list is updated', function () {
      expect(this.controller.currentUser.entitlements.length).toEqual(2);
      this.updatedUser.entitlements.push('ciscouc');
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity response when entitlements are updated', function () {
      expect(this.controller.currentUser.entitlements.length).toEqual(2);
      this.updatedUser.entitlements.push('ciscouc');
      this.$scope.$broadcast('entitlementsUpdated');
      this.$scope.$digest();
      expect(this.controller.currentUser.entitlements.length).toEqual(3);
    });

    it('should set the title to displayName when user data is updated with displayName', function () {
      this.updatedUser.displayName = "Display Name";
      this.$scope.$broadcast('entitlementsUpdated');
      this.$scope.$digest();
      expect(this.controller.titleCard).toEqual("Display Name");
    });

    it('should reload the user data from identity when user list is updated with cloud-contact-center entitlement', function () {
      expect(this.controller.currentUser.entitlements.length).toEqual(2);
      this.updatedUser.entitlements.push('cloud-contact-center');
      this.$scope.$broadcast('entitlementsUpdated');
      this.$scope.$digest();
      expect(this.controller.currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity when user list is updated with squared-syncup entitlement', function () {
      expect(this.controller.currentUser.entitlements.length).toEqual(2);
      this.updatedUser.entitlements.push('squared-syncup');
      this.$scope.$broadcast('entitlementsUpdated');
      this.$scope.$digest();
      expect(this.controller.currentUser.entitlements.length).toEqual(3);
    });

    it('should reload user data from identity response when squared-syncup licenseID is updated', function () {
      this.updatedUser.entitlements.push('squared-syncup');
      this.updatedUser.licenseID.push('CF_xyz');
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when contact center licenseID is updated', function () {
      this.updatedUser.entitlements.push('cloud-contact-center');
      this.updatedUser.licenseID.push('CC_xyz');
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when communication licenseID is updated', function () {
      this.updatedUser.licenseID.push('CO_xyz');
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when messaging licenseID is updated', function () {
      this.updatedUser.licenseID.push('MS_xyz');
      this.$scope.$broadcast('USER_LIST_UPDATED');
      this.$scope.$digest();
      expect(this.controller.currentUser.licenseID.length).toEqual(1);
    });

  });

  describe('AuthCodeLink', function () {

    beforeEach(function () {
      initController.apply(this);
    });

    it('should set showGenerateOtpLink to true when addGenerateAuthCodeLink method is called on controller', function () {
      this.controller.enableAuthCodeLink();
      expect(this.controller.showGenerateOtpLink).toBeTruthy();
    });

    it('should set showGenerateOtpLink to false when disableAuthCodeLink method is called on controller', function () {
      this.controller.disableAuthCodeLink();
      expect(this.controller.showGenerateOtpLink).toBeFalsy();
    });

  });

  describe('resendInvitation', function () {
    beforeEach(function () {
      initController.apply(this);

      this.inviteData = {
        userEmail: 'testOrg12345@gmail',
        userName: 'testOrgEmail',
        uuid: '111112',
        userStatus: 'pending',
        dirsyncEnabled: true,
        entitlements: ["squared-call-initiation", "spark", "webex-squared"]
      };
    });

    it('should call resendInvitation successfully', function () {
      this.controller.resendInvitation(
        this.inviteData.userEmail,
        this.inviteData.userName,
        this.inviteData.uuid,
        this.inviteData.userStatus,
        this.inviteData.dirsyncEnabled,
        this.inviteData.entitlements);
      this.$scope.$digest();
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });

  describe('When Authinfo.isCSB returns false', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should set the controller.isCSB to false', function () {
      expect(this.controller.isCSB).toBe(false);
    });
  });
});
