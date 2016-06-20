'use strict';

describe('Controller: UserOverviewCtrl', function () {
  var controller, $scope, $httpBackend, $q, $rootScope, Config, Authinfo, Utils, Userservice, FeatureToggleService, Notification;

  var $stateParams, currentUser, updatedUser, getUserMe, getUserFeatures, UrlConfig;
  var userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements, invitations;
  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($controller, _$httpBackend_, $q, _$rootScope_, _Config_, _Authinfo_, _Utils_, _Userservice_, _FeatureToggleService_, _UrlConfig_, _Notification_) {
    $scope = _$rootScope_.$new();
    $httpBackend = _$httpBackend_;
    $q = $q;
    $rootScope = _$rootScope_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    UrlConfig = _UrlConfig_;
    Utils = _Utils_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;
    Notification = _Notification_;

    var deferred = $q.defer();
    deferred.resolve('true');
    currentUser = angular.copy(getJSONFixture('core/json/currentUser.json'));
    getUserMe = getJSONFixture('core/json/users/me.json');
    invitations = getJSONFixture('core/json/users/invitations.json');
    updatedUser = angular.copy(currentUser);
    getUserFeatures = getJSONFixture('core/json/users/me/featureToggles.json');
    var deferred2 = $q.defer();
    deferred2.resolve({
      data: getUserFeatures
    });

    $stateParams = {
      currentUser: currentUser
    };

    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);
    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });
    spyOn(Userservice, 'resendInvitation').and.returnValue($q.when({}));
    spyOn(FeatureToggleService, 'getFeatureForUser').and.returnValue(deferred.promise);
    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(deferred2.promise);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(Authinfo, 'isCSB').and.returnValue(true);
    spyOn(Notification, 'success');

    // eww
    var userUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/' + currentUser.id;
    $httpBackend.whenGET(userUrl).respond(updatedUser);
    var inviteUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + currentUser.meta.organizationID + '/invitations/' + currentUser.id;
    $httpBackend.whenGET(inviteUrl).respond(invitations);

    controller = $controller('UserOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Config: Config,
      Authinfo: Authinfo,
      Userservice: Userservice,
      FeatureToggleService: FeatureToggleService
    });

    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('init', function () {
    it('should reload the user data from identity response when user list is updated', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('ciscouc');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity response when entitlements are updated', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('ciscouc');
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should set the title to displayName when user data is updated with displayName', function () {
      updatedUser.displayName = "Display Name";
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(controller.titleCard).toEqual("Display Name");
    });

    it('should not set features list by default', function () {
      $httpBackend.flush();
      expect(controller.features).toBeUndefined();
    });

    it('should reload the user data from identity response and set subTitleCard to title', function () {
      updatedUser.title = "Test";
      updatedUser.displayName = "Display Name";
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(controller.subTitleCard).toBe("Test");
    });

    it('should reload the user data from identity response and set title with givenName and FamilyName', function () {
      updatedUser.name = {
        givenName: "Given Name",
        familyName: "Family Name"
      };
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(controller.titleCard).toEqual("Given Name Family Name");
    });

    it('should reload the user data from identity response and set subTitleCard to addresses', function () {
      updatedUser.addresses.push({
        "locality": "AddressLine1"
      });
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(controller.subTitleCard).toBe(" AddressLine1 AddressLine1");

    });

    it('should reload the user data from identity when user list is updated with cloud-contact-center entitlement', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('cloud-contact-center');
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity when user list is updated with squared-syncup entitlement', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      updatedUser.entitlements.push('squared-syncup');
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload user data from identity response when squared-syncup licenseID is updated', function () {
      updatedUser.entitlements.push('squared-syncup');
      updatedUser.licenseID.push('CF_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when contact center licenseID is updated', function () {
      updatedUser.entitlements.push('cloud-contact-center');
      updatedUser.licenseID.push('CC_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when communication licenseID is updated', function () {
      updatedUser.licenseID.push('CO_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });

    it('should reload user data from identity response when messaging licenseID is updated', function () {
      updatedUser.licenseID.push('MS_xyz');
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.licenseID.length).toEqual(1);
    });
  });

  describe('AuthCodeLink', function () {
    it('should load dropdown items when addGenerateAuthCodeLink method is called on controller', function () {
      $httpBackend.flush();
      controller.enableAuthCodeLink();
      expect(controller.dropDownItems.length).toBe(1);
      expect(controller.dropDownItems[0].name).toBe("generateAuthCode");
      expect(controller.dropDownItems[0].text).toBe("usersPreview.generateActivationCode");
    });

    it('should find existing auth code link when addGenerateAuthCodeLink is called second time', function () {
      $httpBackend.flush();
      controller.enableAuthCodeLink();
      expect(controller.dropDownItems.length).toBe(1);
    });

  });

  describe('getAccountStatus should be called properly', function () {
    it('should check if status is pending', function () {
      $httpBackend.flush();
      expect(controller.pendingStatus).toBe(true);
      expect(controller.currentUser.pendingStatus).toBe(true);
      expect(controller.currentUser.invitations.ms).toBe(true);
      expect(controller.currentUser.invitations.cf).toBe('CF_5761413b-5bad-4d6a-b40d-c157c0f99062');
    });
  });

  describe('resendInvitation', function () {
    beforeEach(function () {
      userEmail = 'testOrg12345@gmail';
      userName = 'testOrgEmail';
      uuid = '111112';
      userStatus = 'pending';
      dirsyncEnabled = true;
      entitlements = ["squared-call-initiation", "spark", "webex-squared"];
    });

    it('should call resendInvitation successfully', function () {
      $httpBackend.flush();
      controller.resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements);
      $rootScope.$apply();
      expect(Notification.success).toHaveBeenCalled();
    });
  });

  describe('When atlasTelstraCsb is enabled', function () {
    it('should set the isCSB flag to true', function () {
      $httpBackend.flush();
      expect(controller.isCSB).toBe(true);
    });
  });
});
