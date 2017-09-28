'use strict';


describe('Partner managing other orgs: Controller: Care Settings', function () {
  var controller, sunlightChatConfigUrl, $httpBackend, Notification, $interval, $intervalSpy, $scope,
    sunlightConfigService, $q;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('aeba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
    isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(false),
  };
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$q_, _$rootScope_, _$httpBackend_, _Notification_, _$interval_, Authinfo, UrlConfig, _SunlightConfigService_) {
      sunlightConfigService = _SunlightConfigService_;
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/chat';
      controller = $controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      spyOn(sunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(sunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.UNKNOWN,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if cs and aa are already onboarded', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.UNKNOWN,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.PENDING,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.PENDING,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCare();
      $scope.$apply();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      $interval.flush(10002);
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
      controller.onboardToCare();
      $scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      $interval.flush(10002);
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
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 30; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        $interval.flush(10001);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 3; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        $interval.flush(10001);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if onboardStatus is failure', function () {
      spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCare();
      $scope.$apply();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
      $interval.flush(10001);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });
  });
});

describe('Partner managing other orgs: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy,
    $scope, q;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('aeba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
    isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(true),
  };
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$httpBackend_, _$interval_, $q, _$rootScope_, _Notification_, _SunlightConfigService_, UrlConfig) {
      q = $q;
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
      controller = $controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(sunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(sunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    })
  );

  it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    expect(controller).toBeDefined();
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should allow proceeding with next steps, if cs and aa are already onboarded', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(false);
  });

  it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Pending',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care button, after onboarding is complete', function () {
    spyOn(sunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(Notification, 'success').and.callFake(function () {
      return true;
    });
    $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    $interval.flush(10001);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect(Notification.success).toHaveBeenCalled();
  });

  it('should show error notification, if any of the onboarding promises fail', function () {
    var dummyResponse = { status: 202 };
    var promise = q.resolve(dummyResponse);
    sunlightConfigService.onBoardCare.and.returnValue(promise);
    spyOn(sunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(controller.csOnboardingStatus).toBe(controller.status.SUCCESS);
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Partner managing his own org: Controller: Care Settings', function () {
  var controller, sunlightChatConfigUrl, $httpBackend, Notification, $interval, $intervalSpy, $scope,
    sunlightConfigService, $q;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
    isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(false),
  };
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$q_, _$rootScope_, _$httpBackend_, _Notification_, _$interval_, Authinfo, UrlConfig, _SunlightConfigService_) {
      sunlightConfigService = _SunlightConfigService_;
      $q = _$q_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + Authinfo.getOrgId() + '/chat';
      controller = $controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      spyOn(sunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(sunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.UNKNOWN,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should not allow proceeding with next steps, if cs and aa are already onboarded but apponboarding is UNKNOWN', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.UNKNOWN,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.PENDING,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.PENDING,
        appOnboardStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCare();
      $scope.$apply();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      $interval.flush(10002);
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
      controller.onboardToCare();
      $scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.SUCCESS,
      };
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      $interval.flush(10002);
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
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 30; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        $interval.flush(10001);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 3; i >= 0; i--) {
        $httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        $interval.flush(10001);
      }
      $httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.status.UNKNOWN);
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if onboardStatus is failure', function () {
      spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCare();
      $scope.$apply();
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
      $interval.flush(10001);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });
  });
});

describe('Partner managing his own org: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy,
    $scope, q;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
    isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(true),
  };
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$httpBackend_, _$interval_, $q, _$rootScope_, _Notification_, _SunlightConfigService_, UrlConfig) {
      q = $q;
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
      controller = $controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(sunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(sunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    })
  );

  it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    expect(controller).toBeDefined();
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should allow proceeding with next steps, if cs, app and aa are already onboarded', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(false);
  });

  it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Pending',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care button, after onboarding is complete', function () {
    spyOn(sunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(Notification, 'success').and.callFake(function () {
      return true;
    });
    $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    $interval.flush(10001);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect(Notification.success).toHaveBeenCalled();
  });

  it('should show error notification, if any of the onboarding promises fail', function () {
    spyOn(sunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});
