'use strict';

describe('CareLocalSettingsCtrl', function () {
  function initDependencies() {
    this.injectDependencies('$controller', '$httpBackend', '$interval', '$q', '$scope', 'Authinfo', 'FeatureToggleService', 'Notification', 'SunlightConfigService', 'UrlConfig', 'URService');
    this.$scope.orgConfigForm = { dirty: false };
    this.orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
    this.urServiceUrl = this.UrlConfig.getSunlightURServiceUrl() + '/organization/' + this.orgId + '/queue/' + this.orgId;
    this.sunlightChatConfigUrl = this.UrlConfig.getSunlightConfigServiceUrl() + '/organization/' +
      this.Authinfo.getOrgId() + '/chat';
    this.controller = this.$controller('CareLocalSettingsCtrl', {
      $scope: this.$scope,
      $interval: jasmine.createSpy('$interval', this.$interval).and.callThrough(),
      Notification: this.Notification,
    });
  }

  function initSpies() {
    spyOn(this.URService, 'createQueue').and.returnValue(this.$q.resolve('fake createQueue response'));
    spyOn(this.URService, 'updateQueue').and.returnValue(this.$q.resolve('fake updateQueue response'));
    spyOn(this.SunlightConfigService, 'updateChatConfig').and.returnValue(this.$q.resolve('fake updateChatConfig response'));
    spyOn(this.SunlightConfigService, 'onBoardCare').and.returnValue(this.$q.resolve('fake onBoardCare response'));
    spyOn(this.SunlightConfigService, 'onboardCareBot').and.returnValue(this.$q.resolve('fake onboardCareBot response'));
    spyOn(this.FeatureToggleService, 'atlasCareAutomatedRouteTrialsGetStatus').and.returnValue(this.$q.resolve(true));
  }

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Controller: Care Local Settings', function () {
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
      it('should show enabled setup care button, if Org is not onboarded already.', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      });

      it('should disable setup care, if already onboarded', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.controller.status.SUCCESS,
            appOnboardStatus: this.controller.status.SUCCESS,
            aaOnboardingStatus: this.controller.status.SUCCESS,
          });
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
      });

      it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.controller.status.PENDING,
          });
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
      });

      it('should call updateChatConfig, if already onboarded and orgName is not present', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.controller.status.SUCCESS,
            appOnboardStatus: this.controller.status.SUCCESS,
          });
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.SunlightConfigService.updateChatConfig).toHaveBeenCalled();
      });

      it('should call updateChatConfig, if already onboarded and orgName is empty', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.controller.status.SUCCESS,
            appOnboardStatus: this.controller.status.SUCCESS,
            orgName: '',
          });
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.SunlightConfigService.updateChatConfig).toHaveBeenCalled();
      });

      it('should not call updateChatConfig, if already onboarded and orgName is present', function () {
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.controller.status.SUCCESS,
            appOnboardStatus: this.controller.status.SUCCESS,
            orgName: 'fake org name',
          });
        this.$httpBackend.flush();
        expect(this.SunlightConfigService.updateChatConfig).not.toHaveBeenCalled();
      });
    });

    describe('CareSettings - Setup Care - Success', function () {
      it('should call the onboard config api and flash setup care button', function () {
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { csOnboardingStatus: 'Pending' });
        this.$interval.flush(10002);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
      });

      it('should disable setup care button, after ccfs tab completes onboarding', function () {
        spyOn(this.Notification, 'success').and.returnValue(true);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        this.$httpBackend.expectGET(this.urServiceUrl)
          .respond(200, this.queueDetails);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
          .respond(200, {
            csOnboardingStatus: this.controller.status.SUCCESS,
            appOnboardStatus: this.controller.status.SUCCESS,
          });
        this.$interval.flush(10001);
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        expect(this.Notification.success).toHaveBeenCalled();
      });
    });

    describe('CareSettings - Setup Care - Failure', function () {
      it('should show error toaster if timed out', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
        this.$httpBackend.flush();
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 30; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(404, {});
          this.$interval.flush(10000);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      });

      it('should show error toaster if backend API fails', function () {
        spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
        this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
        this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
        this.controller.onboardToCare();
        this.$scope.$apply();
        for (var i = 3; i >= 0; i--) {
          this.$httpBackend.whenGET(this.sunlightChatConfigUrl).respond(500, {});
          this.$interval.flush(10000);
        }
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
        expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      });

      it('should disable setup care button, if failed to get status on loading', function () {
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
        this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(403, {});
        this.$httpBackend.flush();
        expect(this.controller.state).toBe(this.controller.ONBOARDED);
      });
    });
  });

  describe('Care Settings - when org has K2 entitlement', function () {
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

    it('should enable setup care button, when Org is not onboarded', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Unknown',
          aaOnboardingStatus: 'Unknown',
        });
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, this.queueDetails);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Pending',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should enable setup care button, if csOnboarding or aaOnboarding is failure', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Failure',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
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
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, this.queueDetails);
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

    it('should not show error notification and disable setup care button, if org is already onboarded', function () {
      spyOn(this.SunlightConfigService, 'aaOnboard').and.returnValue(this.$q.reject({ status: 412 }));
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(404, {});
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, this.queueDetails);
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
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.controller.onboardToCare();
      this.$scope.$apply();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Partner Logged in as org admin: Care Settings - when org has K2 entitlement', function () {
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

    it('should enable setup care button, when Org is not onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Unknown',
          aaOnboardingStatus: 'Unknown',
        });
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Pending',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
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
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
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
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, this.queueDetails);
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
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Admin logged in: Care Settings - when org has K2 entitlement', function () {
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

    it('should enable setup care button, when Org is not onboarded', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Unknown',
          aaOnboardingStatus: 'Unknown',
        });
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
    });

    it('should enable setup care, if cs and aa are already onboarded but app onboarding is not done', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Unknown',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
    });

    it('should disable setup care, if already onboarded', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Success',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
    });

    it('should show loading animation on setup care button, if Org onboarding is in progress', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Pending',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
      this.$httpBackend.flush();
      expect(this.controller.state).toBe(this.controller.IN_PROGRESS);
    });

    it('should show loading animation on setup care button, if csOnboarding or aaOnboarding is pending', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, {
          csOnboardingStatus: 'Success',
          appOnboardStatus: 'Success',
          aaOnboardingStatus: 'Pending',
        });
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
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
      expect(this.controller.state).toBe(this.controller.ONBOARDED);
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
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, this.queueDetails);
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
      expect(this.controller.csOnboardingStatus).toBe(this.controller.status.SUCCESS);
      expect(this.controller.state).toBe(this.controller.NOT_ONBOARDED);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });
  });

  describe('Care Settings - Routing Toggling', function () {
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
    beforeEach(
      function () {
        this.$scope.orgConfigForm = {
          dirty: false,
          $setPristine: function () {
          },
          $setUntouched: function () {
          },
        };
      });

    it('should show the saved org chat configurations as selected.', function () {
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl).respond(200, { maxChatCount: 4, videoCallEnabled: true });
      this.$httpBackend.flush();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.controller.RoutingType.PICK);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(4);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
    });

    it('should show the saved routing type as selected.', function () {
      this.controller.defaultQueueStatus = this.controller.status.SUCCESS;
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, { routingType: 'push' });
      this.$httpBackend.flush();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.controller.RoutingType.PUSH);
    });
    it('should show success toaster if update of orgChatConfig backend API is a success', function () {
      spyOn(this.Notification, 'success').and.returnValue(true);
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, { maxChatCount: 4, videoCallEnabled: true });
      this.$httpBackend.flush();
      this.controller.isProcessing = true;
      this.controller.saveOrgChatConfigurations();
      this.$scope.$apply();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.controller.RoutingType.PICK);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(4);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(true);
      expect(this.controller.isProcessing).toBe(false);
    });

    it('should show failure toaster if org chat config update backend API fails', function () {
      this.SunlightConfigService.updateChatConfig = jasmine.createSpy().and.returnValue(this.$q.reject('fake updateChatConfig response'));
      spyOn(this.Notification, 'errorWithTrackingId').and.returnValue(true);
      this.controller.queueConfig.selectedRouting = this.controller.RoutingType.PICK;
      this.controller.orgChatConfig.selectedChatCount = 4;
      this.controller.orgChatConfig.selectedVideoInChatToggle = true;
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, { routingType: 'push' });
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, { maxChatCount: 3, videoCallEnabled: false });
      this.$httpBackend.flush();
      this.controller.saveQueueConfigurations();
      this.controller.saveOrgChatConfigurations();
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
      expect(this.controller.isProcessing).toBe(false);
      expect(this.controller.queueConfig.selectedRouting).toBe(this.controller.RoutingType.PUSH);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(3);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
    });

    it('should reset form if modification made is cancelled', function () {
      this.controller.queueConfig.selectedRouting = this.controller.RoutingType.PICK;
      this.controller.orgChatConfig.selectedChatCount = 4;
      this.controller.orgChatConfig.selectedVideoInChatToggle = true;
      this.$httpBackend.expectGET(this.urServiceUrl)
        .respond(200, { routingType: 'push' });
      this.$httpBackend.expectGET(this.sunlightChatConfigUrl)
        .respond(200, { maxChatCount: 5, videoCallEnabled: false });
      this.$httpBackend.flush();
      this.controller.savedRoutingType = this.controller.RoutingType.PUSH;
      this.controller.cancelEdit();
      this.$scope.$apply();
      expect(this.controller.queueConfig.selectedRouting).toBe(this.controller.RoutingType.PUSH);
      expect(this.controller.orgChatConfig.selectedChatCount).toBe(5);
      expect(this.controller.orgChatConfig.selectedVideoInChatToggle).toBe(false);
    });
  });
});

