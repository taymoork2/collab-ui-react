'use strict';

describe('Controller: Care Local Settings', function () {
  var controller, sunlightChatConfigUrl, orgId, $intervalSpy, $scope, queueDetails, urServiceUrl, $q;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'SunlightConfigService', 'UrlConfig', 'FeatureToggleService', 'URService');
      $q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = this.$controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
      });
      $scope.orgConfigForm = { dirty: false };
      spyOn(this.URService, 'createQueue').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.URService, 'updateQueue').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    });

  afterEach(function () {
    controller = sunlightChatConfigUrl = orgId = $intervalSpy = $scope = queueDetails = urServiceUrl = $q = undefined;
  });

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button, if Org is not onboarded already.', function () {
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      this.$httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
          aaOnboardingStatus: controller.status.SUCCESS,
        });
      expect(controller.state).toBe(controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      this.$httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.PENDING,
        });
      expect(controller.state).toBe(controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
    });

    it('should call updateChatConfig, if already onboarded and orgName is not present', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      this.$httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
        });
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(this.SunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should call updateChatConfig, if already onboarded and orgName is empty', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      this.$httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
          orgName: '',
        });
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(this.SunlightConfigService.updateChatConfig).toHaveBeenCalled();
    });

    it('should not call updateChatConfig, if already onboarded and orgName is present', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      this.$httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
          orgName: 'fake org name',
        });
      this.$httpBackend.flush();
      expect(this.SunlightConfigService.updateChatConfig).not.toHaveBeenCalled();
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller.state).toBe(controller.IN_PROGRESS);
    });

    it('should disable setup care button, after ccfs tab completes onboarding', function () {
      spyOn(this.Notification, 'success').and.callFake(function () {
        return true;
      });
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.expectGET(urServiceUrl)
        .respond(200, queueDetails);
      this.$httpBackend.expectGET(sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: controller.status.SUCCESS,
          appOnboardStatus: controller.status.SUCCESS,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });

  describe('CareSettings - Setup Care - Failure', function () {
    it('should show error toaster if timed out', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 30; i >= 0; i--) {
        this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        this.$interval.flush(10000);
      }
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 3; i >= 0; i--) {
        this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        this.$interval.flush(10000);
      }
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should disable setup care button, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.ONBOARDED);
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
    });
  });
});

describe('Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, urServiceUrl, orgId, $q, queueDetails;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'FeatureToggleService', 'SunlightConfigService', 'UrlConfig', 'URService');
      $q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
      spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue($q.resolve(true));
      controller = this.$controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
      });
      spyOn(this.URService, 'createQueue').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.URService, 'updateQueue').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      $scope.orgConfigForm = { dirty: false };
      spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = $q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    });

  afterEach(function () {
    controller = sunlightChatConfigUrl = orgId = $intervalSpy = $scope = $q = queueDetails = urServiceUrl = undefined;
  });

  it('should enable setup care button, when Org is not onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care, if already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care button, after onboarding is complete', function () {
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = $q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'success').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    this.$interval.flush(10001);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect(this.Notification.success).toHaveBeenCalled();
  });

  it('should not show error notification and disable setup care button, if org is already onboarded', function () {
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = $q.defer();
      deferred.reject({ status: 412 });
      return deferred.promise;
    });
    spyOn(this.Notification, 'success').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    this.$interval.flush(10001);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect(this.Notification.success).toHaveBeenCalled();
  });

  it('should show error notification, if any of the onboarding promises fail', function () {
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = $q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Partner Logged in as org admin: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, urServiceUrl, orgId, q, queueDetails;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'Authinfo', 'SunlightConfigService', 'UrlConfig', 'URService', 'FeatureToggleService');
      q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
      spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue(q.resolve(true));
      controller = this.$controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
      });
      $scope.orgConfigForm = { dirty: false };
      spyOn(this.URService, 'createQueue').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.URService, 'updateQueue').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    });

  afterEach(function () {
    controller = sunlightChatConfigUrl = orgId = $intervalSpy = $scope = q = queueDetails = urServiceUrl = undefined;
  });

  it('should enable setup care button, when Org is not onboarded', function () {
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should disable setup care, if already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care button, after onboarding is complete', function () {
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'success').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    this.$interval.flush(10001);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect(this.Notification.success).toHaveBeenCalled();
  });

  it('should show error notification, if any of the onboarding promises fail', function () {
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Admin logged in: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, urServiceUrl, orgId, q, queueDetails;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'SunlightConfigService', 'UrlConfig', 'URService', 'FeatureToggleService');
      q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
      spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue(q.resolve(true));
      controller = this.$controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
      });
      $scope.orgConfigForm = { dirty: false };
      spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onBoardCare').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake update response');
        return deferred.promise;
      });
      spyOn(this.SunlightConfigService, 'onboardCareBot').and.callFake(function () {
        var deferred = q.defer();
        deferred.resolve('fake onboardCareBot response');
        return deferred.promise;
      });
    });

  afterEach(function () {
    controller = sunlightChatConfigUrl = orgId = $intervalSpy = $scope = q = queueDetails = urServiceUrl = undefined;
  });

  it('should enable setup care button, when Org is not onboarded', function () {
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should enable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care, if already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.ONBOARDED);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
  });

  it('should disable setup care button, after onboarding is complete', function () {
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'success').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    this.$interval.flush(10001);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect(this.Notification.success).toHaveBeenCalled();
  });

  it('should show error notification, if any of the onboarding promises fail', function () {
    var dummyResponse = { status: 202 };
    var promise = q.resolve(dummyResponse);
    this.SunlightConfigService.onBoardCare.and.returnValue(promise);
    spyOn(this.SunlightConfigService, 'aaOnboard').and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    controller.defaultQueueStatus = controller.status.SUCCESS;
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    expect(controller.csOnboardingStatus).toBe(controller.status.SUCCESS);
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Care Settings - Routing Toggling', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, urServiceUrl, orgId, q, queueDetails;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'FeatureToggleService', 'SunlightConfigService', 'UrlConfig', 'URService');
      q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue(q.resolve(true));
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      queueDetails = getJSONFixture('sunlight/json/features/config/DefaultQueueDetails.json');
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = this.$controller('CareLocalSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
      });
      $scope.orgConfigForm = {
        dirty: false,
        $setPristine: function () { },
        $setUntouched: function () { },
      };
    });

  afterEach(function () {
    controller = sunlightChatConfigUrl = orgId = $intervalSpy = $scope = q = queueDetails = urServiceUrl = undefined;
  });

  it('should show the saved org chat configurations as selected.', function () {
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.URService, 'createQueue').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { maxChatCount: 4, videoCallEnabled: true });
    this.$httpBackend.flush();
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, queueDetails);
    expect(controller).toBeDefined();
    expect(controller.queueConfig.selectedRouting).toBe(controller.RoutingType.PICK);
    expect(controller.orgChatConfig.selectedChatCount).toBe(4);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
  });

  it('should show the saved routing type as selected.', function () {
    spyOn(this.URService, 'updateQueue').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, { routingType: 'push' });
    this.$httpBackend.flush();
    expect(controller).toBeDefined();
    expect(controller.queueConfig.selectedRouting).toBe(controller.RoutingType.PUSH);
  });
  it('should show success toaster if update of orgChatConfig backend API is a success', function () {
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.URService, 'updateQueue').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'success').and.callFake(function () {
      return true;
    });
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { maxChatCount: 4, videoCallEnabled: true });
    this.$httpBackend.flush();
    controller.isProcessing = true;
    controller.saveOrgChatConfigurations();
    $scope.$apply();
    expect(this.Notification.success).toHaveBeenCalled();
    expect(controller.queueConfig.selectedRouting).toBe(controller.RoutingType.PICK);
    expect(controller.orgChatConfig.selectedChatCount).toBe(4);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
    expect(controller.isProcessing).toBe(false);
  });

  it('should show failure toaster if org chat config update backend API fails', function () {
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.reject('fake update response');
      return deferred.promise;
    });
    spyOn(this.URService, 'updateQueue').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
      return true;
    });
    controller.queueConfig.selectedRouting = controller.RoutingType.PICK;
    controller.orgChatConfig.selectedChatCount = 4;
    controller.orgChatConfig.selectedVideoInChatToggle = true;
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, { routingType: 'push' });
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { maxChatCount: 3, videoCallEnabled: false });
    this.$httpBackend.flush();
    controller.saveQueueConfigurations();
    controller.saveOrgChatConfigurations();
    $scope.$apply();
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    expect(controller.isProcessing).toBe(false);
    expect(controller.queueConfig.selectedRouting).toBe(controller.RoutingType.PUSH);
    expect(controller.orgChatConfig.selectedChatCount).toBe(3);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
  });

  it('should reset form if modification made is cancelled', function () {
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    spyOn(this.URService, 'updateQueue').and.callFake(function () {
      var deferred = q.defer();
      deferred.resolve('fake update response');
      return deferred.promise;
    });
    controller.queueConfig.selectedRouting = controller.RoutingType.PICK;
    controller.orgChatConfig.selectedChatCount = 4;
    controller.orgChatConfig.selectedVideoInChatToggle = true;
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200, { routingType: 'push' });
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, { maxChatCount: 5, videoCallEnabled: false });
    this.$httpBackend.flush();
    controller.savedRoutingType = controller.RoutingType.PUSH;
    controller.cancelEdit();
    $scope.$apply();
    expect(controller.queueConfig.selectedRouting).toBe(controller.RoutingType.PUSH);
    expect(controller.orgChatConfig.selectedChatCount).toBe(5);
    expect(controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
  });
});

