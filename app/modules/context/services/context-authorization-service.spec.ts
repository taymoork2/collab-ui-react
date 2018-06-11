import { AdminAuthorizationStatus } from './context-authorization-service';

describe('ContextAdminAuthorizationService', () => {
  const CCFS_URL = 'https://ccfs.appstaging.ciscoccservice.com/v1/';
  const ORG_ID = '12345';
  const orgNeedsMigration = 'ORG_NEEDS_MIGRATION';
  const partnerAdminList = [
    'testPartner1',
    'testPartner2',
  ];

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'ContextAdminAuthorizationService',
      'Authinfo',
      'UrlConfig',
      'FeatureToggleService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(ORG_ID);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getAdminAuthorizationStatus', () => {
    const ADMIN_AUTHORIZATION_URL = [CCFS_URL, 'admin/authorizationStatus/12345'].join('');
    describe('Feature flag is on', () => {
      beforeEach(function () {
        spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      });

      it('should return AUTHORIZED when the response is 200 ', function () {
        this.$httpBackend.expectGET(ADMIN_AUTHORIZATION_URL).respond(200);

        this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
          .then(result => {
            expect(result === AdminAuthorizationStatus.AUTHORIZED);
          })
          .catch(fail);
        this.$httpBackend.flush();
      });

      it('should return UNAUTHORIZED when the response is 403 ', function () {
        this.$httpBackend.expectGET(ADMIN_AUTHORIZATION_URL).respond(403);

        this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
          .then(result => {
            expect(result === AdminAuthorizationStatus.UNAUTHORIZED);
          })
          .catch(fail);
        this.$httpBackend.flush();
      });

      it('should return NEEDS_MIGRATION when the response is 400 and status text is ORG_NEEDS_MIGRATION', function () {
        this.$httpBackend.expectGET(ADMIN_AUTHORIZATION_URL).respond(400, {
          data: {
            error: {
              statusText: orgNeedsMigration,
            },
          },
        });

        this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
          .then(result => {
            expect(result === AdminAuthorizationStatus.NEEDS_MIGRATION);
          })
          .catch(fail);
        this.$httpBackend.flush();
      });

      it('should return UNKNOWN when the response is 400 and status text does not exists ', function () {
        this.$httpBackend.expectGET(ADMIN_AUTHORIZATION_URL).respond(400, {
          data: {
            error: {
              others: orgNeedsMigration,
            },
          },
        });

        this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
          .then(result => {
            expect(result === AdminAuthorizationStatus.UNKNOWN);
          })
          .catch(fail);
        this.$httpBackend.flush();
      });

      it('should return UNKNOWN when the response is 400 ', function () {
        this.$httpBackend.expectGET(ADMIN_AUTHORIZATION_URL).respond(400);

        this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
          .then(result => {
            expect(result === AdminAuthorizationStatus.UNKNOWN);
          })
          .catch(fail);
        this.$httpBackend.flush();
      });
    });

    describe('Feature flag is off', () => {
      beforeEach(function () {
        spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      });

      it('should return authorized when the feature flag is off', function () {
        this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
          .then(result => {
            expect(result === AdminAuthorizationStatus.AUTHORIZED);
          })
          .catch(fail);
      });
    });
  });

  describe('isAdminAuthorized', () => {
    beforeEach(function () {
      installPromiseMatchers();
    });

    it('should resolve with true if authorization status resolves with AdminAuthorizationStatus.AUTHORIZED' +
      ', false otherwise', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue(this.$q.resolve(AdminAuthorizationStatus.AUTHORIZED));
      expect(this.ContextAdminAuthorizationService.isAdminAuthorized()).toBeResolvedWith(true);

      // resolve w/ a value that is not AdminAuthorizationStatus.AUTHORIZED
      this.ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue(this.$q.resolve('foo'));
      expect(this.ContextAdminAuthorizationService.isAdminAuthorized()).toBeResolvedWith(false);
    });

    it('should pass through rejection if underlying getAdminAuthorizationStatus() rejects ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
        .and.returnValue(this.$q.reject('fake-rejection-value'));
      expect(this.ContextAdminAuthorizationService.isAdminAuthorized()).toBeRejectedWith('fake-rejection-value');
    });
  });

  describe('isMigrationNeeded', () => {
    beforeEach(function () {
      installPromiseMatchers();
    });

    it('should resolve with true if authorization status resolves with AdminAuthorizationStatus.NEEDS_MIGRATION' +
      ', false otherwise', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus').and.returnValue(this.$q.resolve(AdminAuthorizationStatus.NEEDS_MIGRATION));
      expect(this.ContextAdminAuthorizationService.isMigrationNeeded()).toBeResolvedWith(true);

      // resolve w/ a value that is not AdminAuthorizationStatus.AUTHORIZED
      this.ContextAdminAuthorizationService.getAdminAuthorizationStatus.and.returnValue(this.$q.resolve('foo'));
      expect(this.ContextAdminAuthorizationService.isMigrationNeeded()).toBeResolvedWith(false);
    });

    it('should pass through rejection if underlying getAdminAuthorizationStatus() rejects ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getAdminAuthorizationStatus')
        .and.returnValue(this.$q.reject('fake-rejection-value'));
      expect(this.ContextAdminAuthorizationService.isMigrationNeeded()).toBeRejectedWith('fake-rejection-value');
    });
  });

  describe('getPartnerAdminIDs', function () {

    it('should successfully return an array of 2 partners from calling getPartnerAdminIDs', function () {
      const adminUrl = this.UrlConfig.getAdminServiceUrl() + 'organization/' + ORG_ID + '/users/partneradmins';

      this.$httpBackend.expectGET(adminUrl).respond(200, {
        partners: [{ id: 'testPartner1' }, { id: 'testPartner2' }],
      });

      this.ContextAdminAuthorizationService.getPartnerAdminIDs()
        .then(result => {
          expect(result[0]).toBe(partnerAdminList[0]);
          expect(result[1]).toBe(partnerAdminList[1]);
          expect(result.length).toBe(2);
        })
        .catch(fail);
      this.$httpBackend.flush();
    });
  });

  describe('synchronizeAdmins', function () {

    const synchronizeAdminsUrl = 'https://ccfs.appstaging.ciscoccservice.com/v1/admin/authorizationSync';
    const payload: any = {
      orgId: ORG_ID,
      partnerIds: partnerAdminList,
    };

    it('should synchronize Admins', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getPartnerAdminIDs').and.returnValue(this.$q.resolve(partnerAdminList));

      this.$httpBackend.expectPOST(synchronizeAdminsUrl, payload).respond(200);
      this.ContextAdminAuthorizationService.synchronizeAdmins()
        .then(function (response) {
          expect(response.status).toBe(200);
        })
        .catch(fail);
      this.$httpBackend.flush();
    });

    it('should throw an error if synchronization fails ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getPartnerAdminIDs').and.returnValue(this.$q.resolve(partnerAdminList));

      this.$httpBackend.expectPOST(synchronizeAdminsUrl, payload).respond(400);
      this.ContextAdminAuthorizationService.synchronizeAdmins()
        .then(function () {
          fail('Should have rejected.');
        })
        .catch(function (response) {
          expect(response.status).toBe(400);
        });
      this.$httpBackend.flush();
    });
  });

  describe('migrateOrganization', function () {

    const migrateOrganizationUrl = 'https://ccfs.appstaging.ciscoccservice.com/v1/migrate';
    const payload: any = {
      orgId: ORG_ID,
      partnerIds: partnerAdminList,
    };

    it('should migrate organization', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getPartnerAdminIDs').and.returnValue(this.$q.resolve(partnerAdminList));

      this.$httpBackend.expectPOST(migrateOrganizationUrl, payload).respond(200);
      this.ContextAdminAuthorizationService.migrateOrganization()
        .then(function (response) {
          expect(response.status).toBe(200);
        })
        .catch(fail);
      this.$httpBackend.flush();
    });

    it('should throw an error if migration fails ', function () {
      spyOn(this.ContextAdminAuthorizationService, 'getPartnerAdminIDs').and.returnValue(this.$q.resolve(partnerAdminList));

      this.$httpBackend.expectPOST(migrateOrganizationUrl, payload).respond(400);
      this.ContextAdminAuthorizationService.migrateOrganization()
        .then(function () {
          fail('Should have rejected.');
        })
        .catch(function (response) {
          expect(response.status).toBe(400);
        });
      this.$httpBackend.flush();
    });
  });
});
