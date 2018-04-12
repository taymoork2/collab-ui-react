describe('Test sunlight Util Service for admin profile', function () {
  let deferredRes;
  const setUpKey = 'setupCare_deba1221-ab12-cd34-de56-abcdef123456_eqcbe9dc-d4c9-490b-8908-738f373d2c4b';
  const dummyResponse = getJSONFixture('sunlight/json/features/config/sunlightConfigResponse.json');
  const orgId = 'deba1221-ab12-cd34-de56-abcdef123456';
  const partnerOrgId = 'deba1221-ab12-cd94-de56-abcdef123456';

  function initDependencies() {
    this.injectDependencies('SunlightUtilitiesService', '$scope', '$q', 'SunlightConfigService', 'Authinfo',
      'LocalStorage', 'SunlightConstantsService', 'FeatureToggleService', 'ContextAdminAuthorizationService');
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

  function initMigrationAdminSpies(isFeatureEnabled, isMigrationNeeded) {
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(isFeatureEnabled));
    spyOn(this.ContextAdminAuthorizationService, 'isMigrationNeeded').and.returnValue(this.$q.resolve(isMigrationNeeded));
    spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue(this.$q.resolve(this.constants.NEEDS_MIGRATION));
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

    //tests for partner profile
    it('should test user is a partner ', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      expect(this.SunlightUtilitiesService.isOrgAdmin()).toEqual(false);
    });

    it('should get CareOnboardStatus true For Partner ', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      expect(this.SunlightUtilitiesService.getCareOnboardStatusForPartner(this.status.SUCCESS, this.status.SUCCESS)).toBe(true);
    });

    it('should get CareOnboardStatus when careVoice not enabled', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      this.Authinfo.isCareVoice.and.returnValue(false);
      expect(this.SunlightUtilitiesService.getCareOnboardStatusForPartner(this.status.SUCCESS, this.status.UNKNOWN)).toBe(true);
    });

    it('should get CareOnboardStatus false For Partner ', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      expect(this.SunlightUtilitiesService.getCareOnboardStatusForPartner(this.status.UNKNOWN, this.status.SUCCESS)).toBe(false);
    });

    it('should get isCareSetup for care successfully onboarded for partner', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for app not onboarded', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.appOnboardUnknown);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for jwtApp not onboarded', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.jwtAppOnboardUnknown);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get getAAOnboardStatus for non care voice entitled org', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      this.Authinfo.isCareVoice.and.returnValue(false);
      const aaOnboardStatus = this.SunlightUtilitiesService
        .getAAOnboardStatus(this.UNKNOWN);
      expect(aaOnboardStatus).toBe(this.status.SUCCESS);
    });

    it('should get getAAOnboardStatus for care voice entitled org', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      const aaOnboardStatus = this.SunlightUtilitiesService
        .getAAOnboardStatus(this.status.FAILURE);
      expect(aaOnboardStatus).toBe(this.status.FAILURE);
    });

    it('should get isCareSetup for cs not onboarded', function () {
      this.Authinfo.getUserOrgId.and.returnValue(partnerOrgId);
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.csOnboardUnknown);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    //tests for admin profile
    it('should test user is admin', function () {
      expect(this.SunlightUtilitiesService.isOrgAdmin()).toEqual(true);
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

    it('should get CareOnboardStatusForAdmin positive', function () {
      expect(this.SunlightUtilitiesService.getCareOnboardStatusForAdmin(this.status.SUCCESS, this.status.SUCCESS, this.status.SUCCESS,
      this.status.SUCCESS)).toBe(true);
    });

    it('should get CareOnboardStatusForAdmin when careVoice not enabled', function () {
      this.Authinfo.isCareVoice.and.returnValue(false);
      expect(this.SunlightUtilitiesService.getCareOnboardStatusForAdmin(this.status.SUCCESS,
      this.status.SUCCESS , this.status.UNKNOWN, this.status.SUCCESS)).toBe(true);
    });

    it('should get getCareOnboardStatusForAdmin negative', function () {
      expect(this.SunlightUtilitiesService.getCareOnboardStatusForAdmin(this.status.UNKNOWN,
        this.status.SUCCESS, this.status.SUCCESS, this.status.SUCCESS)).toBe(false);
    });

    it('should get getAAOnboardStatus for non care voice entitled org', function () {
      this.Authinfo.isCareVoice.and.returnValue(false);
      const aaOnboardStatus = this.SunlightUtilitiesService
        .getAAOnboardStatus(this.FAILURE);
      expect(aaOnboardStatus).toBe(this.status.SUCCESS);
    });

    it('should get getAAOnboardStatus for care voice entitled org', function () {
      const aaOnboardStatus = this.SunlightUtilitiesService
        .getAAOnboardStatus(this.FAILURE);
      expect(aaOnboardStatus).toBe(this.FAILURE);
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
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for app not onboarded', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.appOnboardUnknown);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });

    it('should get isCareSetup for jwtApp not onboarded', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.jwtAppOnboardUnknown);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
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
      initMigrationAdminSpies.call(this, true, true);
      careSetupResponse.then(function (res) {
        expect(res).toBe(false);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });
    it('should get isCareSetup as true for org if migration is not needed', function () {
      const careSetupResponse = this.SunlightUtilitiesService.isCareSetup();
      deferredRes.resolve(dummyResponse.SuccessStatusResponse);
      initMigrationAdminSpies.call(this, true, false);
      careSetupResponse.then(function (res) {
        expect(res).toBe(true);
      }).catch((error) => fail('Failed to resolve promise with error' + error));
      this.$scope.$digest();
    });
  });
});
