'use strict';

describe('sunlightUserOverviewCtrl', function () {
  var controller, $scope, $state, $stateParams, SunlightConfigService, Notification, $translate, formlyValidationMessages, Log;

  var odinUserInfo = {
    "orgId": "deba1221-ab12-cd34-de56-abcdef123456",
    "userId": "abcd1234-ab12-cd34-de56-abcdef123456",
    "teamId": "dbca1001-ab12-cd34-de56-abcdef123454",
    "role": "user",
    "alias": "agent1",
    "attributes": ["Bike", "CreditCard", "French"],
    "media": ['chat', 'email']
  };

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
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should return a successful status when the updateUserInfo operation succeeds', function () {
      controller.userData.media = ['chat'];
      var response = $scope.updateUserInfo();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should return a failure status when the updateUserInfo operation fails', function () {
      var response = $scope.updateUserInfo();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should return a failure status when the updateUserInfo operation fails due to empty alias', function () {
      //mockSunlightConfigService.updateUserInfoSucceeds = false;
      //mockSunlightConfigService.getUserInfoSucceeds = true;
      controller.userData.alias = '';
      var response = $scope.updateUserInfo();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should call the $state service with the user.list state when closePreview is called', function () {
      $scope.closePreview();
      expect($state.go).toHaveBeenCalledWith('users.list');
    });

  });

});
