'use strict';


describe('Partner managing other orgs: Controller: Care Settings', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, urServiceUrl, orgId, q;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'Authinfo', 'SunlightConfigService', 'UrlConfig', 'URService');
      q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' +
        this.Authinfo.getOrgId() + '/chat';
      controller = this.$controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
      });
      spyOn(this.URService, 'getQueue').and.callFake(function () {
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
    controller = sunlightChatConfigUrl = $intervalSpy = $scope = urServiceUrl = orgId = q = undefined;
  });

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.UNKNOWN,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('show enabled setup care button and disabled next button, if default sunlight queue is not created', function () {
      this.$httpBackend.expectGET(urServiceUrl).respond(404);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if queue is created, cs and aa are already onboarded', function () {
      var getQueueResponse = {
        defaultQueueStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(urServiceUrl).respond(200, getQueueResponse);
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.UNKNOWN,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
      var getQueueResponse = {
        defaultQueueStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(urServiceUrl).respond(200, getQueueResponse);
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.PENDING,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
      var getQueueResponse = {
        defaultQueueStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(urServiceUrl).respond(200, getQueueResponse);
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.PENDING,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      this.$interval.flush(10002);
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, after onboard config api completes', function () {
      spyOn(this.Notification, 'success').and.callFake(function () {
        return true;
      });
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.$interval.flush(10002);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Failure', function () {
    it('should show error toaster if timed out', function () {
      spyOn(this.Notification, 'error').and.callFake(function () {
        return true;
      });
      this.$httpBackend.whenGET(urServiceUrl).respond(200);
      this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 30; i >= 0; i--) {
        this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        this.$interval.flush(10001);
      }
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(this.Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if backend API fails', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      this.$httpBackend.whenGET(urServiceUrl).respond(500);
      this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.flush();
      for (var i = 3; i >= 0; i--) {
        this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(500, {});
        this.$interval.flush(10001);
      }
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if onboardStatus is failure', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });
  });
});

describe('Partner managing other orgs: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, urServiceUrl, orgId, q;
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
        'SunlightConfigService', 'UrlConfig', 'URService');
      q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + orgId + '/queue/' + orgId;
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = this.$controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
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
    controller = sunlightChatConfigUrl = $intervalSpy = $scope = urServiceUrl = orgId = q = undefined;
  });

  it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    expect(controller).toBeDefined();
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should allow proceeding with next steps, if cs and aa are already onboarded', function () {
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(false);
  });

  it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
    this.$httpBackend.expectGET(urServiceUrl)
      .respond(200);
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Pending',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
  });

  it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Unknown',
        aaOnboardingStatus: 'Failure',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
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
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(controller.csOnboardingStatus).toBe(controller.status.SUCCESS);
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Partner managing his own org: Controller: Care Settings', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, $q;
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
    function () {
      this.injectDependencies('$controller', '$q', '$rootScope', '$httpBackend', 'Notification', '$interval',
        'Authinfo', 'SunlightConfigService', 'UrlConfig');
      $q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' +
        this.Authinfo.getOrgId() + '/chat';
      controller = this.$controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
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
    controller = sunlightChatConfigUrl = $intervalSpy = $scope = $q = undefined;
  });

  describe('CareSettings - Init', function () {
    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      expect(controller).toBeDefined();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.UNKNOWN,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should not allow proceeding with next steps, if cs and aa are already onboarded but apponboarding is UNKNOWN', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.UNKNOWN,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.PENDING,
        aaOnboardingStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
      controller.defaultQueueStatus = controller.status.SUCCESS;
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        aaOnboardingStatus: controller.status.PENDING,
        appOnboardStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Success', function () {
    it('should call the onboard config api and flash setup care button', function () {
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
      this.$interval.flush(10002);
      expect(controller.state).toBe(controller.IN_PROGRESS);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, after onboard config api completes', function () {
      spyOn(this.Notification, 'success').and.callFake(function () {
        return true;
      });
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: controller.status.SUCCESS,
        appOnboardStatus: controller.status.SUCCESS,
      };
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.$interval.flush(10002);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(false);
    });
  });

  describe('CareSettings - Setup Care - Failure', function () {
    it('should show error toaster if timed out', function () {
      spyOn(this.Notification, 'error').and.callFake(function () {
        return true;
      });
      this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      for (var i = 30; i >= 0; i--) {
        this.$httpBackend.whenGET(sunlightChatConfigUrl).respond(404, {});
        this.$interval.flush(10001);
      }
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(this.Notification.error).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
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
        this.$interval.flush(10001);
      }
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if failed to get status on loading', function () {
      expect(controller.state).toBe(controller.status.UNKNOWN);
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(403, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.status.UNKNOWN);
      expect($scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show error toaster if onboardStatus is failure', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.callFake(function () {
        return true;
      });
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      controller.defaultQueueStatus = controller.status.SUCCESS;
      controller.onboardToCare();
      $scope.$apply();
      this.$httpBackend.expectGET(sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(controller.state).toBe(controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect($scope.wizard.isNextDisabled).toBe(true);
    });
  });
});

describe('Partner managing his own org: Care Settings - when org has K2 entitlement', function () {
  var controller, sunlightChatConfigUrl, $intervalSpy, $scope, orgId, q;
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
        'SunlightConfigService', 'UrlConfig');
      q = this.$q;
      $scope = this.$rootScope.$new();
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = this.$controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
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
    controller = sunlightChatConfigUrl = $intervalSpy = $scope = orgId = q = undefined;
  });

  it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Unknown',
        aaOnboardingStatus: 'Unknown',
      });
    expect(controller).toBeDefined();
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should allow proceeding with next steps, if cs, app and aa are already onboarded', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.ONBOARDED);
    expect($scope.wizard.isNextDisabled).toBe(false);
  });

  it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
    expect($scope.wizard.isNextDisabled).toBe(true);
  });

  it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Pending',
        appOnboardStatus: 'Success',
        aaOnboardingStatus: 'Pending',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(controller.state).toBe(controller.IN_PROGRESS);
  });

  it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
    controller.defaultQueueStatus = controller.status.SUCCESS;
    this.$httpBackend.expectGET(sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: 'Success',
        appOnboardStatus: 'Pending',
        aaOnboardingStatus: 'Success',
      });
    expect(controller.state).toBe(controller.status.UNKNOWN);
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
    expect(controller.state).toBe(controller.status.UNKNOWN);
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
    controller.onboardToCare();
    $scope.$apply();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    expect(controller.state).toBe(controller.NOT_ONBOARDED);
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
  });
});

describe('Care Settings - when org is already onboarded', function () {
  var $intervalSpy, orgId, sunlightChatConfigUrl, controller, $scope, q;
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
      this.injectDependencies('$controller', '$httpBackend', '$interval', '$q', '$rootScope', 'Notification',
        'SunlightConfigService', 'UrlConfig');
      $intervalSpy = jasmine.createSpy('$interval', this.$interval).and.callThrough();
      q = this.$q;
      $scope = this.$rootScope.$new();
      $scope.wizard = {};
      $scope.wizard.isNextDisabled = false;
      orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
      sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + orgId + '/chat';
      controller = this.$controller('CareSettingsCtrl', {
        $scope: $scope,
        $interval: $intervalSpy,
        Notification: this.Notification,
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
    }
  );

  afterEach(function () {
    controller = sunlightChatConfigUrl = $intervalSpy = orgId = q = undefined;
  });

  it('should not show error notification and disable setup care button, if org is already onboarded', function () {
    spyOn(this.SunlightConfigService, 'onboardCareBot').and.callFake(function () {
      var deferred = q.defer();
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
});
