'use strict';

describe('CareSettingsCtrl', function () {
  function initDependencies() {
    this.injectDependencies('$controller', '$httpBackend', '$interval', '$q', '$scope', 'Authinfo', 'AutoAttendantConfigService', 'FeatureToggleService', 'Notification', 'HuronConfig', 'SunlightConfigService', 'UrlConfig', 'URService');
    this.$scope.wizard = {};
    this.$scope.wizard.isNextDisabled = false;
    this.orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    this.userOrgId = 'aeba1221-ab12-cd34-de56-abcdef123456';
    this.urServiceUrlRegEx = /qnr\/v1\/organization\/.*\/queue\/.*/;
    this.constants = {
      ONBOARDED: 'onboarded',
      NOT_ONBOARDED: 'notOnboarded',
      IN_PROGRESS: 'inProgress',
    };
    this.constants.status = {
      UNKNOWN: 'Unknown',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
      INITIALIZING: 'Initializing',
    };
  }

  function initSpies(userOrgId, isCareVoice) {
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.returnValue(this.$q.resolve('fake updateChatConfig response'));
    spyOn(this.SunlightConfigService, 'onBoardCare').and.returnValue(this.$q.resolve('fake onBoardCare response'));
    spyOn(this.SunlightConfigService, 'onboardCareBot').and.returnValue(this.$q.resolve('fake onboardCareBot response'));
    spyOn(this.SunlightConfigService, 'onboardJwtApp').and.returnValue(this.$q.resolve('fake onboardJwtApp response'));
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456');
    spyOn(this.Authinfo, 'getUserOrgId').and.returnValue(userOrgId);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue('SunlightConfigService test org');
    spyOn(this.Authinfo, 'isCareVoice').and.returnValue(isCareVoice);
    spyOn(this.Notification, 'errorWithTrackingId');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.$interval, 'cancel');

    this.sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/chat';
    this.aaCSOnboardingUrl = this.HuronConfig.getCesUrl() + '/customers/' + this.Authinfo.getOrgId() + '/config/csOnboardingStatus';

    this.$httpBackend.whenGET(this.urServiceUrlRegEx).respond(200, {
      defaultQueueStatus: this.constants.status.SUCCESS,
    });
  }

  function initAAFeatureToggleSpies(isFeatureToggleEnable, shouldResolve) {
    var ngq = this.$q;
    spyOn(this.FeatureToggleService, 'supports').and.callFake(function () {
      if (shouldResolve) {
        return ngq.resolve(isFeatureToggleEnable);
      }
      return ngq.reject();
    });
  }

  function initController(_controllerLocals) {
    var controllerLocals = _.assignIn({}, {
      $scope: this.$scope,
      $interval: this.$interval,
      Notification: this.Notification,
    }, _controllerLocals);

    this.initController('CareSettingsCtrl', { controllerLocals: controllerLocals });
  }

  function checkJwtCtrlState(jwtState, expectedState, nextDisabled) {
    this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        aaOnboardingStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: jwtState,
      });
    initController.call(this);
    this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
    expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
    this.$httpBackend.flush();
    expect(this.controller.state).toBe(expectedState);
    expect(this.$scope.wizard.isNextDisabled).toBe(nextDisabled);
  }

  function checkJwtONboardingFailure() {
    this.SunlightConfigService.onBoardCare.and.returnValue(this.$q.resolve({ status: 202 }));
    this.$httpBackend.expectGET(this.urServiceUrlRegEx).respond(404);
    this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404);
    initController.call(this);
    this.$httpBackend.flush();

    this.SunlightConfigService.onboardJwtApp.and.returnValue(this.$q.reject({ status: 404 }));
    spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
    expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
    this.controller.onboardToCare();
    this.$scope.$apply();
    expect(this.controller.csOnboardingStatus).toBe(this.constants.status.SUCCESS);
    expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
    expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
  }

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Partner managing other orgs: Controller: Care Settings', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.userOrgId, false);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    describe('CareSettings - Init', function () {
      it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        spyOn(this.URService, 'getQueue').and.returnValue(this.$q.resolve('fake getQueue response'));
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        spyOn(this.URService, 'getQueue').and.returnValue(this.$q.resolve('fake getQueue response'));
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show enabled setup care button and disabled next button, if default sunlight queue is not created', function () {
        this.$httpBackend.expectGET(this.urServiceUrlRegEx).respond(404);
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, if queue is created, cs and aa are already onboarded', function () {
        var getQueueResponse = {
          defaultQueueStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.urServiceUrlRegEx).respond(200, getQueueResponse);
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });

      it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
        var getQueueResponse = {
          defaultQueueStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.urServiceUrlRegEx).respond(200, getQueueResponse);
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.PENDING,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
        var getQueueResponse = {
          defaultQueueStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.urServiceUrlRegEx).respond(200, getQueueResponse);
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });

      it('should allow proceeding with next steps- if jwt fails ', function () {
        checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.ONBOARDED, false);
      });

      it('should allow proceeding with next steps- if jwt Unknown ', function () {
        checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.ONBOARDED, false);
      });

      it('should allow proceeding with next steps- if jwt pending ', function () {
        checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.ONBOARDED, false);
      });

      it('should allow proceeding with next steps- if jwt success ', function () {
        checkJwtCtrlState.call(this, this.constants.status.SUCCESS, this.constants.ONBOARDED, false);
      });
    });

    describe('CareSettings - Setup Care - Success', function () {
      beforeEach(function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
      });

      it('should call the onboard config api and flash setup care button', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, {
          csOnboardingStatus: 'Pending',
        });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, after onboard config api completes', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardStatus: this.constants.status.SUCCESS,
        });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.SunlightConfigService.onboardJwtApp).not.toHaveBeenCalled();
        expect(this.Notification.success).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Failure', function () {
      it('should show error toaster if timed out', function () {
        this.$httpBackend.whenGET(this.urServiceUrlRegEx).respond(200);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 30; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.Notification.error).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if backend API fails', function () {
        this.$httpBackend.whenGET(this.urServiceUrlRegEx).respond(500);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.flush();
        for (var i = 3; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, if failed to get status on loading', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(403, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if onboardStatus is failure', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
        this.$interval.flush(10001);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });
    });
  });

  describe('Partner managing other orgs: Care Settings - when org has K2 entitlement', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.userOrgId, true);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if cs and aa are already onboarded', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should allow proceeding with next steps, if cs, app, aa are already onboarded', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx).respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.PENDING,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.PENDING,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should show loading animation on setup care button, if jwtAppOnboardStatus is pending', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.PENDING,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.FAILURE,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.SunlightConfigService.onboardJwtApp).not.toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      var dummyResponse = { status: 202 };
      var promise = this.$q.resolve(dummyResponse);
      this.SunlightConfigService.onBoardCare.and.returnValue(promise);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);

      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.controller.csOnboardingStatus).toBe(this.constants.status.SUCCESS);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should allow proceeding with next steps- if jwt fails ', function () {
      checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.ONBOARDED, false);
    });

    it('should allow proceeding with next steps- if jwt Unknown ', function () {
      checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.ONBOARDED, false);
    });

    it('should allow proceeding with next steps- if jwt pending ', function () {
      checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.ONBOARDED, false);
    });
  });

  describe('Partner managing his own org: Controller: Care Settings', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, false);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    describe('CareSettings - Init', function () {
      it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should not allow proceeding with next steps, if cs and aa are already onboarded but apponboarding is UNKNOWN', function () {
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should not allow proceeding with next steps- if jwt fails ', function () {
        checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.NOT_ONBOARDED, true);
      });

      it('should not allow proceeding with next steps- if jwt Unknown ', function () {
        checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.NOT_ONBOARDED, true);
      });

      it('should not allow proceeding with next steps- if jwt pending ', function () {
        checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.IN_PROGRESS, true);
      });

      it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.PENDING,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Success', function () {
      it('should call the onboard config api and flash setup care button', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, after onboard config api completes', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        var chatConfigResponse = {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
        expect(this.Notification.success).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Failure', function () {
      it('should enable setup care button, show error notification, if jwt onboard fails for admin', function () {
        checkJwtONboardingFailure.call(this);
      });

      it('should show error toaster if timed out', function () {
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 30; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.Notification.error).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if backend API fails', function () {
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 3; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, if failed to get status on loading', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(403, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if onboardStatus is failure', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
        this.$interval.flush(10001);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });
    });
  });

  describe('Partner managing his own org: Care Settings - when org has K2 entitlement', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, true);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if cs, app and aa are already onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.PENDING,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.PENDING,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.FAILURE,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.onboardToCare();
      this.$scope.$apply();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should not allow proceeding with next steps- if jwt fails ', function () {
      checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.NOT_ONBOARDED, true);
    });

    it('should not allow proceeding with next steps- if jwt Unknown ', function () {
      checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.NOT_ONBOARDED, true);
    });

    it('should not allow proceeding with next steps- if jwt pending ', function () {
      checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.IN_PROGRESS, true);
    });

    it('should enable setup care button, show error notification, if jwt onboard fails for admin', function () {
      checkJwtONboardingFailure.call(this);
    });
  });

  describe('Care Settings - when org is already onboarded', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, true);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    it('should not show error notification and disable setup care button, if org is already onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.SunlightConfigService.onboardCareBot = jasmine.createSpy('onboardCareBot').and.returnValue(this.$q.reject({ status: 412 }));
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });

  describe('AA CS Onboarding ', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle error condition', function () {
      initAAFeatureToggleSpies.call(this, true, false);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle resolve, AA Config not set', function () {
      initAAFeatureToggleSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle resolve, AA Config returning 404', function () {
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve('fake response'));
      initAAFeatureToggleSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle resolve, AA Config returning 200', function () {
      var fakeResponse = {
        data: {
          csOnboardingStatus: this.constants.status.SUCCESS,
        },
      };
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      initAAFeatureToggleSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle resolve, AA Config returning 200 with invalid response', function () {
      var fakeResponse = {
        data: {
          aaOnboardingStatus: this.constants.status.SUCCESS,
        },
      };
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      initAAFeatureToggleSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });
  });

  describe('AA CS OnBoard To Care ', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, false);
    });
    it('should check for AA Onboarding, if CS is already Onboarded', function () {
      var fakeResponse = {
        data: {
          csOnboardingStatus: this.constants.status.SUCCESS,
        },
      };
      var cesPostResponse = {
        status: 204,
      };
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      initAAFeatureToggleSpies.call(this, true, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: this.constants.status.SUCCESS,
        aaOnboardStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: this.constants.status.SUCCESS,
      };
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should check for AA and CS Onboarding, if CS and AA is already Onboarded', function () {
      var cesPostResponse = {
        status: 226,
      };
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      initAAFeatureToggleSpies.call(this, true, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: this.constants.status.SUCCESS,
        aaOnboardStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: this.constants.status.SUCCESS,
      };
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.$interval.flush(10002);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });
  });
  describe('AA CS OnBoard To Care ', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, false);
    });
    it('should check for AA Onboarding, if CS is already Onboarded and catch is encountered for get', function () {
      var cesPostResponse = {
        status: 204,
      };
      var ngq = this.$q;
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.callFake(function () {
        return ngq.reject({
          statusText: 'server error',
          status: 500,
        });
      });
      initAAFeatureToggleSpies.call(this, true, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: this.constants.status.SUCCESS,
        aaOnboardStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: this.constants.status.SUCCESS,
      };
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.controller.errorCount = 3;
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });
    it('should check for AA Onboarding, if CS is already Onboarded and failure occurs', function () {
      var fakeResponse = {
        data: {
          csOnboardingStatus: this.constants.status.FAILURE,
        },
      };
      var cesPostResponse = {
        status: 204,
      };
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      initAAFeatureToggleSpies.call(this, true, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: this.constants.status.SUCCESS,
        aaOnboardStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: this.constants.status.SUCCESS,
      };
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
    it('should check for AA Onboarding, if CS is already Onboarded and progress is the current status', function () {
      var fakeResponse = {
        data: {
          csOnboardingStatus: this.constants.status.INITIALIZING,
        },
      };
      var cesPostResponse = {
        status: 204,
      };
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      initAAFeatureToggleSpies.call(this, true, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: this.constants.status.SUCCESS,
        aaOnboardStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: this.constants.status.SUCCESS,
      };
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.AutoAttendantConfigService.cesOnboard).toHaveBeenCalled();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });
    it('should check for AA Onboarding, if CS is already Onboarded and catch is encountered for post', function () {
      var fakeResponse = {
        data: {
          csOnboardingStatus: this.constants.status.INITIALIZING,
        },
      };
      var ngq = this.$q;
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.callFake(function () {
        return ngq.reject({
          statusText: 'server error',
          status: 500,
        });
      });
      initAAFeatureToggleSpies.call(this, true, true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      var chatConfigResponse = {
        csOnboardingStatus: this.constants.status.SUCCESS,
        aaOnboardStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: this.constants.status.SUCCESS,
      };
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });
  });
});
