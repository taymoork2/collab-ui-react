'use strict';

describe('Controller: Care Local Settings', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy, $scope,
    $window, userInfoUrl;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org')
  };
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_, _$window_,
                     UrlConfig, $q) {
      sunlightConfigService = _SunlightConfigService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $window = _$window_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      userInfoUrl = UrlConfig.getAdminServiceUrl() + 'userauthinfo';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
        $window: $window
      });
      spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
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

    it('should call updateChatConfig, if already onboarded and orgName is not present', function () {
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'testConnectionString' });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should call updateChatConfig, if already onboarded and orgName is empty', function () {
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'testConnectionString', orgName: "" });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should not call updateChatConfig, if already onboarded and orgName is present', function () {
      $httpBackend.expectGET(userInfoUrl).respond(200, { roles: 'Full_Admin' });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csConnString: 'testConnectionString', orgName: "fake org name" });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).not.toHaveBeenCalled();
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
