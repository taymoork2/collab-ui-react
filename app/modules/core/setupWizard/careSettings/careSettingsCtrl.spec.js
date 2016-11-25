'use strict';

describe('Controller: Care Settings', function () {
  var controller, sunlightChatConfigUrl, $httpBackend, Notification, $interval, $intervalSpy, $scope,
    sunlightCSOnboardUrl;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org')
  };
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _$interval_, Authinfo, UrlConfig) {
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/chat';
      sunlightCSOnboardUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/csonboard';
      controller = $controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if already onboarded', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Success' });
      expect(controller.state).toBe(controller.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if ondoardingstatus is Pending ', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      expect(controller.state).toBe(controller.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      $interval.flush(10002);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, after onboard config api completes', function () {
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
      expect($scope.wizard.isNextDisabled).toBe(false);
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
        $interval.flush(10001);
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
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
      controller.onboardToCs();
      for (var i = 3; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        $interval.flush(10001);
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

    it('should show error toaster if onboardStatus is failure', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      $httpBackend.expectPUT(sunlightCSOnboardUrl).respond(200, {});
      controller.onboardToCs();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
      $interval.flush(10001);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });
});
