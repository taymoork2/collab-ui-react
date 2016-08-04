'use strict';

describe('UserListCtrl: Ctrl', function () {
  var controller, $controller, $scope, $rootScope, $state, $timeout, $q, Userservice, UserListService, Orgservice, Authinfo, Config, Notification, FeatureToggleService;
  var photoUsers, currentUser, listUsers, listUsersMore, listAdmins, listAdminsMore, listPartners, getOrgJson;
  var userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements, telstraUser, failedData;
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

    var successData = {
      success: true
    };
    failedData = {
      success: false,
      status: 403,
      Errors: [{
        errorCode: '100106'
      }]
    };

    spyOn($scope, '$emit').and.callThrough();
    spyOn(Notification, 'success');
    spyOn(Userservice, 'resendInvitation').and.returnValue($q.when({}));
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
    spyOn(UserListService, 'getUserCount').and.returnValue($q.when(100));
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid, disableCache) {
      callback(getOrgJson, 200);
    });
    spyOn(Authinfo, 'isCSB').and.returnValue(true);
    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);

    spyOn(Authinfo, 'isCisco').and.returnValue(false);
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
    spyOn(FeatureToggleService, 'atlasCsvEnhancementGetStatus').and.returnValue($q.when(false));
    spyOn(FeatureToggleService, 'atlasEmailStatusGetStatus').and.returnValue($q.when(false));

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
      FeatureToggleService.supportsDirSync.and.returnValue($q.when(true));
      initController();
    });

    it('should disable isNotDirSyncOrException when it is a DirSync org', function () {
      expect($scope.isNotDirSyncOrException).toEqual(false);
    });
  });

  describe('getUserList', function () {
    beforeEach(initController);

    it('should populate list with users, admins, and partners when querying from 0 index', function () {
      $scope.getUserList(); // 0 index
      expect($scope.userList.allUsers).toEqual(listUsers.Resources);
      expect($scope.userList.adminUsers).toEqual(listAdmins.Resources);
      expect($scope.userList.partnerUsers).toEqual(listPartners.partners);
    });

    it('should append list with users and admins, but not partners when querying from scrolling index', function () {
      var scrollingListUsers = listUsers.Resources.concat(listUsersMore.Resources);
      var scrollingListAdmins = listAdmins.Resources.concat(listAdminsMore.Resources);

      $scope.getUserList(100); // >0 index
      expect($scope.userList.allUsers).toEqual(scrollingListUsers);
      expect($scope.userList.adminUsers).toEqual(scrollingListAdmins);
      expect($scope.userList.partnerUsers).toEqual(listPartners.partners);
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
      FeatureToggleService.supportsDirSync.and.returnValue($q.when(true));
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
    beforeEach(initController);

    it('should emit csv-download-request', function () {
      $scope.startExportUserList();
      $scope.$apply();
      expect($scope.$emit).toHaveBeenCalledWith("csv-download-request", {
        csvType: "user",
        tooManyUsers: false
      });
    });
    it('should emit csv-download-request with tooManyUsers when there are too many users in the org', function () {
      $scope.totalUsers = $scope.USER_EXPORT_THRESHOLD + 1;
      $scope.startExportUserList();
      $scope.$apply();
      expect($scope.$emit).toHaveBeenCalledWith("csv-download-request", {
        csvType: "user",
        tooManyUsers: true
      });
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

  describe('getUserCount() returns NaN', function () {
    beforeEach(function () {
      UserListService.listUsers.and.callFake(function (startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
        callback(failedData, 200, searchStr);
      });
      UserListService.getUserCount.and.returnValue($q.when(NaN));
      initController();
    });

    it('should set user count to USER_EXPORT_THRESHOLD + 1', function () {
      // $scope.obtainedTotalUserCount = false;
      $scope.getUserList(); // 0 index
      expect($scope.obtainedTotalUserCount).toEqual(true);
      expect($scope.totalUsers).toEqual($scope.USER_EXPORT_THRESHOLD + 1);
    });
  });
});
