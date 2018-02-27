import { AdminAuthorizationStatus } from './context-authorization-service';

describe('ContextAdminAuthorizationService', () => {
  const CCFS_URL = 'https://ccfs.appstaging.ciscoccservice.com/v1/';
  const ORG_ID = '12345';
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
    const ADMIN_AUTHORIZATION_URL = [CCFS_URL, 'AdminAuthorizationStatus/12345'].join('');
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

      it('should return AUTHORIZED when the response is 400 ', function () {
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

    it('should throw an error if synchronize fails ', function () {
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
});
