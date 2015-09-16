'use strict';

describe('sunlightUserOverviewCtrl', function () {
  var controller, $scope, $state, $stateParams, SunlightConfigService, Notification, $translate, formlyValidationMessages, Log;

  var odinUserInfo = getJSONFixture('sunlight/json/sunlightTestUser.json');

  var mockSunlightConfigService = {
    updateUserInfoSucceeds: true,
    getUserInfoSucceeds: true,
    getUserInfo: function (userId, callback) {
      if (mockSunlightConfigService.getUserInfoSucceeds) {
        odinUserInfo = odinUserInfo || {};
        odinUserInfo.success = true;
        callback(odinUserInfo, '200');
      } else {
        odinUserInfo.success = false;
        callback(odinUserInfo, '500');
      }

    },
    updateUserInfo: function (userId, userData, callback) {
      var result = {};
      if (mockSunlightConfigService.updateUserInfoSucceeds) {
        result.success = true;
        callback(result, '200');
      } else {
        result.success = false;
        callback(result, '500');
      }
    }
  };

  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _SunlightConfigService_, _Notification_, _$translate_, _formlyValidationMessages_, _Log_) {
    $scope = $rootScope.$new();
    SunlightConfigService = mockSunlightConfigService;
    Notification = _Notification_;
    $scope.getUserInfoSucceeds = true;
    $state = _$state_;
    $translate = _$translate_;
    formlyValidationMessages = _formlyValidationMessages_;
    Log = _Log_;

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
      SunlightConfigService: SunlightConfigService,
      Notification: Notification,
      formlyValidationMessages: formlyValidationMessages,
      Log: Log
    });

    $scope.$apply();

  }));

  describe('SunlightUserOverviewCtrl', function () {

    it('should load the Sunlight User Info into scope', function () {
      expect(controller.userData.media).toBe(odinUserInfo.media);
    });

    it('should fail to load the Sunlight User Info into scope', function () {
      mockSunlightConfigService.getUserInfoSucceeds = false;
      $scope.loadUserInformation($stateParams.currentUser.id);
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      mockSunlightConfigService.getUserInfoSucceeds = true;
    });

    it('should return a successful status when the updateUserInfo operation succeeds', function () {
      controller.userData.media = ['chat'];
      $scope.updateUserInfo($stateParams.currentUser.id);
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should return a failure status when the updateUserInfo operation fails', function () {
      mockSunlightConfigService.updateUserInfoSucceeds = false;
      $scope.updateUserInfo($stateParams.currentUser.id);
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should return a failure status when the updateUserInfo operation fails due to empty alias', function () {
      mockSunlightConfigService.updateUserInfoSucceeds = false;
      controller.aliasFormModel.alias = undefined;
      $scope.updateUserInfo($stateParams.currentUser.id);
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should return a successful status when the updateUserInfo with role as Supervisor operation succeeds', function () {
      mockSunlightConfigService.updateUserInfoSucceeds = true;
      odinUserInfo.role = 'supervisor';
      $scope.updateUserInfo($stateParams.currentUser.id);
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should enable SaveCancel Button', function () {
      $scope.showSaveCancel();
      expect($scope.saveCancelEnabled).toBe(true);
    });

    it('should call the $state service with the user.list state when closePreview is called', function () {
      $scope.closePreview();
      expect($state.go).toHaveBeenCalledWith('users.list');
    });

  });

});
