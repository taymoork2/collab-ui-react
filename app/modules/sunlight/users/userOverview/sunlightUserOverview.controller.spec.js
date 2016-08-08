'use strict';

describe('sunlightUserOverviewCtrl', function () {
  var controller, $scope, $state, $stateParams, Notification, formlyValidationMessages, Log;
  var $q, sunlightConfigService, getUserInfoDeferred, updateUserInfoDeferred;
  var userInfo = getJSONFixture('sunlight/json/sunlightTestUser.json');
  var successResponse = {
    'data': userInfo,
    'status': 200,
    'statusText': 'OK'
  };

  var failureResponse = {
    'status': 500,
    'statusText': 'Intenal Server Error'
  };

  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _SunlightConfigService_, _Notification_, _formlyValidationMessages_, _Log_) {
    $scope = $rootScope.$new();
    sunlightConfigService = _SunlightConfigService_;
    $q = _$q_;
    Notification = _Notification_;
    $scope.getUserInfoSucceeds = true;
    $state = _$state_;
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
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');

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
    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();
    expect(controller.userData.media).toBe(userInfo.media);
  });

  it('should fail to load the Sunlight userInfo when GET userInfo call to config service fails', function () {
    getUserInfoDeferred.reject(failureResponse);
    $scope.$apply();
    controller.loadUserInformation($stateParams.currentUser.id);
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String), {
      userId: 'CurrentUser'
    });
  });

  it('should return a successful status when the updateUserInfo operation succeeds', function () {
    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();
    expect(controller.userData.media).toBe(userInfo.media);

    controller.userData.media = ['chat'];
    controller.roleSelected = 'User';
    controller.aliasFormModel.sunlightUserAlias = 'iAmSuperAgent';
    controller.updateUserData($stateParams.currentUser.id);

    updateUserInfoDeferred.resolve(successResponse);
    $scope.$apply();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      userId: 'CurrentUser'
    });
  });

  it('should return a failure status when the updateUserInfo operation fails', function () {
    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();

    controller.userData.media = ['chat'];
    controller.updateUserData($stateParams.currentUser.id);
    updateUserInfoDeferred.reject(failureResponse);
    $scope.$apply();
    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String), {
      userId: 'CurrentUser'
    });
  });

  it('should return a failure status when the updateUserInfo operation fails due to empty alias', function () {

    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();

    controller.aliasFormModel.sunlightUserAlias = undefined;
    controller.updateUserData($stateParams.currentUser.id);

    expect(Notification.error).toHaveBeenCalledWith(jasmine.any(String), {
      userId: 'CurrentUser'
    });
  });

  it('should return a successful status when the updateUserInfo with role as Supervisor operation succeeds', function () {
    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();

    controller.roleSelected = 'contactCenterUserConfig.userRoles.supervisor';
    controller.updateUserData($stateParams.currentUser.id);

    updateUserInfoDeferred.resolve(successResponse);
    $scope.$apply();
    expect(Notification.success).toHaveBeenCalledWith(jasmine.any(String), {
      userId: 'CurrentUser'
    });
  });

  it('should enable SaveCancel Button', function () {
    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();

    controller.showSaveCancel();
    expect(controller.saveCancelEnabled).toBe(true);
  });

  it('should call the $state service with the user.list state when closePreview is called', function () {
    getUserInfoDeferred.resolve(successResponse);
    $scope.$apply();

    controller.closePreview();
    expect($state.go).toHaveBeenCalledWith('users.list');
  });
});
