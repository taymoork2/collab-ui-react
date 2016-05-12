'use strict';

describe('UserListCtrl: Ctrl', function () {
  var controller, $controller, $scope, $rootScope, $state, $timeout, $q, Userservice, UserListService, Orgservice, Authinfo, Config, Notification, FeatureToggleService;
  var photoUsers, currentUser, listUsersJson, listPartnersJson, getOrgJson;
  var userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements, telstraUser;
  photoUsers = getJSONFixture('core/json/users/userlist.controller.json');
  currentUser = getJSONFixture('core/json/currentUser.json');
  listUsersJson = getJSONFixture('core/json/users/userlist.service.json').listUsers;
  listPartnersJson = getJSONFixture('core/json/users/userlist.service.json').listPartners;
  getOrgJson = getJSONFixture('core/json/organizations/Orgservice.json').getOrg;
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$state_, _$controller_, _$timeout_, _$q_, _Userservice_, _UserListService_, _Orgservice_, _Authinfo_, _Config_, _Notification_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $state = _$state_;
    $controller = _$controller_;
    $q = _$q_;
    UserListService = _UserListService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    spyOn($scope, '$emit').and.callThrough();
    spyOn(Notification, 'success');
    spyOn(Userservice, 'resendInvitation').and.returnValue($q.when({}));
    spyOn(UserListService, 'listUsers').and.callFake(function (startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
      callback(listUsersJson, 200, searchStr);
    });
    spyOn(UserListService, 'listPartners').and.callFake(function (orgId, callback) {
      callback(listPartnersJson, 200);
    });
    spyOn(UserListService, 'getUserCount').and.returnValue($q.when({}));
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid, disableCache) {
      callback(getOrgJson, 200);
    });
    spyOn(Authinfo, 'isCSB').and.returnValue(true);
    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

  }));

  function initController() {
    controller = $controller('UserListCtrl', {
      $scope: $scope,
      $state: $state,
      Userservice: Userservice,
      UserListService: UserListService,
      Authinfo: Authinfo,
      Config: Config
    });

    $scope.$apply();
  }

  describe('initController', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'isCisco').and.returnValue(true);
      initController();
    });

    it('should enable isNotDirSyncOrException when the org is Cisco org', function () {
      expect($scope.isNotDirSyncOrException).toEqual(true);
    });
  });

  describe('initController', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'isCisco').and.returnValue(false);
      spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(true));
      initController();
    });

    it('should disable isNotDirSyncOrException when it is a DirSync org', function () {
      expect($scope.isNotDirSyncOrException).toEqual(false);
    });
  });

  describe('getUserPhoto', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'isCisco').and.returnValue(false);
      spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
      initController();
    });

    it('should return photo thumbnail value', function () {
      expect($scope.getUserPhoto(photoUsers.photoUser)).toEqual(photoUsers.photoUser.photos[1].value);
    });
    it('should return null if no photo list', function () {
      expect($scope.getUserPhoto(currentUser)).toBeNull();
    });
  });

  describe('isValidThumbnail', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'isCisco').and.returnValue(false);
      spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
      initController();
    });

    it('should verify valid photo thumbnail', function () {
      expect($scope.isValidThumbnail(photoUsers.photoUser)).toBe(true);
    });
    it('should verify no filename in thumbnail value', function () {
      expect($scope.isValidThumbnail(photoUsers.fileThumb)).toBe(false);
    });
    it('should verify no thumbnail field', function () {
      expect($scope.isValidThumbnail(currentUser)).toBe(false);
    });
    it('should verify blank thumbnail field', function () {
      expect($scope.isValidThumbnail(photoUsers.emptyThumb)).toBe(false);
    });
  });

  describe('resendInvitation', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'isCisco').and.returnValue(false);
      spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
      initController();
    });

    beforeEach(function () {
      userEmail = 'testOrg12345@gmail.com';
      userName = 'testOrgEmail';
      uuid = '11229988';
      userStatus = 'pending';
      dirsyncEnabled = true;
      entitlements = ["squared-call-initiation", "spark", "webex-squared"];
    });

    it('should call resendInvitation successfully', function () {
      $scope.resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements);
      $scope.$apply();
      expect(Notification.success).toHaveBeenCalled();
    });
  });

  describe('When atlasTelstraCsb is enabled and customerType is APP_DIRECT', function () {
    beforeEach(function () {
      telstraUser = {
        "id": "111",
        "userName": "telstraUser",
        "licenseID": undefined,
      };
      spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(true));
      initController();
    });

    it('should set the isCSB flag to true and currentUser should be false', function () {
      expect($scope.isCSB).toBe(true);
      expect($scope.getUserLicenses(currentUser)).toBe(false);
    });
    it('should expect telstraUser to be true', function () {
      expect($scope.getUserLicenses(telstraUser)).toBe(true);
    });
  });

  describe('startExportUserList', function () {
    beforeEach(function () {
      spyOn(Authinfo, 'isCisco').and.returnValue(false);
      spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
      initController();
    });

    it('should emit csv-download-request', function () {
      $scope.startExportUserList();
      $scope.$apply();
      expect($scope.$emit).toHaveBeenCalledWith("csv-download-request", "user");
    });
    it('should emit csv-download-request with tooManyUsers when there are too many users in the org', function () {
      $scope.totalUsers = $scope.USER_EXPORT_THRESHOLD + 1;
      $scope.startExportUserList();
      $scope.$apply();
      expect($scope.$emit).toHaveBeenCalledWith("csv-download-request", "user", true);
    });
  });
});
