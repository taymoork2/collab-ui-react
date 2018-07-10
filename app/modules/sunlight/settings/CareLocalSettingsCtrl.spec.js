'use strict';

describe('CareLocalSettingsCtrl', function () {
  function initDependencies() {
    this.injectDependencies('$controller', '$httpBackend', '$interval', '$modal', '$q', '$scope', '$translate', 'AutoAttendantConfigService', 'Authinfo', 'ContextAdminAuthorizationService', 'FeatureToggleService', 'HuronConfig', 'Notification', 'SunlightConfigService', 'SunlightUtilitiesService', 'UrlConfig', 'URService');
    this.$scope.orgConfigForm = { dirty: false };
    this.orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    this.userOrgId = 'aeba1221-ab12-cd34-de56-abcdef123456';
    this.urServiceUrlRegEx = /qnr\/v1\/organization\/.*\/queue\/.*/;
    this.constants = {
      ONBOARDED: 'onboarded',
      NOT_ONBOARDED: 'notOnboarded',
      IN_PROGRESS: 'inProgress',
      AUTHORIZED: 'Authorized',
      UNAUTHORIZED: 'Unauthorized',
      NEEDS_MIGRATION: 'NeedsMigration',
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

  function initSpies(userOrgId, isCareVoice, isPartnerAdmin, dontSpyJwt) {
    spyOn(this.URService, 'createQueue').and.returnValue(this.$q.resolve('fake createQueue response'));
    spyOn(this.URService, 'updateQueue').and.returnValue(this.$q.resolve('fake updateQueue response'));
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.returnValue(this.$q.resolve('fake updateChatConfig response'));
    spyOn(this.SunlightConfigService, 'onBoardCare').and.returnValue(this.$q.resolve('fake onBoardCare response'));
    spyOn(this.SunlightConfigService, 'onboardCareBot').and.returnValue(this.$q.resolve('fake onboardCareBot response'));
    if (!dontSpyJwt) {
      spyOn(this.SunlightConfigService, 'onboardJwtApp').and.returnValue(this.$q.resolve('fake onboardJwtApp response'));
    }
    spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456');
    spyOn(this.Authinfo, 'getUserOrgId').and.returnValue(userOrgId);
    spyOn(this.Authinfo, 'getOrgName').and.returnValue('SunlightConfigService test org');
    spyOn(this.Authinfo, 'isCareVoice').and.returnValue(isCareVoice);
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(isCareVoice);
    spyOn(this, '$interval').and.callThrough();
    spyOn(this.$modal, 'open').and.returnValue({
      result: this.$q.resolve(),
    });
    spyOn(this.SunlightUtilitiesService, 'removeCareSetupKey').and.callFake(function () { });
    this.sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/chat';
    this.aaCSOnboardingUrl = this.HuronConfig.getCesUrl() + '/customers/' + this.Authinfo.getOrgId() + '/config/csOnboardingStatus';
    this.migrateOrgUrl = this.UrlConfig.getContextCcfsUrl() + '/migrate';
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
      initSpies.call(this, this.orgId, false, false);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    describe('CareSettings - Init (for admin user)', function () {
      it('should show enabled setup care button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        initController.call(this);
        expect(this.controller.state).toBe(this.constants.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.isCareSetUpInitialized).toBe(false);
        expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
        expect(this.$modal.open).not.toHaveBeenCalled();
      });

      it('should disable setup care, if already onboarded', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.constants.status.SUCCESS,
            appOnboardStatus: this.constants.status.SUCCESS,
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

  describe('For Admin user, Care Settings - when org has K1 entitlement', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, false, false);
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
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should disable setup care button, after onboarding is complete', function () {
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

    it('should not show error notification and disable setup care button, if org is already onboarded', function () {
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
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });

  describe('Admin logged in: Care Settings - when org has K1 entitlement - error case', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, false, false, true);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      var dummyResponse = { status: 202 };
      var promise = this.$q.resolve(dummyResponse);
      this.SunlightConfigService.onBoardCare.and.returnValue(promise);
      spyOn(this.SunlightConfigService, 'onboardJwtApp').and.returnValue(this.$q.reject('fake onboardJwtApp response'));
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

  describe('Admin logged in: Care Settings - when org has K1 entitlement', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, false, false);
      initAAFeatureToggleSpies.call(this, false, true);
    });

    it('should enable setup care button, when Org is not onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.UNKNOWN,
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
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
    });

    it('should disable setup care button, if all (cs, app) but jwt onboarding is unknown', function () {
      checkJwtCtrlState.call(this, this.constants.status.UNKNOWN, this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, if all (cs, app) but jwt onboarding is pending', function () {
      checkJwtCtrlState.call(this, this.constants.status.PENDING, this.constants.IN_PROGRESS);
    });

    it('should disable setup care button, if all (cs, app) but jwt onboarding is failure', function () {
      checkJwtCtrlState.call(this, this.constants.status.FAILURE, this.constants.NOT_ONBOARDED);
    });

    it('should enable setup care button, show error notification, if jwt onboard fails for admin', function () {
      this.SunlightConfigService.onBoardCare.and.returnValue(this.$q.resolve({ status: 202 }));
      this.SunlightConfigService.onboardJwtApp.and.returnValue(this.$q.reject({ status: 404 }));
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

    it('should enable setup care button, if any app onboarding is failure', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
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
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.SunlightUtilitiesService.removeCareSetupKey).toHaveBeenCalled();
      expect(this.SunlightConfigService.onboardJwtApp).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
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
      initSpies.call(this, this.orgId, false, false);
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

  describe('Synchronize Admin Authorization', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, true, false);

      this.$scope.isAdminAuthorized = false;
      this.$scope.synchronizeButtonTooltip = '';
      this.$scope.isSynchronizationInProgress = false;
    });

    function initSynchronizeAdminSpies(isFeatureEnabled, adminAuthorizationStatus) {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(isFeatureEnabled));
      spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue(this.$q.resolve(adminAuthorizationStatus));
    }

    it('should setup admin authorization status correctly when admin is authorized', function () {
      initSynchronizeAdminSpies.call(this, true, this.constants.AUTHORIZED);

      initController.call(this);

      expect(this.controller.isAdminAuthorized).toBe(true);
      expect(this.controller.synchronizeButtonTooltip).toEqual('');
    });

    it('should setup admin authorization status correctly when admin is unauthorized', function () {
      initSynchronizeAdminSpies.call(this, true, this.constants.UNAUTHORIZED);

      initController.call(this);

      expect(this.controller.isAdminAuthorized).toBe(false);
      expect(this.controller.synchronizeButtonTooltip).not.toEqual('');
    });

    it('should setup admin authorization status correctly when admin is unknown', function () {
      initSynchronizeAdminSpies.call(this, true, this.constants.status.UNKNOWN);

      initController.call(this);

      expect(this.controller.isAdminAuthorized).toBe(false);
      expect(this.controller.synchronizeButtonTooltip).not.toEqual('');
    });

    it('should disable synchronization when sync is in progress', function () {
      initSynchronizeAdminSpies.call(this, true, this.constants.AUTHORIZED);
      initController.call(this);

      this.controller.isSynchronizationInProgress = true;
      this.controller.isAdminAuthorized = true;
    });

    it('should disable synchronization when admin is not authorized', function () {
      initSynchronizeAdminSpies.call(this, true, this.constants.UNAUTHORIZED);
      initController.call(this);

      this.controller.isSynchronizationInProgress = false;
      this.controller.isAdminAuthorized = false;
      expect(this.controller.isSynchronizationDisabled()).toBe(true);
    });

    it('should show success notification when synchronization is successful', function (done) {
      initSynchronizeAdminSpies.call(this, true, this.constants.AUTHORIZED);
      spyOn(this.ContextAdminAuthorizationService, 'synchronizeAdmins').and.returnValue(this.$q.resolve());
      spyOn(this.$translate, 'instant').and.callThrough();
      spyOn(this.Notification, 'success');
      initController.call(this);
      this.controller.isSynchronizationInProgress = true;
      this.controller.synchronize();
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalledWith('context.dictionary.settingPage.synchronizationSuccessful');
      expect(this.controller.isSynchronizationInProgress).toBe(false);
      done();
    });

    it('should show error notification when synchronization has failed', function (done) {
      initSynchronizeAdminSpies.call(this, true, this.constants.AUTHORIZED);
      spyOn(this.ContextAdminAuthorizationService, 'synchronizeAdmins').and.returnValue(this.$q.reject());
      spyOn(this.$translate, 'instant').and.callThrough();
      spyOn(this.Notification, 'error');
      initController.call(this);
      this.controller.isSynchronizationInProgress = true;
      this.controller.synchronize();
      this.$scope.$apply();
      expect(this.Notification.error).toHaveBeenCalledWith('context.dictionary.settingPage.synchronizationFailure');
      expect(this.controller.isSynchronizationInProgress).toBe(false);
      done();
    });
  });

  describe('Admin Migration for an org', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.orgId, true, false);
    });

    function initMigrationAdminSpies(isFeatureEnabled, isMigrationNeeded) {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(isFeatureEnabled));
      spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(isMigrationNeeded));
    }

    it('should not enable setup care, if migration is not needed for the org ', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, false, false);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should enable setup care, if feature flag is enabled and migration is needed for the org ', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
    });

    it('should not enable setup care, if isMigrationNeeded  is false ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(false));
      spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue(this.$q.resolve(this.constants.AUTHORIZED));
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
    });

    it('should  call migrateOrganization when setup care is done for is migration needed org ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'migrateOrganization').and.returnValue(this.$q.resolve());
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,

        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.IN_PROGRESS);
      expect(this.ContextAdminAuthorizationService.migrateOrganization).toHaveBeenCalled();
    });

    it('should  throw toaster notification if migrateOrganization fails', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      spyOn(this.ContextAdminAuthorizationService, 'migrateOrganization').and.returnValue(this.$q.reject('fake migration response'));
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
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

  describe('Partner Migration for an org', function () {
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(initDependencies);
    beforeEach(function () {
      initSpies.call(this, this.userOrgId, true, true);
    });

    function initMigrationAdminSpies(isFeatureEnabled, isMigrationNeeded) {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(isFeatureEnabled));
      spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(isMigrationNeeded));
    }

    it('should show careNotSetup modal for partner, if Org is not onboarded.', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      initMigrationAdminSpies.call(this, false, false);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.isCareSetUpInitialized).toBe(false);
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('should not enable setup care, if all app onboarding is success and migration is not needed', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, false, false);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.isCareSetUpInitialized).toBe(true);
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      expect(this.$modal.open).not.toHaveBeenCalled();
    });

    it('should enable setup care, if all app onboarding success but migration is required', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, false, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      expect(this.$modal.open).toHaveBeenCalled();
    });

    it('should  call migrateOrganization when setup care is done for is migration needed org ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'migrateOrganization').and.returnValue(this.$q.resolve());
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.constants.NOT_ONBOARDED);
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrlRegEx)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.UNKNOWN,
          jwtAppOnboardingStatus: this.constants.status.UNKNOWN,
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.ContextAdminAuthorizationService.migrateOrganization).toHaveBeenCalled();
    });

    it('should  throw toaster notification if migrateOrganization fails', function () {
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      spyOn(this.ContextAdminAuthorizationService, 'migrateOrganization').and.returnValue(this.$q.reject('fake migration response'));
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: this.constants.status.SUCCESS,
          appOnboardStatus: this.constants.status.SUCCESS,
          jwtAppOnboardingStatus: this.constants.status.SUCCESS,
        });
      initMigrationAdminSpies.call(this, true, true);
      initController.call(this);
      this.controller.defaultQueueStatus = this.constants.status.SUCCESS;
      expect(this.controller.state).toBe(this.constants.ONBOARDED);
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
});
