'use strict';

describe('UserListCtrl: Ctrl', function () {
  var controller, $scope, $rootScope, $state, $timeout, $q, Userservice, UserListService, Orgservice, Authinfo, Config, Notification;
  var photoUsers, currentUser, listUsersJson, listPartnersJson, getOrgJson;
  var userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements;
  photoUsers = getJSONFixture('core/json/users/userlist.controller.json');
  currentUser = getJSONFixture('core/json/currentUser.json');
  listUsersJson = getJSONFixture('core/json/users/userlist.service.json').listUsers;
  listPartnersJson = getJSONFixture('core/json/users/userlist.service.json').listPartners;
  getOrgJson = getJSONFixture('core/json/organizations/Orgservice.json').getOrg;
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$state_, $controller, _$timeout_, _$q_, _Userservice_, _UserListService_, _Orgservice_, _Authinfo_, _Config_, _Notification_) {
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $state = _$state_;
    $q = _$q_;
    UserListService = _UserListService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    Notification = _Notification_;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

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

    controller = $controller('UserListCtrl', {
      $scope: $scope,
      $state: $state,
      Userservice: Userservice,
      UserListService: UserListService,
      Authinfo: Authinfo,
      Config: Config
    });

    $scope.$apply();
  }));

  describe('getUserPhoto', function () {
    it('should return photo thumbnail value', function () {
      expect($scope.getUserPhoto(photoUsers.photoUser)).toEqual(photoUsers.photoUser.photos[1].value);
    });
    it('should return null if no photo list', function () {
      expect($scope.getUserPhoto(currentUser)).toBeNull();
    });
  });

  describe('isValidThumbnail', function () {
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
});
