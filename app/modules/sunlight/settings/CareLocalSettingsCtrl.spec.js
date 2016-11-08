'use strict';

describe('Controller: Care Local Settings', function () {
  var controller, sunlightChatConfigUrl, $httpBackend, Notification, $interval, $intervalSpy, $scope, $window, userInfoUrl;
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
      userInfoUrl = UrlConfig.getAdminServiceUrl() + 'userauthinfo';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/chat';
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
        $window: $window
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button , if Org is not onboarded already and user is not a partner', function () {
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.isPartner).toBe(true);
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.isPartner).toBe(false);
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'testConnectionString' });
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should open ccfs in a new tab and flash setup care button', function () {
      spyOn($window, 'open').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect($window.open).toHaveBeenCalled();
      expect(controller.state).toBe(controller.IN_PROGRESS);
    });

    it('should disable setup care button, after ccfs tab completes onboarding', function () {
      spyOn(Notification, 'success').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'abcdef' });
      $interval.flush(10001);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(Notification.success).toHaveBeenCalled();
    });
  });

  describe('CareSettings - Setup Care - Failure', function () {
    it('should show error toaster if timed out', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
      controller.onboardToCs();
      for (var i = 30; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      controller.onboardToCs();
      for (var i = 3; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should disable setup care button, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });
  });
});
