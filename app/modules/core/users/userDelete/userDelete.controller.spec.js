'use strict';

describe('Controller: UserDeleteCtrl', function () {
  var $rootScope, $scope, $q, $controller, $timeout, $translate, controller;
  var Userservice, HuronUser, Notification;
  var stateParams = {
    deleteUserOrgId: '123',
    deleteUserUuiD: '456',
    deleteUsername: 'myUser'
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$rootScope_, _$q_, _$controller_, _$timeout_, _$translate_, _Userservice_, _HuronUser_, _Notification_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    $translate = _$translate_;
    Userservice = _Userservice_;
    HuronUser = _HuronUser_;
    Notification = _Notification_;
  }

  function initSpies() {
    spyOn(Userservice, 'getUser');
    spyOn(Userservice, 'deactivateUser').and.returnValue($q.when());
    spyOn(HuronUser, 'delete').and.returnValue($q.when());
    $scope.$close = jasmine.createSpy('$close');
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');
    spyOn($rootScope, '$broadcast').and.callThrough();
    spyOn($translate, 'instant').and.returnValue('YES');
  }

  function initController() {
    controller = $controller('UserDeleteCtrl', {
      $scope: $scope,
      $stateParams: stateParams
    });
    $scope.$apply();
  }

  function setupUser() {
    var entitlements = Array.prototype.slice.apply(arguments);
    Userservice.getUser.and.callFake(function (uuid, callback) {
      callback({
        entitlements: entitlements
      });
    });
  }

  function setupHuronUser() {
    setupUser('ciscouc');
  }

  function deactivateUser() {
    controller.deactivateUser();
    $scope.$apply();
    $timeout.flush();
  }

  function setupDeleteError() {
    Userservice.deactivateUser.and.returnValue($q.reject());
  }

  function setupHuronDeleteError() {
    HuronUser.delete.and.returnValue($q.reject());
  }

  describe('deleteCheck', function () {
    it('should return true for default value', function () {
      expect(controller.deleteCheck()).toEqual(true);
    });

    it('should return false when confirmation is compared to YES', function () {
      controller.confirmation = 'yes';
      expect(controller.deleteCheck()).toEqual(false);
    });
  });

  describe('User without huron', function () {
    beforeEach(setupUser);

    describe('successful delete', function () {
      beforeEach(deactivateUser);

      it('should not call huron delete', function () {
        expect(HuronUser.delete).not.toHaveBeenCalled();
      });
      it('should call Userservice.deactivateUser', function () {
        expect(Userservice.deactivateUser).toHaveBeenCalledWith({
          email: stateParams.deleteUsername
        });
      });
      it('should have notified success', function () {
        expect(Notification.success).toHaveBeenCalledWith('usersPage.deleteUserSuccess', {
          email: stateParams.deleteUsername
        });
        expect(Notification.errorResponse).not.toHaveBeenCalled();
      });
      it('should refresh the user list', function () {
        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['USER_LIST_UPDATED']);
      });
      it('should have closed the modal', function () {
        expect($scope.$close).toHaveBeenCalled();
      });
    });

    describe('error delete', function () {
      beforeEach(setupDeleteError);
      beforeEach(deactivateUser);

      it('should not call huron delete', function () {
        expect(HuronUser.delete).not.toHaveBeenCalled();
      });
      it('should call Userservice.deactivateUser', function () {
        expect(Userservice.deactivateUser).toHaveBeenCalledWith({
          email: stateParams.deleteUsername
        });
      });
      it('should have notified error', function () {
        expect(Notification.success).not.toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalled();
      });
      it('should not refresh the user list', function () {
        expect($rootScope.$broadcast.calls.mostRecent().args).not.toEqual(['USER_LIST_UPDATED']);
      });
      it('should not have closed the modal', function () {
        expect($scope.$close).not.toHaveBeenCalled();
      });
    });

  });

  describe('User with huron', function () {
    beforeEach(setupHuronUser);

    describe('successful delete', function () {
      beforeEach(deactivateUser);

      it('should call huron delete', function () {
        expect(HuronUser.delete).toHaveBeenCalled();
      });
      it('should call Userservice.deactivateUser', function () {
        expect(Userservice.deactivateUser).toHaveBeenCalledWith({
          email: stateParams.deleteUsername
        });
      });
      it('should have notified success', function () {
        expect(Notification.success).toHaveBeenCalledWith('usersPage.deleteUserSuccess', {
          email: stateParams.deleteUsername
        });
        expect(Notification.errorResponse).not.toHaveBeenCalled();
      });
      it('should refresh the user list', function () {
        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['USER_LIST_UPDATED']);
      });
      it('should have closed the modal', function () {
        expect($scope.$close).toHaveBeenCalled();
      });
    });

    describe('error delete', function () {
      beforeEach(setupHuronDeleteError);
      beforeEach(deactivateUser);

      it('should call huron delete', function () {
        expect(HuronUser.delete).toHaveBeenCalled();
      });
      it('should not call Userservice.deactivateUser', function () {
        expect(Userservice.deactivateUser).not.toHaveBeenCalled();
      });
      it('should have notified error', function () {
        expect(Notification.success).not.toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalled();
      });
      it('should not refresh the user list', function () {
        expect($rootScope.$broadcast.calls.mostRecent().args).not.toEqual(['USER_LIST_UPDATED']);
      });
      it('should not have closed the modal', function () {
        expect($scope.$close).not.toHaveBeenCalled();
      });
    });

  });
});
