'use strict';

describe('UserListCtrl: Ctrl', function () {
  var $controller, $scope, $state, $q, Userservice, UserListService, Orgservice, Authinfo, Auth, Config, Notification, FeatureToggleService;
  var photoUsers, currentUser, listUsers, listUsersMore, listAdmins, listAdminsMore, listPartners, getOrgJson;
  var userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements, telstraUser;
  photoUsers = getJSONFixture('core/json/users/userlist.controller.json');
  currentUser = getJSONFixture('core/json/currentUser.json');
  listUsers = getJSONFixture('core/json/users/listUsers.json');
  listUsersMore = getJSONFixture('core/json/users/listUsersMore.json');
  listAdmins = getJSONFixture('core/json/users/listAdmins.json');
  listAdminsMore = getJSONFixture('core/json/users/listAdminsMore.json');
  listPartners = getJSONFixture('core/json/users/listPartners.json');
  getOrgJson = getJSONFixture('core/json/organizations/Orgservice.json').getOrg;
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($rootScope, _$state_, _$controller_, _$q_, _Userservice_, _UserListService_, _Orgservice_, _Authinfo_, _Auth_, _Config_, _Notification_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $controller = _$controller_;
    $q = _$q_;
    UserListService = _UserListService_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    Authinfo = _Authinfo_;
    Auth = _Auth_;
    Config = _Config_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    $rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    var successData = {
      success: true
    };

    // var failedData = {
    //   success: false,
    //   status: 403,
    //   Errors: [{
    //     errorCode: '100106'
    //   }]
    // };

    spyOn($scope, '$emit').and.callThrough();
    spyOn(Notification, 'success');
    spyOn(Userservice, 'resendInvitation').and.returnValue($q.resolve({}));
    spyOn(UserListService, 'listUsers').and.callFake(function (startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
      var response;
      if (getAdmins) {
        response = startIndex > 0 ? listAdminsMore : listAdmins;
      } else {
        response = startIndex > 0 ? listUsersMore : listUsers;
      }
      callback(_.extend(response, successData), 200, searchStr);
    });
    spyOn(UserListService, 'listPartners').and.callFake(function (orgId, callback) {
      callback(_.extend(listPartners, successData), 200);
    });
    spyOn(UserListService, 'getUserCount').and.returnValue($q.resolve(100));
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(getOrgJson, 200);
    });
    spyOn(Authinfo, 'isCSB').and.returnValue(true);
    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);
    spyOn(Authinfo, 'isCisco').and.returnValue(false);
    spyOn(Auth, 'isOnlineOrg').and.returnValue($q.resolve(false));

    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.resolve(false));
    spyOn(FeatureToggleService, 'atlasEmailStatusGetStatus').and.returnValue($q.resolve(false));

    installPromiseMatchers();
  }));

  function initController() {

    var ctrl = $controller('UserListCtrl', {
      $scope: $scope,
      $state: $state,
      Userservice: Userservice,
      UserListService: UserListService,
      Authinfo: Authinfo,
      Config: Config
    });

    spyOn(ctrl, 'configureGrid').and.callFake(function () {
      // mock gridApi
      $scope.gridApi = {
        infiniteScroll: {
          saveScrollPercentage: jasmine.createSpy().and.returnValue(),
          resetScroll: jasmine.createSpy().and.returnValue(),
          dataLoaded: jasmine.createSpy().and.returnValue()
        }
      };
      return $q.resolve();
    });

    ctrl.$onInit();
    $scope.$apply();
  }

  describe('initController', function () {
    beforeEach(function () {
      Authinfo.isCisco.and.returnValue(true);
      initController();
    });

    it('should enable isNotDirSyncOrException when the org is Cisco org', function () {
      expect($scope.isNotDirSyncOrException).toEqual(true);
    });
  });

  describe('initController', function () {
    beforeEach(function () {
      Authinfo.isCisco.and.returnValue(false);
      FeatureToggleService.supportsDirSync.and.returnValue($q.resolve(true));
      initController();
    });

    it('should disable isNotDirSyncOrException when it is a DirSync org', function () {
      expect($scope.isNotDirSyncOrException).toEqual(false);
    });
  });

  describe('getUserList', function () {
    beforeEach(initController);

    it('should populate list with users, admins, and partners when querying from 0 index', function () {
      var promise = $scope.getUserList()
        .then(function () {
          expect($scope.userList.allUsers).toEqual(listUsers.Resources);
          expect($scope.userList.adminUsers).toEqual(listAdmins.Resources);
          expect($scope.userList.partnerUsers).toEqual(listPartners.partners);
        });
      expect(promise).toBeResolved();
    });

    it('should return additional pages of data when they exist', function () {

      var scrollingListUsers = listUsers.Resources.concat(listUsersMore.Resources);
      listUsers.totalResults = _.size(scrollingListUsers);
      var scrollingListAdmins = listAdmins.Resources.concat(listAdminsMore.Resources);
      listAdmins.totalResults = _.size(scrollingListAdmins);

      var promise = $scope.getUserList(100)
        .then(function () {
          expect($scope.userList.allUsers).toEqual(scrollingListUsers);
          expect($scope.userList.adminUsers).toEqual(scrollingListAdmins);
          expect($scope.userList.partnerUsers).toEqual(listPartners.partners);
        });
      expect(promise).toBeResolved();
    });
  });

  describe('getUserPhoto', function () {
    beforeEach(initController);

    it('should return photo thumbnail value', function () {
      expect($scope.getUserPhoto(photoUsers.photoUser)).toEqual(photoUsers.photoUser.photos[1].value);
    });
    it('should return null if no photo list', function () {
      expect($scope.getUserPhoto(currentUser)).toBeUndefined();
    });
  });

  describe('isValidThumbnail', function () {
    beforeEach(initController);

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
    beforeEach(initController);

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

  describe('When Telstra CSB is true and customerType is APP_DIRECT', function () {
    beforeEach(function () {
      telstraUser = {
        "id": "111",
        "userName": "telstraUser",
        "licenseID": undefined,
      };
      FeatureToggleService.supportsDirSync.and.returnValue($q.resolve(true));
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

  describe('getUserList sort event', function () {
    beforeEach(initController);

    it('should getUserList with sort parameters', function () {
      UserListService.listUsers.calls.reset();

      var sortColumns = [{
        'colDef': {
          'id': 'displayName'
        },
        'sort': {
          'direction': 'asc'
        }
      }];

      $scope.sortDirection($scope, sortColumns);
      expect(UserListService.listUsers.calls.count()).toEqual(2);
      expect(UserListService.listUsers.calls.mostRecent().args[0]).toEqual(0, 100, 'displayName', 'ascending', Function, '');
    });
  });

  describe('canShowActionsMenu', function () {

    beforeEach(function () {
      initController();
      spyOn($scope, 'canShowResendInvite').and.returnValue(true);
      spyOn($scope, 'canShowUserDelete').and.returnValue(true);

      this.user = {
        userStatus: 'active'
      };
    });

    it('should return false if dirSync is enabled and user not pending', function () {
      $scope.dirsyncEnabled = true;
      expect($scope.canShowActionsMenu(this.user)).toBeFalsy();
    });

    it('should return true if dirSync is enabled and user is pending', function () {
      $scope.dirsyncEnabled = true;
      this.user.userStatus = 'pending';
      expect($scope.canShowActionsMenu(this.user)).toBeTruthy();
    });

    // test available actions
    it('should return false if no available actions', function () {
      $scope.canShowUserDelete.and.returnValue(false);
      $scope.canShowResendInvite.and.returnValue(false);
      expect($scope.canShowActionsMenu(this.user)).toBeFalsy();
    });

    it('should return true if only canShowResendInvite true', function () {
      $scope.canShowUserDelete.and.returnValue(false);
      expect($scope.canShowActionsMenu(this.user)).toBeTruthy();
    });

    it('should return true if only canShowUserDelete true', function () {
      $scope.canShowResendInvite.and.returnValue(false);
      expect($scope.canShowActionsMenu(this.user)).toBeTruthy();
    });

  });

  describe('canShowUserDelete', function () {
    beforeEach(function () {
      initController();
      spyOn($scope, 'getUserLicenses').and.returnValue(true);
      spyOn($scope, 'isOnlyAdmin').and.returnValue(false);
    });

    it('should return false if no user licenses', function () {
      $scope.getUserLicenses.and.returnValue(false);
      expect($scope.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if dirsync enabled', function () {
      $scope.dirsyncEnabled = true;
      expect($scope.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if only admin is true', function () {
      $scope.isOnlyAdmin.and.returnValue(true);
      expect($scope.isOnlyAdmin(this.user)).toBeTruthy();
      expect($scope.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return true when all conditions met', function () {
      expect($scope.canShowUserDelete(this.user)).toBeTruthy();
    });

    it('should return false when the user is a partner admin', function () {
      $scope.userList.partnerUsers.push(this.user);
      expect($scope.canShowUserDelete(this.user)).toBeFalsy();
    });
  });

  describe('canShowResendInvite', function () {

    beforeEach(function () {
      initController();
      spyOn(Userservice, 'isHuronUser').and.returnValue(false);

      this.user = {
        userStatus: 'active'
      };

      $scope.isCSB = false;
    });

    it('should return false if isCSB is true', function () {
      expect($scope.isCSB).toBeFalsy();
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();
      Userservice.isHuronUser.and.returnValue(true);
      expect($scope.canShowResendInvite(this.user)).toBeTruthy();

      $scope.isCSB = true;
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();
    });

    it('should return true if isHuronUser', function () {
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();

      Userservice.isHuronUser.and.returnValue(true);
      expect($scope.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return true if userStatus is pending', function () {
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'pending';
      expect($scope.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return true if userStatus is error', function () {
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'error';
      expect($scope.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return false if userStatus is neither pending nor error', function () {
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'batman';
      expect($scope.canShowResendInvite(this.user)).toBeFalsy();
    });

  });

});
