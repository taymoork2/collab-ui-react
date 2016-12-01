'use strict';

describe('Controller: Care Local Settings', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy, $scope,
    sunlightCSOnboardUrl;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org')
  };
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_,
                     UrlConfig, $q) {
      sunlightConfigService = _SunlightConfigService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      sunlightCSOnboardUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/csonboard';
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification
      });
      spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button , if Org is not onboarded already.', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Success' });
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org orboarding is in progress', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
    });

    it('should call updateChatConfig, if already onboarded and orgName is not present', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Success' });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should call updateChatConfig, if already onboarded and orgName is empty', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Success', orgName: "" });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should not call updateChatConfig, if already onboarded and orgName is present', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Success', orgName: "fake org name" });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).not.toHaveBeenCalled();
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller.state).toBe(controller.IN_PROGRESS);
    });

    it('should disable setup care button, after ccfs tab completes onboarding', function () {
      spyOn(Notification, 'success').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Success' });
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
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
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
      spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
      controller.onboardToCs();
      for (var i = 3; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should disable setup care button, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });

  });
});
