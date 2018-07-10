describe('Test sunlight Util Service for admin profile', function () {
  let deferredRes;
  const setUpKey = 'setupCare_deba1221-ab12-cd34-de56-abcdef123456_eqcbe9dc-d4c9-490b-8908-738f373d2c4b';
  const dummyResponse = getJSONFixture('sunlight/json/features/config/sunlightConfigResponse.json');
  const orgId = 'deba1221-ab12-cd34-de56-abcdef123456';

  function initDependencies() {
    this.injectDependencies('SunlightUtilitiesService', '$scope', '$q', 'SunlightConfigService', 'Authinfo',
      'URService', 'LocalStorage', 'SunlightConstantsService', 'FeatureToggleService',
      'ContextAdminAuthorizationService');
    this.constants = {
      NEEDS_MIGRATION: 'NeedsMigration',
    };
  }
  function initSpies() {
    deferredRes = this.$q.defer();
    spyOn(this.SunlightConfigService, 'getChatConfig').and.callFake(function () {
      return deferredRes.promise;
    });

    spyOn(this.Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(this.Authinfo, 'isCareVoice').and.returnValue(true);
    spyOn(this.Authinfo, 'getUserOrgId').and.returnValue(orgId);
    spyOn(this.Authinfo, 'getUserId').and.returnValue('eqcbe9dc-d4c9-490b-8908-738f373d2c4b');

    this.status =  this.SunlightConstantsService.status;
  }

  function initMigrationAndQueueSpies(isMigrationNeeded) {
    spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(isMigrationNeeded));
    spyOn(this.URService, 'getQueue').and.returnValue(this.$q.resolve());
  }

  beforeEach(function () {
    this.initModules('Sunlight');
    initDependencies.call(this);
    initSpies.call(this);
  });

  afterEach(function () {
    deferredRes = undefined;
    this.SunlightUtilitiesService.removeCareSetupKey();
  });

  describe('sunlightUtilitiesService', function () {

    it('should get CareOnboardStatus true if all app onboarding are success', function () {
      expect(this.SunlightUtilitiesService.getCareOnboardStatus(this.status.SUCCESS, this.status.SUCCESS, this.status.SUCCESS)).toBe(true);
    });

    it('should get CareOnboardStatus false if any app onboarding is not success', function () {
      expect(this.SunlightUtilitiesService.getCareOnboardStatus(this.status.UNKNOWN, this.status.SUCCESS, this.status.SUCCESS)).toBe(false);
    });

    it('should get isCareSetup for app not onboarded', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.appOnboardUnknown);
      initMigrationAndQueueSpies.call(this, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for jwtApp not onboarded', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.jwtAppOnboardUnknown);
      initMigrationAndQueueSpies.call(this, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for cs not onboarded', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.csOnboardUnknown);
      initMigrationAndQueueSpies.call(this, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should return correct careSetupKey', function () {
      expect(this.SunlightUtilitiesService.getCareSetupKey()).toEqual(setUpKey);
    });

    it('should should set get and remove correct careSetupKey from local storage', function () {
      expect(this.SunlightUtilitiesService.getCareSetupKeyFromStore()).toEqual(null);
      this.SunlightUtilitiesService.cacheCareSetupStatus();
      expect(this.SunlightUtilitiesService.getCareSetupKeyFromStore()).not.toEqual(null);
      this.SunlightUtilitiesService.removeCareSetupKey();
      expect(this.SunlightUtilitiesService.getCareSetupKeyFromStore()).toEqual(null);
    });

    it('should should get correct careSetup string for notification', function () {
      expect(this.SunlightUtilitiesService.getCareSetupKeyFromStore()).toEqual(null);
      expect(this.SunlightUtilitiesService.getCareSetupNotificationText()).toEqual('homePage.setUpCarePrimaryNotification');
      this.SunlightUtilitiesService.cacheCareSetupStatus();
      expect(this.SunlightUtilitiesService.getCareSetupKeyFromStore()).not.toEqual(null);
      expect(this.SunlightUtilitiesService.getCareSetupNotificationText()).toEqual('homePage.setUpCareSecondaryNotification');
    });

    it('should get CareOnboardStatus when careVoice not enabled', function () {
      this.Authinfo.isCareVoice.and.returnValue(false);
      expect(this.SunlightUtilitiesService.getCareOnboardStatus(this.status.SUCCESS,
        this.status.SUCCESS, this.status.SUCCESS)).toBe(true);
    });

    it('should test that snoozeTime is Up  ', function () {
      this.LocalStorage.put(this.SunlightUtilitiesService.getCareSetupKey(), moment().subtract(52, 'hours').toISOString());
      expect(this.SunlightUtilitiesService.isSnoozeTimeUp()).toBe(true);
    });

    it('should test snoozeTime is not Up ', function () {
      this.LocalStorage.put(this.SunlightUtilitiesService.getCareSetupKey(), moment().add(1, 'hours').toISOString());
      expect(this.SunlightUtilitiesService.isSnoozeTimeUp()).toBe(false);
    });

    it('should get showSetUpCareNotification no key cached ', function () {
      expect(this.SunlightUtilitiesService.showSetUpCareNotification()).toBe(true);
    });

    it('should get isCareSetup for all Success statuses', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      initMigrationAndQueueSpies.call(this, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for 403 error', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.reject({ status: 403, body: 'dummyBody' });
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for 404 error', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.reject({ status: 404, body: 'dummyBody' });
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup as false for org if migration is needed', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      initMigrationAndQueueSpies.call(this, true);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup as true for org if isMigrationNeeded call failed', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.reject());
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup as true for org if migration is not needed', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      initMigrationAndQueueSpies.call(this, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup as false for org if getQueue return 404 error', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(false));
      spyOn(this.URService, 'getQueue').and.returnValue(this.$q.reject({ status: 404, body: 'dummyBody' }));
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup as true for org if getQueue call failed', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(false));
      spyOn(this.URService, 'getQueue').and.returnValue(this.$q.reject({ status: 500, body: 'dummyBody' }));
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });
  });
});
