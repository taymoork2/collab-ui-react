'use strict';

describe('CareSettingsCtrl', function () {
  function initDependencies() {
    this.injectDependencies('$controller', '$httpBackend', '$interval', '$q', '$scope', 'Authinfo', 'Notification', 'SunlightConfigService', 'UrlConfig', 'URService');
    this.$scope.wizard = {};
    this.$scope.wizard.isNextDisabled = false;
    this.orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    this.urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + this.orgId + '/queue/' + this.orgId;
    this.sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' +
      this.Authinfo.getOrgId() + '/chat';
    this.controller = this.$controller('CareSettingsCtrl', {
      $scope: this.$scope,
      $interval: jasmine.createSpy('$interval', this.$interval).and.callThrough(),
      Notification: this.Notification,
    });
  }

  function initSpies() {
    spyOn(this.URService, 'getQueue').and.returnValue(this.$q.resolve('fake getQueue response'));
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.returnValue(this.$q.resolve('fake updateChatConfig response'));
    spyOn(this.SunlightConfigService, 'onBoardCare').and.returnValue(this.$q.resolve('fake onBoardCare response'));
    spyOn(this.SunlightConfigService, 'onboardCareBot').and.returnValue(this.$q.resolve('fake onboardCareBot response'));
  }

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Partner managing other orgs: Controller: Care Settings', function () {
    var spiedAuthinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('aeba1221-ab12-cd34-de56-abcdef123456'),
      getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
      isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(false),
    };
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(angular.mock.module(function ($provide) {
      $provide.value('Authinfo', spiedAuthinfo);
    }));
    beforeEach(initDependencies);
    beforeEach(initSpies);

    describe('CareSettings - Init', function () {
      it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.UNKNOWN,
          aaOnboardingStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show enabled setup care button and disabled next button, if default sunlight queue is not created', function () {
        this.$httpBackend.expectGET(this.urServiceUrl).respond(404);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, if queue is created, cs and aa are already onboarded', function () {
        var getQueueResponse = {
          defaultQueueStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.urServiceUrl).respond(200, getQueueResponse);
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.SUCCESS,
          aaOnboardingStatus: this.controller.status.SUCCESS,
          appOnboardStatus: this.controller.status.UNKNOWN,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });

      it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
        var getQueueResponse = {
          defaultQueueStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.urServiceUrl).respond(200, getQueueResponse);
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.PENDING,
          aaOnboardingStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
        var getQueueResponse = {
          defaultQueueStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.urServiceUrl).respond(200, getQueueResponse);
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.SUCCESS,
          aaOnboardingStatus: this.controller.status.PENDING,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Success', function () {
      it('should call the onboard config api and flash setup care button', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, after onboard config api completes', function () {
        spyOn(this.Notification, 'success').and.returnValue(true);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.SUCCESS,
          aaOnboardStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.Notification.success).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Failure', function () {
      it('should show error toaster if timed out', function () {
        spyOn(this.Notification, 'error').and.returnValue(true);
        this.$httpBackend.whenGET(this.urServiceUrl).respond(200);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 30; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.Notification.error).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if backend API fails', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.whenGET(this.urServiceUrl).respond(500);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.flush();
        for (var i = 3; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, if failed to get status on loading', function () {
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(403, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if onboardStatus is failure', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
        this.$interval.flush(10001);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });
    });
  });

  describe('Partner managing other orgs: Care Settings - when org has K2 entitlement', function () {
    var spiedAuthinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('aeba1221-ab12-cd34-de56-abcdef123456'),
      getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
      isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(true),
    };
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(angular.mock.module(function ($provide) {
      $provide.value('Authinfo', spiedAuthinfo);
    }));
    beforeEach(initDependencies);
    beforeEach(initSpies);

    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Unknown',
          aaOnboardingStatus: 'Unknown',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if cs and aa are already onboarded', function () {
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Pending',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Pending',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Failure',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Success',
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      var dummyResponse = { status: 202 };
      var promise = this.$q.resolve(dummyResponse);
      this.SunlightConfigService.onBoardCare.and.returnValue(promise);
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.controller.csOnboardingStatus).toBe(this.controller.status.SUCCESS);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Partner managing his own org: Controller: Care Settings', function () {
    var spiedAuthinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
      isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(false),
    };
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(angular.mock.module(function ($provide) {
      $provide.value('Authinfo', spiedAuthinfo);
    }));
    beforeEach(initDependencies);
    beforeEach(initSpies);

    describe('CareSettings - Init', function () {
      it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('show enabled setup care button and disabled next button, if onboarded status is UNKNOWN', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.UNKNOWN,
          aaOnboardingStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should not allow proceeding with next steps, if cs and aa are already onboarded but apponboarding is UNKNOWN', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.SUCCESS,
          aaOnboardingStatus: this.controller.status.SUCCESS,
          appOnboardStatus: this.controller.status.UNKNOWN,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show loading and disabled next button, if csOnboardingStatus is Pending ', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.PENDING,
          aaOnboardingStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show loading and enable next button, if aaOnboardStatus is Pending because isCareVoice is false ', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.SUCCESS,
          aaOnboardingStatus: this.controller.status.PENDING,
          appOnboardStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Success', function () {
      it('should call the onboard config api and flash setup care button', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, after onboard config api completes', function () {
        spyOn(this.Notification, 'success').and.returnValue(true);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        var chatConfigResponse = {
          csOnboardingStatus: this.controller.status.SUCCESS,
          appOnboardStatus: this.controller.status.SUCCESS,
        };
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, chatConfigResponse);
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.Notification.success).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(false);
      });
    });

    describe('CareSettings - Setup Care - Failure', function () {
      it('should show error toaster if timed out', function () {
        spyOn(this.Notification, 'error').and.returnValue(true);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 30; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.Notification.error).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if backend API fails', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 3; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
          this.$interval.flush(10001);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should allow proceeding with next steps, if failed to get status on loading', function () {
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(403, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });

      it('should show error toaster if onboardStatus is failure', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Failure' });
        this.$interval.flush(10001);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(this.$scope.wizard.isNextDisabled).toBe(true);
      });
    });
  });

  describe('Partner managing his own org: Care Settings - when org has K2 entitlement', function () {
    var spiedAuthinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
      isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(true),
    };
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(angular.mock.module(function ($provide) {
      $provide.value('Authinfo', spiedAuthinfo);
    }));
    beforeEach(initDependencies);
    beforeEach(initSpies);

    it('should show enabled setup care button and disabled next button, if Org is not onboarded already.', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Unknown',
          aaOnboardingStatus: 'Unknown',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should allow proceeding with next steps, if cs, app and aa are already onboarded', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      expect(this.$scope.wizard.isNextDisabled).toBe(false);
    });

    it('should show loading and disabled next button, if aaOnboardingStatus is Pending ', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
      expect(this.$scope.wizard.isNextDisabled).toBe(true);
    });

    it('should show loading animation on setup care button, if Org csOnboardingStatus is in progress', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Pending',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if appOnboardStatus is pending', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Pending',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Failure',
        });
      expect(this.controller.state).toBe(this.controller.status.UNKNOWN);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
    });

    it('should disable setup care button, after onboarding is complete', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.resolve('fake aaOnboard response'));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Success',
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show error notification, if any of the onboarding promises fail', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject('fake aaOnboard response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Care Settings - when org is already onboarded', function () {
    var spiedAuthinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getUserOrgId: jasmine.createSpy('getUserOrgId').and.returnValue('deba1221-ab12-cd34-de56-abcdef123456'),
      getOrgName: jasmine.createSpy('getOrgName').and.returnValue('SunlightConfigService test org'),
      isCareVoice: jasmine.createSpy('isCareVoice').and.returnValue(true),
    };
    beforeEach(function () {
      this.initModules(
        'Sunlight'
      );
    });
    beforeEach(angular.mock.module(function ($provide) {
      $provide.value('Authinfo', spiedAuthinfo);
    }));
    beforeEach(initDependencies);
    beforeEach(
      function () {
        spyOn(this.SunlightConfigService, 'onboardCareBot').and.returnValue(this.$q.reject({ status: 412 }));
      }
    );

    it('should not show error notification and disable setup care button, if org is already onboarded', function () {
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Success',
        });
      this.$interval.flush(10001);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      expect(this.Notification.success).toHaveBeenCalled();
    });
  });
});
