import { AdminAuthorizationStatus } from './context-authorization-service';

describe('ContextAdminAuthorizationService', () => {
  const CCFS_URL = 'https://ccfs.appstaging.ciscoccservice.com/v1/';

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
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
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
});
