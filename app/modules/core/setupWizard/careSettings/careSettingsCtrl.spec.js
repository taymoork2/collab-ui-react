'use strict';

describe('Controller: Care Settings', function () {
  var controller, sunlightChatConfigUrl, $httpBackend, Notification, $interval, $intervalSpy, $scope, $window;
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _$interval_, _$window_, Authinfo, UrlConfig) {
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $window = _$window_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/chat';
      controller = $controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
        $window: $window
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button and disabled save button, if Org is not onboarded already', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if already onboarded', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'testConnectionString' });
      expect(controller.state).toBe(controller.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should open ccfs in a new tab and flash setup care button', function () {
      spyOn($window, 'open').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect($window.open).toHaveBeenCalled();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, after ccfs tab completes onboarding', function () {
      spyOn(Notification, 'success').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'abcdef' });
      $interval.flush(10001);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(Notification.success).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Failure', function () {
    it('should show error toaster if timed out', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
      controller.onboardToCs();
      for (var i = 30; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      controller.onboardToCs();
      for (var i = 3; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.UNKNOWN);
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });

    it('should allow proceeding with next steps, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.UNKNOWN);
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.UNKNOWN);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });
});
