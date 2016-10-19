'use strict';

describe('Controller: UserDeleteCtrl', function () {
  var $rootScope, $scope, $q, $controller, $timeout, $translate, controller;
  var Authinfo, FeatureToggleService, Notification, SunlightConfigService, Userservice;
  var stateParams = {
    deleteUserOrgId: '123',
    deleteUserUuId: '456',
    deleteUsername: 'myUser'
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$rootScope_, _$q_, _$controller_, _$timeout_, _$translate_, _Authinfo_, _FeatureToggleService_, _Notification_, _SunlightConfigService_, _Userservice_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller = _$controller_;
    $timeout = _$timeout_;
    $translate = _$translate_;
    Userservice = _Userservice_;
    Notification = _Notification_;
    SunlightConfigService = _SunlightConfigService_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
  }

  function initSpies() {
    spyOn(Userservice, 'getUser');
    spyOn(Userservice, 'deactivateUser').and.returnValue($q.when());
    $scope.$close = jasmine.createSpy('$close');
    spyOn(Notification, 'success');
    spyOn(Notification, 'errorResponse');
    spyOn($rootScope, '$broadcast').and.callThrough();
    spyOn($translate, 'instant').and.returnValue('YES');
    var deferred = $q.defer();
    spyOn(SunlightConfigService, 'deleteUser').and.returnValue(
      $q.when(deferred.promise)
    );
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue(
      $q.when(true)
    );
    spyOn(Authinfo, 'isCare').and.returnValue(true);
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

  function deactivateUser() {
    controller.deactivateUser();
    $scope.$apply();
    $timeout.flush();
  }

  function setupDeleteError() {
    Userservice.deactivateUser.and.returnValue($q.reject());
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

  describe('User', function () {
    beforeEach(setupUser);

    describe('successful delete', function () {
      beforeEach(deactivateUser);

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
      it('should have called FeatureToggleService.atlasCareTrialsGetStatus', function () {
        expect(FeatureToggleService.atlasCareTrialsGetStatus).toHaveBeenCalled();
      });
      it('should have called Authinfo.isCare', function () {
        expect(Authinfo.isCare).toHaveBeenCalled();
      });
      it('should call SunlightConfigService.deleteUser', function () {
        expect(SunlightConfigService.deleteUser).toHaveBeenCalledWith('456');
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

      it('should call Userservice.deactivateUser', function () {
        expect(Userservice.deactivateUser).toHaveBeenCalledWith({
          email: stateParams.deleteUsername
        });
      });
      it('should have notified error', function () {
        expect(Notification.success).not.toHaveBeenCalled();
        expect(Notification.errorResponse).toHaveBeenCalled();
      });
      it('should not call FeatureToggleService.atlasCareTrialsGetStatus', function () {
        expect(FeatureToggleService.atlasCareTrialsGetStatus).not.toHaveBeenCalled();
      });
      it('should not have call Authinfo.isCare', function () {
        expect(Authinfo.isCare).not.toHaveBeenCalled();
      });
      it('should not call SunlightConfigService.deleteUser', function () {
        expect(SunlightConfigService.deleteUser).not.toHaveBeenCalled();
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
