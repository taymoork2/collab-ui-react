'use strict';

describe('sunlightUserOverviewCtrl', function () {
  var controller, $scope, $state, $stateParams, Notification, $translate, formlyValidationMessages, Log;
  var $q;
  var sunlightConfigService;
  var getUserInfoDeferred;
  var updateUserInfoDeferred;
  var userInfo = getJSONFixture('sunlight/json/sunlightTestUser.json');

  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _SunlightConfigService_, _Notification_, _$translate_, _formlyValidationMessages_, _Log_) {
    $scope = $rootScope.$new();
    sunlightConfigService = _SunlightConfigService_;
    $q = _$q_;
    Notification = _Notification_;
    $scope.getUserInfoSucceeds = true;
    $state = _$state_;
    $translate = _$translate_;
    formlyValidationMessages = _formlyValidationMessages_;
    Log = _Log_;

    //create mock deferred object which will be used to return promises
    getUserInfoDeferred = $q.defer();
    updateUserInfoDeferred = $q.defer();

    //Use a Jasmine Spy to return a promise when methods of the sunlightConfigService is called
    spyOn(sunlightConfigService, 'getUserInfo').and.returnValue(getUserInfoDeferred.promise);
    spyOn(sunlightConfigService, 'updateUserInfo').and.returnValue(updateUserInfoDeferred.promise);

    $state.modal = jasmine.createSpyObj('modal', ['close']);

    spyOn($state, 'go');
    spyOn(Notification, 'notify');

    $stateParams = {
      currentUser: angular.copy(getJSONFixture('core/json/currentUser.json'))
    };

    controller = $controller('SunlightUserOverviewCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
      SunlightConfigService: sunlightConfigService,
      Notification: Notification,
      formlyValidationMessages: formlyValidationMessages,
      Log: Log
    });
  }));

  it('should load the Sunlight userInfo', function () {
    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();
    expect(controller.userData.media).toBe(userInfo.media);
  });

  it('should fail to load the Sunlight userInfo when GET userInfo call to config service fails', function () {
    getUserInfoDeferred.reject();
    $scope.$apply();
    controller.loadUserInformation($stateParams.currentUser.id);
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });

  it('should return a successful status when the updateUserInfo operation succeeds', function () {
    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();
    expect(controller.userData.media).toBe(userInfo.media);

    controller.userData.media = ['chat'];
    userInfo.role = 'user';
    controller.aliasFormModel.sunlightUserAlias = 'iAmSuperAgent';
    controller.updateUserData($stateParams.currentUser.id);

    updateUserInfoDeferred.resolve(userInfo);
    $scope.$apply();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should return a failure status when the updateUserInfo operation fails', function () {
    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();

    controller.userData.media = ['chat'];
    userInfo.role = 'user';
    controller.aliasFormModel.sunlightUserAlias = 'iAmSuperAgent';
    controller.updateUserData($stateParams.currentUser.id);

    updateUserInfoDeferred.reject();
    $scope.$apply();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });

  it('should return a failure status when the updateUserInfo operation fails due to empty alias', function () {

    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();

    controller.userData.media = ['chat'];
    userInfo.role = 'user';
    controller.aliasFormModel.alias = undefined;
    controller.updateUserData($stateParams.currentUser.id);

    updateUserInfoDeferred.reject();
    $scope.$apply();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });

  it('should return a successful status when the updateUserInfo with role as Supervisor operation succeeds', function () {
    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();

    controller.userData.media = ['chat'];
    controller.aliasFormModel.sunlightUserAlias = 'iAmSuperAgent';
    userInfo.role = 'supervisor';
    controller.updateUserData($stateParams.currentUser.id);

    updateUserInfoDeferred.resolve(userInfo);
    $scope.$apply();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
  });

  it('should enable SaveCancel Button', function () {
    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();

    controller.showSaveCancel();
    expect(controller.saveCancelEnabled).toBe(true);
  });

  it('should call the $state service with the user.list state when closePreview is called', function () {
    getUserInfoDeferred.resolve(userInfo);
    $scope.$apply();

    controller.closePreview();
    expect($state.go).toHaveBeenCalledWith('users.list');
  });
});
