'use strict';

describe('Controller: Care Settings', function () {
  var controller, $httpBackend, Notification, $interval, $intervalSpy, $scope, $window;
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _$interval_, _$window_) {
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $window = _$window_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
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
      $httpBackend.expectGET(/.*config.*ciscoccservice.*\/chat/g).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe('unknown');
      $httpBackend.flush();
      expect(controller.state).toBe('notOnboarded');
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if already onboarded', function () {
      $httpBackend.expectGET(/.*config.*ciscoccservice.*\/chat/g).respond(200, { csConnString: 'testConnectionString' });
      expect(controller.state).toBe('unknown');
      $httpBackend.flush();
      expect(controller.state).toBe('onboarded');
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should open ccfs in a new tab and flash setup care button', function () {
      spyOn($window, 'open').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(/.*config.*ciscoccservice.*\/chat/g).respond(404, {});
      controller.onboardToCs();
      $httpBackend.flush();
      expect(controller.state).toBe('inProgress');
      expect($window.open).toHaveBeenCalled();
    });

    it('should allow proceeding with next steps, after ccfs tab completes onboarding', function () {
      spyOn(Notification, 'success').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(/.*config.*ciscoccservice.*\/chat/g).respond(200, { csConnString: 'abcdef' });
      controller.onboardToCs();
      $httpBackend.flush();
      expect(controller.state).toBe('onboarded');
      expect(Notification.success).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Failure', function () {
    it('should show error toaster if timed out', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(/.*config.*ciscoccservice.*\/chat/g).respond(404, {});
      controller.onboardToCs();
      for (var i = 30; i >= 0; i--) {
        $httpBackend.whenGET(/.*config.*ciscoccservice.*\/chat/g).respond(404, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe('notOnboarded');
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(Notification, 'error').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(/.*config.*ciscoccservice.*\/chat/g).respond(500, {});
      controller.onboardToCs();
      for (var i = 15; i >= 0; i--) {
        $httpBackend.whenGET(/.*config.*ciscoccservice.*\/chat/g).respond(500, {});
        $interval.flush(10000);
      }
      $httpBackend.flush();
      expect(controller.state).toBe('unknown');
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });
});
