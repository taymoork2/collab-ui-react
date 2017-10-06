'use strict';

describe('Controller: Care Local Settings', function () {
  var controller, HydraService, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy, $scope, FeatureToggleService;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
    isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(false),
  };
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_, UrlConfig, $q, _HydraService_, _FeatureToggleService_) {
      sunlightConfigService = _SunlightConfigService_;
      HydraService = _HydraService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      FeatureToggleService = _FeatureToggleService_;
      spyOn(FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      $scope.orgConfigForm = { dirty: false };
      spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
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
      spyOn(HydraService, 'getHydraApplicationDetails').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake hydraApplicationDetails response');
        return deferred.promise;
      });
    })
  );

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button, if Org is not onboarded already.', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      $httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
          aaOnboardingStatus: controller.status.SUCCESS,
        });
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      $httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.PENDING,
        });
      expect(controller.state).toBe(controller.ONBOARDED);
      $httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
    });

    it('should call updateChatConfig, if already onboarded and orgName is not present', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      $httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
        });
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(sunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should call updateChatConfig, if already onboarded and orgName is empty', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      $httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
          orgName: '',
        });
      $httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(sunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should not call updateChatConfig, if already onboarded and orgName is present', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      $httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
          orgName: 'fake org name',
        });
      $httpBackend.flush();
      expect(sunlightConfigService.updateChatConfig).not.toHaveBeenCalled();
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      $httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      $httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCare();
      $scope.$apply();
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
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      $httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
        });
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
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
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
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
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

describe('Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy,
    $scope, q, HydraService, FeatureToggleService;
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
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_, UrlConfig, $q, _HydraService_, _FeatureToggleService_) {
      q = $q;
      sunlightConfigService = _SunlightConfigService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      HydraService = _HydraService_;
      FeatureToggleService = _FeatureToggleService_;
      spyOn(FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      $scope.orgConfigForm = { dirty: false };
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
      spyOn(HydraService, 'getHydraApplicationDetails').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake hydraApplicationDetails response');
        return deferred.promise;
      });
    })
  );

  it('should enable setup care button, when Org is not onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care, if already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
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
    controller.defaultQueueStatus = controller.status.SUCCESS;
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
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Partner Logged in as org admin: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy,
    $scope, q, FeatureToggleService;
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
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_, UrlConfig, $q, _FeatureToggleService_) {
      q = $q;
      sunlightConfigService = _SunlightConfigService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      FeatureToggleService = _FeatureToggleService_;
      spyOn(FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      $scope.orgConfigForm = { dirty: false };
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

  it('should enable setup care button, when Org is not onboarded', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should disable setup care, if already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
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
    controller.defaultQueueStatus = controller.status.SUCCESS;
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
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Admin logged in: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy,
    $scope, q, HydraService, FeatureToggleService;
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
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_, UrlConfig, $q, _HydraService_, _FeatureToggleService_) {
      q = $q;
      sunlightConfigService = _SunlightConfigService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      HydraService = _HydraService_;
      FeatureToggleService = _FeatureToggleService_;
      spyOn(FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      $scope.orgConfigForm = { dirty: false };
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
      spyOn(HydraService, 'getHydraApplicationDetails').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake hydraApplicationDetails response');
        return deferred.promise;
      });
    })
  );

  it('should enable setup care button, when Org is not onboarded', function () {
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should enable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care, if already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    $httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
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
    controller.defaultQueueStatus = controller.status.SUCCESS;
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
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    expect(controller.csOnboardingStatus).toBe(controller.status.SUCCESS);
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Care Settings - Routing Toggling', function () {
  var controller, sunlightChatConfigUrl, sunlightConfigService, $httpBackend, Notification, orgId, $interval, $intervalSpy, $scope, q, queueDetails, FeatureToggleService, urService, urServiceUrl;
  var spiedAuthinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
    getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
    isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(false),
  };
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', spiedAuthinfo);
  }));
  beforeEach(
    inject(function ($controller, _$rootScope_, _$httpBackend_, _Notification_, _SunlightConfigService_, _$interval_, UrlConfig, $q, _FeatureToggleService_, _URService_) {
      urService = _URService_;
      sunlightConfigService = _SunlightConfigService_;
      $httpBackend = _$httpBackend_;
      Notification = _Notification_;
      q = $q;
      $scope = _$rootScope_.$new();
      $interval = _$interval_;
      $intervalSpy = jasmine.createSpy('$interval', $interval).and.callThrough();
      FeatureToggleService = _FeatureToggleService_;
      spyOn(FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
      urServiceUrl = UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      sunlightChatConfigUrl = UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = $controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: Notification,
      });
      $scope.orgConfigForm = {
        dirty: false,
        $setPristine: function () { },
        $setUntouched: function () { },
      };
    })
  );
  it('should show the saved org chat configurations as selected.', function () {
    spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(urService, 'createQueue').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { routingType: 'push', maxChatCount: 4, videoCallEnabled: true });
    $httpBackend.flush();
    $httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    expect(controller).toBeDefined();
    expect(controller.orgChatConfig.selectedRouting).toBe(controller.RoutingType.PUSH);
    expect(controller.orgChatConfig.selectedChatCount).toBe(4);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
  });

  it('should show success toaster if update of orgChatConfig backend API is a success', function () {
    spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(Notification, 'success').and.callFake(function () {
      return true;
    });
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { routingType: 'pick', maxChatCount: 4, videoCallEnabled: true });
    $httpBackend.flush();
    controller.isProcessing = true;
    controller.saveOrgChatConfigurations();
    $scope.$apply();
    expect(Notification.success).toHaveBeenCalled();
    expect(controller.orgChatConfig.selectedRouting).toBe(controller.RoutingType.PICK);
    expect(controller.orgChatConfig.selectedChatCount).toBe(4);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
    expect(controller.isProcessing).toBe(false);
  });

  it('should show failure toaster if org chat config update backend API fails', function () {
    spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    controller.orgChatConfig.selectedRouting = controller.RoutingType.PICK;
    controller.orgChatConfig.selectedChatCount = 4;
    controller.orgChatConfig.selectedVideoInChatToggle = true;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { routingType: 'push', maxChatCount: 3, videoCallEnabled: false });
    $httpBackend.flush();
    controller.saveOrgChatConfigurations();
    $scope.$apply();
    expect(Notification.errorWithTrackingId).toHaveBeenCalled();
    expect(controller.isProcessing).toBe(false);
    expect(controller.orgChatConfig.selectedRouting).toBe(controller.RoutingType.PUSH);
    expect(controller.orgChatConfig.selectedChatCount).toBe(3);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
  });

  it('should reset form if modification made is cancelled', function () {
    spyOn(sunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    controller.orgChatConfig.selectedRouting = controller.RoutingType.PICK;
    controller.orgChatConfig.selectedChatCount = 4;
    controller.orgChatConfig.selectedVideoInChatToggle = true;
    $httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { routingType: 'push', maxChatCount: 5, videoCallEnabled: false });
    $httpBackend.flush();
    controller.savedRoutingType = controller.RoutingType.PUSH;
    controller.cancelEdit();
    $scope.$apply();
    expect(controller.orgChatConfig.selectedRouting).toBe(controller.RoutingType.PUSH);
    expect(controller.orgChatConfig.selectedChatCount).toBe(5);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
  });
});

