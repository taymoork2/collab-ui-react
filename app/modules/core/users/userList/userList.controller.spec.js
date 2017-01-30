'use strict';

describe('UserListCtrl: Ctrl', function () {

  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies('$rootScope', '$state', '$controller', '$q', '$httpBackend', 'Userservice', 'UserListService', 'Orgservice', 'Authinfo', 'Auth', 'Config', 'Notification', 'FeatureToggleService');
    initFixtures.apply(this);
    initDependencySpies.apply(this);
  }

  function initFixtures() {
    this.$rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2
    };

    this.photoUsers = getJSONFixture('core/json/users/userlist.controller.json');
    this.currentUser = getJSONFixture('core/json/currentUser.json');
    this.listUsers = getJSONFixture('core/json/users/listUsers.json');
    this.listUsersMore = getJSONFixture('core/json/users/listUsersMore.json');
    this.listAdmins = getJSONFixture('core/json/users/listAdmins.json');
    this.listAdminsMore = getJSONFixture('core/json/users/listAdminsMore.json');
    this.listPartners = getJSONFixture('core/json/users/listPartners.json');
    this.getOrgJson = getJSONFixture('core/json/organizations/Orgservice.json').getOrg;
  }

  function initDependencySpies() {
    var _this = this;

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

    spyOn(this.Notification, 'success');
    spyOn(this.Userservice, 'resendInvitation').and.returnValue(this.$q.resolve({}));
    spyOn(this.UserListService, 'listUsers').and.callFake(function (startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
      var response;
      if (getAdmins) {
        response = startIndex > 0 ? _this.listAdminsMore : _this.listAdmins;
      } else {
        response = startIndex > 0 ? _this.listUsersMore : _this.listUsers;
      }
      callback(_.extend(response, successData), 200, searchStr);
    });
    spyOn(this.UserListService, 'listPartners').and.callFake(function (orgId, callback) {
      callback(_.extend(_this.listPartners, successData), 200);
    });
    spyOn(this.UserListService, 'getUserCount').and.returnValue(this.$q.resolve(100));
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(_this.getOrgJson, 200);
    });
    spyOn(this.Authinfo, 'isCSB').and.returnValue(true);
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.currentUser.meta.organizationID);
    this.isCiscoSpy = spyOn(this.Authinfo, 'isCisco').and.returnValue(false);
    spyOn(this.Auth, 'isOnlineOrg').and.returnValue(this.$q.resolve(false));

    this.supportsDirSyncSpy = spyOn(this.FeatureToggleService, 'supportsDirSync').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasEmailStatusGetStatus').and.returnValue(this.$q.resolve(false));

    this.$httpBackend.whenGET(/.*\/v1\/Users\/me.*/g).respond(200);

    installPromiseMatchers();
  }

  function initController() {
    var _this = this;
    this.$scope = this.$rootScope.$new();

    this.controller = this.$controller('UserListCtrl', {
      $scope: this.$scope,
      $state: this.$state,
      Userservice: this.Userservice,
      UserListService: this.UserListService,
      Authinfo: this.Authinfo,
      Config: this.Config
    });

    spyOn(this.controller, 'configureGrid').and.callFake(function () {
      // mock gridApi
      _this.$scope.gridApi = {
        infiniteScroll: {
          saveScrollPercentage: jasmine.createSpy().and.returnValue(),
          resetScroll: jasmine.createSpy().and.returnValue(),
          dataLoaded: jasmine.createSpy().and.returnValue()
        }
      };
      return _this.$q.resolve();
    });

    this.controller.$onInit();
    this.$scope.$apply();

  }

  beforeEach(init);

  //////////////////////////////////


  describe('initController', function () {

    it('should enable isNotDirSyncOrException when the org is Cisco org', function () {
      this.isCiscoSpy.and.returnValue(true);
      initController.apply(this);
      expect(this.$scope.isNotDirSyncOrException).toEqual(true);
    });

    it('should disable isNotDirSyncOrException when it is a DirSync org', function () {
      this.isCiscoSpy.and.returnValue(false);
      this.supportsDirSyncSpy.and.returnValue(this.$q.resolve(true));
      initController.apply(this);
      expect(this.$scope.isNotDirSyncOrException).toEqual(false);
    });

  });

  describe('getUserList', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should populate list with users, admins, and partners when querying from 0 index', function () {
      var _this = this;
      var promise = this.$scope.getUserList()
        .then(function () {
          expect(_this.$scope.userList.allUsers).toEqual(_this.listUsers.Resources);
          expect(_this.$scope.userList.adminUsers).toEqual(_this.listAdmins.Resources);
          expect(_this.$scope.userList.partnerUsers).toEqual(_this.listPartners.partners);
        });
      expect(promise).toBeResolved();
    });

    it('should return additional pages of data when they exist', function () {
      var _this = this;

      var scrollingListUsers = this.listUsers.Resources.concat(this.listUsersMore.Resources);
      this.listUsers.totalResults = _.size(scrollingListUsers);
      var scrollingListAdmins = this.listAdmins.Resources.concat(this.listAdminsMore.Resources);
      this.listAdmins.totalResults = _.size(scrollingListAdmins);

      var promise = this.$scope.getUserList(100)
        .then(function () {
          expect(_this.$scope.userList.allUsers).toEqual(scrollingListUsers);
          expect(_this.$scope.userList.adminUsers).toEqual(scrollingListAdmins);
          expect(_this.$scope.userList.partnerUsers).toEqual(_this.listPartners.partners);
        });
      expect(promise).toBeResolved();
    });
  });

  describe('getUserPhoto', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should return photo thumbnail value', function () {
      expect(this.$scope.getUserPhoto(this.photoUsers.photoUser)).toEqual(this.photoUsers.photoUser.photos[1].value);
    });
    it('should return null if no photo list', function () {
      expect(this.$scope.getUserPhoto(this.currentUser)).toBeUndefined();
    });
  });

  describe('isValidThumbnail', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should verify valid photo thumbnail', function () {
      expect(this.$scope.isValidThumbnail(this.photoUsers.photoUser)).toBe(true);
    });
    it('should verify no filename in thumbnail value', function () {
      expect(this.$scope.isValidThumbnail(this.photoUsers.fileThumb)).toBe(false);
    });
    it('should verify no thumbnail field', function () {
      expect(this.$scope.isValidThumbnail(this.currentUser)).toBe(false);
    });
    it('should verify blank thumbnail field', function () {
      expect(this.$scope.isValidThumbnail(this.photoUsers.emptyThumb)).toBe(false);
    });
  });

  describe('resendInvitation', function () {

    beforeEach(function () {
      initController.apply(this);

      this.userEmail = 'testOrg12345@gmail.com';
      this.userName = 'testOrgEmail';
      this.uuid = '11229988';
      this.userStatus = 'pending';
      this.dirsyncEnabled = true;
      this.entitlements = ["squared-call-initiation", "spark", "webex-squared"];
    });

    it('should call resendInvitation successfully', function () {
      this.$scope.resendInvitation(this.userEmail, this.userName, this.uuid, this.userStatus, this.dirsyncEnabled, this.entitlements);
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });

  describe('When Telstra CSB is true and customerType is APP_DIRECT', function () {
    beforeEach(function () {
      this.telstraUser = {
        "id": "111",
        "userName": "telstraUser",
        "licenseID": undefined,
      };
      this.supportsDirSyncSpy.and.returnValue(this.$q.resolve(true));
      initController.apply(this);
    });

    it('should set the isCSB flag to true and currentUser should be false', function () {
      expect(this.$scope.isCSB).toBe(true);
      expect(this.$scope.getUserLicenses(this.currentUser)).toBe(false);
    });
    it('should expect telstraUser to be true', function () {
      expect(this.$scope.getUserLicenses(this.telstraUser)).toBe(true);
    });
  });

  describe('getUserList sort event', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should getUserList with sort parameters', function () {
      this.UserListService.listUsers.calls.reset();

      var sortColumns = [{
        'colDef': {
          'id': 'displayName'
        },
        'sort': {
          'direction': 'asc'
        }
      }];

      this.$scope.sortDirection(this.$scope, sortColumns);
      expect(this.UserListService.listUsers.calls.count()).toEqual(2);
      expect(this.UserListService.listUsers.calls.mostRecent().args[0]).toEqual(0, 100, 'displayName', 'ascending', Function, '');
    });
  });

  describe('canShowActionsMenu', function () {

    beforeEach(function () {
      initController.apply(this);
      spyOn(this.$scope, 'canShowResendInvite').and.returnValue(true);
      spyOn(this.$scope, 'canShowUserDelete').and.returnValue(true);

      this.user = {
        userStatus: 'active'
      };
    });

    it('should return false if dirSync is enabled and user not pending', function () {
      this.$scope.dirsyncEnabled = true;
      expect(this.$scope.canShowActionsMenu(this.user)).toBeFalsy();
    });

    it('should return true if dirSync is enabled and user is pending', function () {
      this.$scope.dirsyncEnabled = true;
      this.user.userStatus = 'pending';
      expect(this.$scope.canShowActionsMenu(this.user)).toBeTruthy();
    });

    // test available actions
    it('should return false if no available actions', function () {
      this.$scope.canShowUserDelete.and.returnValue(false);
      this.$scope.canShowResendInvite.and.returnValue(false);
      expect(this.$scope.canShowActionsMenu(this.user)).toBeFalsy();
    });

    it('should return true if only canShowResendInvite true', function () {
      this.$scope.canShowUserDelete.and.returnValue(false);
      expect(this.$scope.canShowActionsMenu(this.user)).toBeTruthy();
    });

    it('should return true if only canShowUserDelete true', function () {
      this.$scope.canShowResendInvite.and.returnValue(false);
      expect(this.$scope.canShowActionsMenu(this.user)).toBeTruthy();
    });

  });

  describe('canShowUserDelete', function () {
    beforeEach(function () {
      initController.apply(this);
      spyOn(this.$scope, 'getUserLicenses').and.returnValue(true);
      spyOn(this.$scope, 'isOnlyAdmin').and.returnValue(false);
    });

    it('should return false if no user licenses', function () {
      this.$scope.getUserLicenses.and.returnValue(false);
      expect(this.$scope.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if dirsync enabled', function () {
      this.$scope.dirsyncEnabled = true;
      expect(this.$scope.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if only admin is true', function () {
      this.$scope.isOnlyAdmin.and.returnValue(true);
      expect(this.$scope.isOnlyAdmin(this.user)).toBeTruthy();
      expect(this.$scope.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return true when all conditions met', function () {
      expect(this.$scope.canShowUserDelete(this.user)).toBeTruthy();
    });

    it('should return false when the user is a partner admin', function () {
      this.$scope.userList.partnerUsers.push(this.user);
      expect(this.$scope.canShowUserDelete(this.user)).toBeFalsy();
    });
  });

  describe('canShowResendInvite', function () {

    beforeEach(function () {
      initController.apply(this);
      spyOn(this.Userservice, 'isHuronUser').and.returnValue(false);

      this.user = {
        userStatus: 'active'
      };

      this.$scope.isCSB = false;
    });

    it('should return false if isCSB is true', function () {
      expect(this.$scope.isCSB).toBeFalsy();
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();
      this.Userservice.isHuronUser.and.returnValue(true);
      expect(this.$scope.canShowResendInvite(this.user)).toBeTruthy();

      this.$scope.isCSB = true;
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();
    });

    it('should return true if isHuronUser', function () {
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();

      this.Userservice.isHuronUser.and.returnValue(true);
      expect(this.$scope.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return true if userStatus is pending', function () {
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'pending';
      expect(this.$scope.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return true if userStatus is error', function () {
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'error';
      expect(this.$scope.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return false if userStatus is neither pending nor error', function () {
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'batman';
      expect(this.$scope.canShowResendInvite(this.user)).toBeFalsy();
    });

  });

});
