'use strict';

var KeyCodes = require('modules/core/accessibility').KeyCodes;

describe('UserListCtrl: Ctrl', function () {
  function init() {
    this.initModules('Core', 'Huron', 'Sunlight');
    this.injectDependencies(
      '$controller',
      '$httpBackend',
      '$q',
      '$rootScope',
      '$scope',
      '$state',
      'Authinfo',
      'Config',
      'DirSyncService',
      'FeatureToggleService',
      'Notification',
      'Orgservice',
      'UserListService',
      'Userservice'
    );
    initFixtures.apply(this);
    initDependencySpies.apply(this);
  }

  function initFixtures() {
    this.$rootScope.typeOfExport = {
      USER: 1,
      CUSTOMER: 2,
    };

    this.event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };

    this.photoUsers = _.clone(getJSONFixture('core/json/users/userlist.controller.json'));
    this.currentUser = _.clone(getJSONFixture('core/json/currentUser.json'));
    this.listUsers = _.clone(getJSONFixture('core/json/users/listUsers.json'));
    this.listUsersMore = _.clone(getJSONFixture('core/json/users/listUsersMore.json'));
    this.listAdmins = _.clone(getJSONFixture('core/json/users/listAdmins.json'));
    this.listAdminsMore = _.clone(getJSONFixture('core/json/users/listAdminsMore.json'));
    this.listPartners = _.clone(getJSONFixture('core/json/users/listPartners.json'));
    this.getOrgJson = _.clone(getJSONFixture('core/json/organizations/Orgservice.json')).getOrg;
  }

  function initDependencySpies() {
    var _this = this;

    var successData = {
      success: true,
    };

    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.Userservice, 'resendInvitation').and.returnValue(this.$q.resolve({}));
    spyOn(this.UserListService, 'listUsers').and.callFake(function (startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
      var response;
      if (getAdmins) {
        response = startIndex > 0 ? _this.listAdminsMore : _this.listAdmins;
      } else {
        response = startIndex > 0 ? _this.listUsersMore : _this.listUsers;
      }
      callback(_.assignIn({}, response, successData), 200, searchStr);
    });
    spyOn(this.UserListService, 'listPartners').and.callFake(function (orgId, callback) {
      callback(_.assignIn({}, _this.listPartners, successData), 200);
    });
    spyOn(this.UserListService, 'getUserCount').and.returnValue(this.$q.resolve(100));
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(_this.getOrgJson, 200);
    });
    spyOn(this.Orgservice, 'getAdminOrgAsPromise').and.returnValue(this.$q.resolve({
      data: {
        isOnBoardingEmailSuppressed: false,
      },
    }));
    spyOn(this.Authinfo, 'isCSB').and.returnValue(true);
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.currentUser.meta.organizationID);
    this.isCiscoSpy = spyOn(this.Authinfo, 'isCisco').and.returnValue(false);

    spyOn(this.FeatureToggleService, 'atlasEmailStatusGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.FeatureToggleService, 'atlasUserAddExternalAdminGetStatus').and.returnValue(this.$q.resolve(true));

    this.$httpBackend.whenGET(/.*\/v1\/Users\/me.*/g).respond(200);

    spyOn(this.DirSyncService, 'refreshStatus').and.returnValue(this.$q.resolve());
    spyOn(this.DirSyncService, 'isDirSyncEnabled').and.returnValue(false);

    installPromiseMatchers();
  }

  function initController() {
    this.controller = this.$controller('UserListCtrl', {
      $scope: this.$scope,
      $state: this.$state,
      Userservice: this.Userservice,
      UserListService: this.UserListService,
      Authinfo: this.Authinfo,
      Config: this.Config,
    });

    this.controller.$onInit();

    this.$scope.gridOptions.onRegisterApi({
      core: {
        on: {
          sortChanged: _.noop,
        },
      },
      infiniteScroll: {
        saveScrollPercentage: _.noop,
        resetScroll: _.noop,
        dataLoaded: _.noop,
        on: {
          needLoadMoreData: _.noop,
        },
      },
      selection: {
        on: {
          rowSelectionChanged: _.noop,
        },
      },
      grid: {
        columns: [
          {
            field: 'userRole',
            colDef: {
              visable: true,
            },
          },
          {
            field: 'action',
            colDef: {
              visable: true,
            },
          },
        ],
      },
    });

    this.$scope.$apply();
  }

  beforeEach(init);

  //////////////////////////////////

  describe('getUserList', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should populate list with users, admins, and partners when querying from 0 index', function () {
      expect(this.$scope.userList.allUsers).toEqual(this.listUsers.Resources);
      expect(this.$scope.userList.adminUsers).toEqual(this.listAdmins.Resources);
      expect(this.$scope.userList.partnerUsers).toEqual(this.listPartners.partners);
      expect(this.UserListService.listUsers).toHaveBeenCalledTimes(2); // for getUsers() and getAdmins()
      expect(this.$scope.allowLoadMoreData).toEqual(false); // should be false after totalResults are returned
    });

    it('should allow more data to load until totalResults is reached', function () {
      var _this = this;

      var scrollingListUsers = this.listUsers.Resources.concat(this.listUsersMore.Resources);
      this.listUsers.totalResults = _.size(scrollingListUsers);
      var scrollingListAdmins = this.listAdmins.Resources.concat(this.listAdminsMore.Resources);
      this.listAdmins.totalResults = _.size(scrollingListAdmins);

      expect(this.$scope.allowLoadMoreData).toEqual(false);
      var promise = this.$scope.getUserList()
        .then(function () {
          expect(_this.$scope.userList.allUsers).toEqual(_this.listUsers.Resources);
          expect(_this.$scope.userList.adminUsers).toEqual(_this.listAdmins.Resources);
          expect(_this.$scope.userList.partnerUsers).toEqual(_this.listPartners.partners);
        });
      expect(promise).toBeResolved();

      expect(this.$scope.allowLoadMoreData).toEqual(true); // totalResults is 4, but only returned 2

      promise = this.$scope.getUserList(100) // > 0
        .then(function () {
          expect(_this.$scope.userList.allUsers).toEqual(scrollingListUsers);
          expect(_this.$scope.userList.adminUsers).toEqual(scrollingListAdmins);
          expect(_this.$scope.userList.partnerUsers).toEqual(_this.listPartners.partners);
        });
      expect(promise).toBeResolved();
      expect(this.$scope.allowLoadMoreData).toEqual(false); // have returned all 4 results
    });

    it('should not allow more data to load if an error occurs while listing users', function () {
      this.UserListService.listUsers.and.callFake(function (startIndex, count, sortBy, sortOrder, callback, searchStr, getAdmins) {
        callback({
          success: !!getAdmins, // true for admins, false for users
        });
      });

      expect(this.$scope.allowLoadMoreData).toEqual(false);
      var promise = this.$scope.getUserList();
      expect(promise).toBeRejected();
      expect(this.$scope.allowLoadMoreData).toEqual(false); // does not continue to load data from `gridApi.infiniteScroll.on.needLoadMoreData`
    });
  });

  describe('getUserPhoto', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should return photo thumbnail value', function () {
      expect(this.controller.getUserPhoto(this.photoUsers.photoUser)).toEqual(this.photoUsers.photoUser.photos[1].value);
    });
    it('should return null if no photo list', function () {
      expect(this.controller.getUserPhoto(this.currentUser)).toBeUndefined();
    });
  });

  describe('isValidThumbnail', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should verify valid photo thumbnail', function () {
      expect(this.controller.isValidThumbnail(this.photoUsers.photoUser)).toBe(true);
    });
    it('should verify no filename in thumbnail value', function () {
      expect(this.controller.isValidThumbnail(this.photoUsers.fileThumb)).toBe(false);
    });
    it('should verify no thumbnail field', function () {
      expect(this.controller.isValidThumbnail(this.currentUser)).toBe(false);
    });
    it('should verify blank thumbnail field', function () {
      expect(this.controller.isValidThumbnail(this.photoUsers.emptyThumb)).toBe(false);
    });
  });

  describe('handleDeleteUser', function () {
    beforeEach(function () {
      initController.apply(this);

      this.user = {
        userName: 'userName',
        id: 'id',
        meta: {
          organizationID: 'organizationID',
        },
      };

      this.userDetails = {
        deleteUserOrgId: this.user.meta.organizationID,
        deleteUserUuId: this.user.id,
        deleteUsername: this.user.userName,
      };

      this.userDelete = 'users.delete';
      this.selfDelete = 'users.deleteSelf';
    });

    it('should call keypressHandleDeleteUser and handleDeleteUser successfully when keypress event is enter', function () {
      this.event.keyCode = KeyCodes.ENTER;
      this.controller.keypressHandleDeleteUser(this.event, this.user, true);
      expect(this.event.stopPropagation).toHaveBeenCalled();
      expect(this.$state.go).toHaveBeenCalledWith(this.selfDelete, this.userDetails);
    });

    it('should call keypressHandleDeleteUser and handleDeleteUser successfully when keypress event is space', function () {
      this.event.keyCode = KeyCodes.SPACE;
      this.controller.keypressHandleDeleteUser(this.event, this.user, true);
      expect(this.event.stopPropagation).toHaveBeenCalled();
      expect(this.$state.go).toHaveBeenCalledWith(this.selfDelete, this.userDetails);
    });

    it('should call keypressHandleDeleteUser, but not handleDeleteUser, when keypress event is neither enter nor space', function () {
      this.event.keyCode = 0;
      this.controller.keypressHandleDeleteUser(this.event, this.user, true);
      expect(this.event.stopPropagation).toHaveBeenCalled();
      expect(this.$state.go).not.toHaveBeenCalled();
    });

    it('should call handleDeleteUser and call the delete self modal when self is true', function () {
      this.controller.handleDeleteUser(this.event, this.user, true);
      expect(this.event.stopPropagation).toHaveBeenCalled();
      expect(this.$state.go).toHaveBeenCalledWith(this.selfDelete, this.userDetails);
    });

    it('should call handleDeleteUser and call the delete user modal when self is false', function () {
      this.controller.handleDeleteUser(this.event, this.user, false);
      expect(this.event.stopPropagation).toHaveBeenCalled();
      expect(this.$state.go).toHaveBeenCalledWith(this.userDelete, this.userDetails);
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
      this.entitlements = ['squared-call-initiation', 'spark', 'webex-squared'];
    });

    it('should call keypressResendInvitation and resendInvitation successfully when keypress event is enter', function () {
      this.event.keyCode = KeyCodes.ENTER;
      this.controller.keypressResendInvitation(this.event, this.userEmail, this.userName, this.uuid, this.userStatus, this.dirsyncEnabled, this.entitlements);
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.event.stopPropagation).toHaveBeenCalled();
    });

    it('should call keypressResendInvitation and resendInvitation successfully when keypress event is space', function () {
      this.event.keyCode = KeyCodes.SPACE;
      this.controller.keypressResendInvitation(this.event, this.userEmail, this.userName, this.uuid, this.userStatus, this.dirsyncEnabled, this.entitlements);
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.event.stopPropagation).toHaveBeenCalled();
    });

    it('should call keypressResendInvitation, but not resendInvitation, when keypress event is neither enter nor space', function () {
      this.event.keyCode = 0;
      this.controller.keypressResendInvitation(this.event, this.userEmail, this.userName, this.uuid, this.userStatus, this.dirsyncEnabled, this.entitlements);
      this.$scope.$apply();
      expect(this.Notification.success).not.toHaveBeenCalled();
      expect(this.Notification.errorResponse).not.toHaveBeenCalled();
      expect(this.event.stopPropagation).toHaveBeenCalled();
    });

    it('should call resendInvitation successfully', function () {
      this.controller.resendInvitation(this.event, this.userEmail, this.userName, this.uuid, this.userStatus, this.dirsyncEnabled, this.entitlements);
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.event.stopPropagation).toHaveBeenCalled();
    });

    it('should call resendInvitation error notification on failure', function () {
      this.Userservice.resendInvitation.and.returnValue(this.$q.reject({}));
      this.controller.resendInvitation(this.event, this.userEmail, this.userName, this.uuid, this.userStatus, this.dirsyncEnabled, this.entitlements);
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalled();
      expect(this.event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('When Telstra CSB is true and customerType is APP_DIRECT', function () {
    beforeEach(function () {
      this.telstraUser = {
        id: '111',
        userName: 'telstraUser',
        licenseID: undefined,
      };
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
      // set totalResults greater than response so sortDirection() triggers listUsers()
      this.listUsers = _.assignIn({}, this.listUsers, {
        totalResults: '4',
      });
      initController.apply(this);
    });

    it('should getUserList with sort parameters', function () {
      this.UserListService.listUsers.calls.reset();

      var sortColumns = [{
        colDef: {
          id: 'displayName',
        },
        sort: {
          direction: 'asc',
        },
      }];

      this.$scope.sortDirection(this.$scope, sortColumns);
      expect(this.UserListService.listUsers.calls.count()).toEqual(2);
      expect(this.UserListService.listUsers.calls.mostRecent().args[0]).toEqual(0, 100, 'displayName', 'ascending', Function, '');
    });

    it('should getUserList with default parameters', function () {
      this.UserListService.listUsers.calls.reset();
      this.$scope.sortDirection(this.$scope, undefined);
      expect(this.UserListService.listUsers.calls.count()).toEqual(2);
      expect(this.UserListService.listUsers.calls.mostRecent().args[0]).toEqual(0, 100, 'name', 'ascending', Function, '');
    });
  });

  describe('canShowActionsMenu', function () {
    beforeEach(function () {
      initController.apply(this);
      spyOn(this.controller, 'canShowResendInvite').and.returnValue(true);
      spyOn(this.controller, 'canShowUserDelete').and.returnValue(true);

      this.user = {
        userStatus: 'active',
      };
    });

    it('should return false if dirSync is enabled and user not pending', function () {
      this.$scope.dirsyncEnabled = true;
      expect(this.controller.canShowActionsMenu(this.user)).toBeFalsy();
    });

    it('should return true if dirSync is enabled and user is pending', function () {
      this.$scope.dirsyncEnabled = true;
      this.user.userStatus = 'pending';
      expect(this.controller.canShowActionsMenu(this.user)).toBeTruthy();
    });

    // test available actions
    it('should return false if no available actions', function () {
      this.controller.canShowUserDelete.and.returnValue(false);
      this.controller.canShowResendInvite.and.returnValue(false);
      expect(this.controller.canShowActionsMenu(this.user)).toBeFalsy();
    });

    it('should return true if only canShowResendInvite true', function () {
      this.controller.canShowUserDelete.and.returnValue(false);
      expect(this.controller.canShowActionsMenu(this.user)).toBeTruthy();
    });

    it('should return true if only canShowUserDelete true', function () {
      this.controller.canShowResendInvite.and.returnValue(false);
      expect(this.controller.canShowActionsMenu(this.user)).toBeTruthy();
    });
  });

  describe('canShowUserDelete', function () {
    beforeEach(function () {
      initController.apply(this);
      spyOn(this.$scope, 'getUserLicenses').and.returnValue(true);
      spyOn(this.$scope, 'isOnlyAdmin').and.returnValue(false);
      spyOn(this.$scope, 'isOnlineBuyer').and.returnValue(false);
    });

    it('should return false if no user licenses', function () {
      this.$scope.getUserLicenses.and.returnValue(false);
      expect(this.controller.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if dirsync enabled', function () {
      this.$scope.dirsyncEnabled = true;
      expect(this.controller.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if only admin is true', function () {
      this.$scope.isOnlyAdmin.and.returnValue(true);
      expect(this.$scope.isOnlyAdmin(this.user)).toBeTruthy();
      expect(this.controller.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return false if online buyer is true', function () {
      this.$scope.isOnlineBuyer.and.returnValue(true);
      expect(this.controller.canShowUserDelete(this.user)).toBeFalsy();
    });

    it('should return true when all conditions met', function () {
      expect(this.controller.canShowUserDelete(this.user)).toBeTruthy();
    });

    it('should return false when the user is a partner admin', function () {
      this.$scope.userList.partnerUsers.push(this.user);
      expect(this.controller.canShowUserDelete(this.user)).toBeFalsy();
    });
  });

  describe('canShowResendInvite', function () {
    beforeEach(function () {
      initController.apply(this);
      spyOn(this.Userservice, 'isHuronUser').and.returnValue(false);

      this.user = {
        userStatus: 'active',
      };

      this.$scope.isCSB = false;
    });

    it('should return false if isCSB is true', function () {
      expect(this.$scope.isCSB).toBeFalsy();
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
      this.Userservice.isHuronUser.and.returnValue(true);
      expect(this.controller.canShowResendInvite(this.user)).toBeTruthy();

      this.$scope.isCSB = true;
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
    });

    it('should return true if isHuronUser', function () {
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();

      this.Userservice.isHuronUser.and.returnValue(true);
      expect(this.controller.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return true if userStatus is pending', function () {
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'pending';
      expect(this.controller.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return true if userStatus is error', function () {
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'error';
      expect(this.controller.canShowResendInvite(this.user)).toBeTruthy();
    });

    it('should return false if isEmailSuppressed is true', function () {
      this.user.userStatus = 'pending';
      expect(this.controller.isEmailSuppressed).toBe(false);
      expect(this.controller.canShowResendInvite(this.user)).toBe(true);

      this.Orgservice.getAdminOrgAsPromise.and.returnValue(this.$q.resolve({
        data: {
          isOnBoardingEmailSuppressed: true,
        },
      }));
      initController.apply(this);
      expect(this.controller.canShowResendInvite(this.user)).toBe(false);
    });

    it('should return false if org is dirsynch', function () {
      this.$scope.dirsyncEnabled = true;
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
    });

    it('should return false if userStatus is neither pending nor error', function () {
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
      this.user.userStatus = 'batman';
      expect(this.controller.canShowResendInvite(this.user)).toBeFalsy();
    });
  });

  describe('canShowAddExtAdmin', function () {
    beforeEach(function () {
      initController.apply(this);
    });

    it('should return false if not on External Admins tab', function () {
      spyOn(this.Authinfo, 'hasRole').and.returnValue(true);
      spyOn(this.Authinfo, 'isProvisionAdmin').and.returnValue(false);
      this.$scope.activeFilter = 'administrators';

      expect(this.$scope.canShowAddExtAdmin()).toBe(false);
    });

    it('should return false if user is not a full admin', function () {
      spyOn(this.Authinfo, 'hasRole').and.returnValue(false);
      spyOn(this.Authinfo, 'isProvisionAdmin').and.returnValue(true);
      this.$scope.activeFilter = 'partners';

      expect(this.$scope.canShowAddExtAdmin()).toBe(false);
    });

    it('should return true if all conditions are met', function () {
      spyOn(this.Authinfo, 'hasRole').and.returnValue(true);
      spyOn(this.Authinfo, 'isProvisionAdmin').and.returnValue(false);
      this.$scope.activeFilter = 'partners';

      expect(this.$scope.canShowAddExtAdmin()).toBe(true);
    });
  });
});
