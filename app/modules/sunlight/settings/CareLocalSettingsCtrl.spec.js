'use strict';

describe('CareLocalSettingsCtrl', function () {
  function initDependencies() {
    this.injectDependencies('$controller', '$httpBackend', '$interval', '$q', '$scope', 'AutoAttendantConfigService', 'Authinfo', 'FeatureToggleService', 'HuronConfig', 'Notification', 'SunlightConfigService', 'SunlightUtilitiesService', 'UrlConfig', 'URService');
    this.$scope.orgConfigForm = { dirty: false };
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
    this.constants.RoutingType = {
      PICK: 'pick',
      PUSH: 'push',
    };
  }

  function initSpies(userOrgId, isCareVoice) {
    spyOn(this.URService, 'createQueue').and.returnValue(this.$q.resolve('fake createQueue response'));
    spyOn(this.URService, 'updateQueue').and.returnValue(this.$q.resolve('fake updateQueue response'));
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.returnValue(this.$q.resolve('fake updateChatConfig response'));
    spyOn(this.SunlightConfigService, 'onBoardCare').and.returnValue(this.$q.resolve('fake onBoardCare response'));
    spyOn(this.SunlightConfigService, 'onboardCareBot').and.returnValue(this.$q.resolve('fake onboardCareBot response'));
    spyOn(this.SunlightConfigService, 'onboardJwtApp').and.returnValue(this.$q.resolve('fake onboardJwtApp response'));
    spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456');
    spyOn(this.Authinfo, 'getUserOrgId').and.returnValue(userOrgId);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue('SunlightConfigService test org');
    spyOn(this.Authinfo, 'isCareVoice').and.returnValue(isCareVoice);
    spyOn(this, '$interval').and.callThrough();
    spyOn(this.SunlightUtilitiesService, 'removeCareSetupKey').and.callFake(function () { });
    this.sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/chat';
    this.aaCSOnboardingUrl = this.HuronConfig.getCesUrl() + '/customers/' + this.Authinfo.getOrgId() + '/config/csOnboardingStatus';
  }

  function initAAFeatureToggleSpies(isFeatureToggleEnable, shouldResolve) {
    if (shouldResolve) {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(isFeatureToggleEnable));
    } else {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.reject());
    }
  }

  function initController(_controllerLocals) {
    var controllerLocals = _.assignIn({}, {
      $element: {
        find: function (locator) {
          expect(locator).toEqual(jasmine.any(String));
          return {
            focus: _.noop,
          };
        },
      },
      $scope: this.$scope,
      $interval: this.$interval,
      Notification: this.Notification,
    }, _controllerLocals);

    this.initController('CareLocalSettingsCtrl', { controllerLocals: controllerLocals });
  }

  function checkJwtCtrlState(jwtState, expectedState) {
    this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
      .respond(200, {
        csOnboardingStatus: this.constants.status.SUCCESS,
        appOnboardStatus: this.constants.status.SUCCESS,
        aaOnboardingStatus: this.constants.status.SUCCESS,
        jwtAppOnboardingStatus: jwtState,
      });
    initController.call(this);
    this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
    expect(this.controller.state).toBe(this.constants.ONBOARDED);
    this.$httpBackend.flush();
    expect(this.controller.state).toBe(expectedState);
  }

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Controller: Care Local Settings', function () {
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

    describe('CareSettings - Init (for admin user)', function () {
      it('should show enabled setup care button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      });

      it('should disable setup care, if already onboarded', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.SUCCESS,
            appOnboardStatus: this.constants.status.SUCCESS,
            aaOnboardingStatus: this.constants.status.SUCCESS,
            jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          });
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
      });

      it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.PENDING,
          });
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
      });

      it('should call updateChatConfig, if already onboarded and orgName is not present', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.SUCCESS,
            appOnboardStatus: this.constants.status.SUCCESS,
            jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          });
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.SunlightConfigService.updateChatConfig).toHaveBeenCalled();
      });

      it('should call updateChatConfig, if already onboarded and orgName is empty', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.SUCCESS,
            appOnboardStatus: this.constants.status.SUCCESS,
            jwtAppOnboardingStatus: this.constants.status.SUCCESS,
            orgName: '',
          });
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.SunlightConfigService.updateChatConfig).toHaveBeenCalled();
      });

      it('should not call updateChatConfig, if already onboarded and orgName is present', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.SUCCESS,
            appOnboardStatus: this.constants.status.SUCCESS,
            orgName: 'fake org name',
          });
        initController.call(this);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.$httpBackend.flush();
        expect(this.SunlightConfigService.updateChatConfig).not.toHaveBeenCalled();
      });
    });

    describe('CareSettings - Setup Care - Success', function () {
      it('should call the onboard config api and flash setup care button', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: this.constants.status.PENDING });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
      });

      it('should disable setup care button, after ccfs tab completes onboarding', function () {
        spyOn(this.Notification, 'success').and.returnValue(true);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.urServiceUrlRegEx)
          .respond(200, this.queueDetails);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.SUCCESS,
            appOnboardStatus: this.constants.status.SUCCESS,
            jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          });
        this.$interval.flush(10001);
        this.$httpBackend.flush();
        expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
        expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        expect(this.Notification.success).toHaveBeenCalled();
      });
    });

    describe('CareSettings - Setup Care - Failure', function () {
      it('should show error toaster if timed out', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        this.$httpBackend.flush();
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 30; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
          this.$interval.flush(10000);
        }
        this.$httpBackend.flush();
        expect(this.SunlightUtilitiesService.removeCareSetupKey).not.toHaveBeenCalled();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      });

      it('should show error toaster if backend API fails', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
        initController.call(this);
        this.$httpBackend.flush();
        this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 3; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
          this.$interval.flush(10000);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.SunlightUtilitiesService.removeCareSetupKey).not.toHaveBeenCalled();
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      });

      it('should disable setup care button, if failed to get status on loading', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(403, {});
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
      });
    });
  });

  describe('For Admin user, Care Settings - when org has K2 entitlement', function () {
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

    it('should enable setup care button, when Org is not onboarded', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.PENDING,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.FAILURE,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should not show error notification and disable setup care button, if org is already onboarded', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject({ status: 412 }));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
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
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).not.toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Partner Logged in as org admin: Care Settings - when org has K2 entitlement', function () {
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

    it('should enable setup care button, when Org is not onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.UNKNOWN,
        });

      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is unknown', function () {
      checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.ONBOARDED);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is pending', function () {
      checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.ONBOARDED);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is success', function () {
      checkJwtCtrlState.call(this, this.constants.status.SUCCESS, this.constants.ONBOARDED);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is failure', function () {
      checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.PENDING,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.PENDING,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.FAILURE,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).not.toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).not.toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Admin logged in: Care Settings - when org has K2 entitlement', function () {
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

    it('should enable setup care button, when Org is not onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.UNKNOWN,
          aaOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should enable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.PENDING,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is unknown', function () {
      checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is pending', function () {
      checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.IN_PROGRESS);
    });

    it('should disable setup care button, if all (cs, aa, app) but jwt onboarding is failure', function () {
      checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.NOT_ONBOARDED);
    });

    it('should enable setup care button, show error notification, if jwt onboard fails for admin', function () {
      this.SunlightConfigService.onBoardCare.and.returnValue(this.$q.resolve({ status: 202 }));
      this.SunlightConfigService.onboardJwtApp.and.returnValue(this.$q.reject({ status: 404 }));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      expect(this.controller.csOnboardingStatus).toBe(this.constants.status.SUCCESS);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).not.toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.PENDING,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
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
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
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
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      var dummyResponse = { status: 202 };
      var promise = this.$q.resolve(dummyResponse);
      this.SunlightConfigService.onBoardCare.and.returnValue(promise);
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      expect(this.controller.csOnboardingStatus).toBe(this.constants.status.SUCCESS);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).not.toHaveBeenCalled();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Care Settings - Routing Toggling', function () {
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
    beforeEach(
      function () {
        this.$scope.orgConfigForm = {
          dirty: false,
          $setPristine: _.noop,
          $setUntouched: _.noop,
        };
      });

    it('should show the saved org chat configurations as selected.', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { maxChatCount: 4, videoCallEnabled: true });
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.constants.RoutingType.PICK);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(4);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
    });

    it('should show the saved routing type as selected.', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, { routingType: 'push' });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.$httpBackend.flush();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.constants.RoutingType.PUSH);
    });

    it('should show success toaster if update of orgChatConfig backend API is a success', function () {
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, { maxChatCount: 4, videoCallEnabled: true });
      initController.call(this);
      this.$httpBackend.flush();
      this.controller.isProcessing = true;
      this.controller.saveOrgChatConfigurations();
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.constants.RoutingType.PICK);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(4);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
      expect(this.controller.isProcessing).toBe(false);
    });

    it('should show failure toaster if org chat config update backend API fails', function () {
      this.SunlightConfigService.updateChatConfig = jasmine.createSpy().and.returnValue(this.$q.reject('fake updateChatConfig response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, { routingType: 'push' });
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, { maxChatCount: 3, videoCallEnabled: false });
      initController.call(this);
      this.controller.queueConfig.selectedRouting = this.constants.RoutingType.PICK;
      this.controller.orgChatConfig.selectedChatCount = 4;
      this.controller.orgChatConfig.selectedVideoInChatToggle = true;
      this.$httpBackend.flush();
      this.controller.saveQueueConfigurations();
      this.controller.saveOrgChatConfigurations();
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect(this.controller.isProcessing).toBe(false);
      expect(this.controller.queueConfig.selectedRouting).toBe(this.constants.RoutingType.PUSH);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(3);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
    });

    it('should reset form if modification made is cancelled', function () {
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, { routingType: 'push' });
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, { maxChatCount: 5, videoCallEnabled: false });
      initController.call(this);
      this.controller.queueConfig.selectedRouting = this.constants.RoutingType.PICK;
      this.controller.orgChatConfig.selectedChatCount = 4;
      this.controller.orgChatConfig.selectedVideoInChatToggle = true;
      this.$httpBackend.flush();
      this.controller.savedRoutingType = this.constants.RoutingType.PUSH;
      this.controller.cancelEdit();
      this.$scope.$apply();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.constants.RoutingType.PUSH);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(5);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
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
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        });
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle error condition', function () {
      initAAFeatureToggleSpies.call(this, true, false);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle resolve, AA Config not set', function () {
      initAAFeatureToggleSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should check for CS onboarding for AA, if cs, app and aa are already onboarded, AA Feature Toggle resolve, AA Config returning 404', function () {
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve('fake response'));
      initAAFeatureToggleSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
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
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
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
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
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
      initAAFeatureToggleSpies.call(this, true, true);
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      spyOn(this.Notification, 'success').and.returnValue(true);
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.AutoAttendantConfigService.cesOnboard).toHaveBeenCalled();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should check for AA and CS Onboarding, if CS and AA is already Onboarded', function () {
      var cesPostResponse = {
        status: 226,
      };
      initAAFeatureToggleSpies.call(this, true, true);
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      spyOn(this.Notification, 'success').and.returnValue(true);
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.AutoAttendantConfigService.cesOnboard).toHaveBeenCalled();
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
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
        });
    });

    it('should check for AA Onboarding, if CS is already Onboarded and catch is encountered for get', function () {
      var cesPostResponse = {
        status: 204,
      };
      initAAFeatureToggleSpies.call(this, true, true);
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.controller.errorCount = 3;
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
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
      initAAFeatureToggleSpies.call(this, true, true);
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.AutoAttendantConfigService.cesOnboard).toHaveBeenCalled();
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
      initAAFeatureToggleSpies.call(this, true, true);
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.resolve(cesPostResponse));
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.AutoAttendantConfigService.cesOnboard).toHaveBeenCalled();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });
    it('should check for AA Onboarding, if CS is already Onboarded and catch is encountered for post', function () {
      var fakeResponse = {
        data: {
          csOnboardingStatus: this.constants.status.SUCCESS,
        },
      };
      initAAFeatureToggleSpies.call(this, true, true);
      spyOn(this.AutoAttendantConfigService, 'getCSConfig').and.returnValue(this.$q.resolve(fakeResponse));
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.AutoAttendantConfigService, 'cesOnboard').and.returnValue(this.$q.reject({
        statusText: 'server error',
        status: 500,
      }));
      initController.call(this);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          aaOnboardingStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      this.controller.sunlightOnboardingState = this.constants.ONBOARDED;
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      this.controller.errorCount = 3;
      this.$scope.$apply();
      this.$interval.flush(10001);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });
  });
});
