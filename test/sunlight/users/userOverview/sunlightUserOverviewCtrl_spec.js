'use strict';

describe('sunlightUserOverviewCtrl', function () {
  var controller, $scope, $state, $stateParams, SunlightConfigService, Notification, $translate;

  var odinUserInfo = {
    "orgId": "deba1221-ab12-cd34-de56-abcdef123456",
    "userId": "abcd1234-ab12-cd34-de56-abcdef123456",
    "teamId": "dbca1001-ab12-cd34-de56-abcdef123454",
    "role": "user",
    "alias": "agent1",
    "attributes": ["Bike", "CreditCard", "French"],
    "channels": [{
      "name": "chat",
      "enabled": false
    }, {
      "name": "email",
      "enabled": false
    }, {
      "name": "voice",
      "enabled": true
    }]
  };

  var mockSunlightConfigService = {
    updateUserInfoSucceeds: true,
    getUserInfoSucceeds: true,
    getUserInfo: function (userId) {
      if (mockSunlightConfigService.getUserInfoSucceeds) return odinUserInfo;
      else return {};
    },
    updateUserInfo: function (channels) {
      if (mockSunlightConfigService.updateUserInfoSucceeds) return {
        "status": "success"
      };
      else return {
        "status": "error"
      };
    }
  };

  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _SunlightConfigService_, _Notification_, _$translate_) {
    $scope = $rootScope.$new();
    SunlightConfigService = mockSunlightConfigService;
    Notification = _Notification_;
    $scope.getUserInfoSucceeds = true;
    $state = _$state_;
    $translate = _$translate_;

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
      Notification: Notification
    });

    $scope.$apply();

  }));

  describe('SunlightUserOverviewCtrl', function () {

    it('should load the Sunlight User Info into scope', function () {
      expect($scope.sunlightUserInfo.channels).toBe(odinUserInfo.channels);
    });

    it('should return a successful status when the updateUserChannel operation succeeds', function () {
      var response = $scope.updateUserChannels('someone');
      expect(response).toBe('success');
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
    });

    it('should return a failure status when the updateUserChannel operation fails', function () {
      mockSunlightConfigService.updateUserInfoSucceeds = false;
      var response = $scope.updateUserChannels('someone');
      expect(response).toBe('error');
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should call the $state service with the user.list state when closePreview is called', function () {
      $scope.closePreview();
      expect($state.go).toHaveBeenCalledWith('users.list');
    });

  });

});
