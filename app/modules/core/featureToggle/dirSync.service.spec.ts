
import testModule from './index';

describe('DirSyncService', () => {

  const DIR_SYNC_REGEX = /.*\/organization\/.*\/dirsync$/;
  const DIR_SYNC_MODE_REGEX = /.*\/organization\/.*\/dirsync\/mode?.*/;
  const DIR_SYNC_CONNECTORS_REGEX = /.*\/organization\/.*\/dirsync\/connector/;
  const ORG_REGEX = /.*\/scim\/.*\/Orgs\/.*/;

  function init() {
    this.initModules(testModule);
    this.injectDependencies(
      '$injector',
      '$httpBackend',
      'Authinfo',
      'Orgservice',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('xxxx');
    spyOn(this.Authinfo, 'isAdmin').and.returnValue(true);

    // inject DirSyncService after we spy on Authinfo so the orgId is set
    this.DirSyncService = this.$injector.get('DirSyncService');

    installPromiseMatchers();
  }

  beforeEach(init);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  /////////////////////////

  describe('refreshStatus', () => {

    it('should fetch DirSync status and connector list from backend', function () {
      let testConnectors = [{ name: 'test', isInService: true }];

      this.$httpBackend.expectGET(DIR_SYNC_REGEX).respond(200, { serviceMode: 'ENABLED' });
      this.$httpBackend.expectGET(DIR_SYNC_CONNECTORS_REGEX).respond(200, { connectors: testConnectors });

      expect(this.DirSyncService.refreshStatus()).toBeResolved();
      expect(this.DirSyncService.isDirSyncEnabled()).toBeTruthy();
      expect(this.DirSyncService.getConnectors()).toEqual(testConnectors);
    });

    it('should use default properties if GET on /dirsync fails', function () {
      this.$httpBackend.expectGET(DIR_SYNC_REGEX).respond(403);

      expect(this.DirSyncService.refreshStatus()).toBeResolved();
      // make sure we have defaults
      expect(this.DirSyncService.isDirSyncEnabled()).toBeFalsy();
      expect(this.DirSyncService.getConnectors()).toEqual([]);
    });

    it('should use default properties for connectors if GET on /dirsync/connector fails', function () {
      this.$httpBackend.expectGET(DIR_SYNC_REGEX).respond(200, { serviceMode: 'ENABLED' });
      this.$httpBackend.expectGET(DIR_SYNC_CONNECTORS_REGEX).respond(403);

      expect(this.DirSyncService.refreshStatus()).toBeResolved();
      expect(this.DirSyncService.isDirSyncEnabled()).toBeTruthy();
      expect(this.DirSyncService.getConnectors()).toEqual([]);
    });

    it('should fetch DirSync status from Org if NOT a full admin user', function () {
      this.Authinfo.isAdmin.and.returnValue(false);
      this.$httpBackend.expectGET(ORG_REGEX).respond(200, { dirsyncEnabled: true });
      this.$httpBackend.expectGET(DIR_SYNC_CONNECTORS_REGEX).respond(400);

      expect(this.DirSyncService.refreshStatus()).toBeResolved();
      expect(this.DirSyncService.isDirSyncEnabled()).toBeTruthy();
      expect(this.DirSyncService.getConnectors()).toEqual([]);
    });

  });

  describe('isDirSyncEnabled', () => {
    beforeEach(function () {
      this.$httpBackend.whenGET(DIR_SYNC_CONNECTORS_REGEX).respond(200, {
        connectors: [],
      });
    });

    it('should return false if serviceMode != ENABLED', function () {
      this.$httpBackend.expectGET(DIR_SYNC_REGEX).respond(200, { serviceMode: 'DISABLED' });

      expect(this.DirSyncService.refreshStatus()).toBeResolved();

      expect(this.DirSyncService.isDirSyncEnabled()).toBeFalsy();
    });

    it('should return true if serviceMode == ENABLED', function () {
      this.$httpBackend.expectGET(DIR_SYNC_REGEX).respond(200, { serviceMode: 'ENABLED' });

      expect(this.DirSyncService.refreshStatus()).toBeResolved();

      expect(this.DirSyncService.isDirSyncEnabled()).toBeTruthy();
    });

  });

  describe('connectors', () => {

    it('should return list of connectors', function () {
      this.$httpBackend.expectGET(DIR_SYNC_REGEX).respond(200, { serviceMode: 'ENABLED' });
      this.$httpBackend.expectGET(DIR_SYNC_CONNECTORS_REGEX).respond(200, {
        connectors: [
          { name: 'Connector One', isInService: false },
          { name: 'I am Number Two', isInService: true },
        ],
      });

      expect(this.DirSyncService.refreshStatus()).toBeResolved();

      let connectors = this.DirSyncService.getConnectors();
      expect(connectors).toHaveLength(2);
      expect(connectors[0].name).toEqual('Connector One');
      expect(connectors[0].isInService).toBeFalsy();
      expect(connectors[1].name).toEqual('I am Number Two');
      expect(connectors[1].isInService).toBeTruthy();
    });

    it('should handle deregiserConnector success', function () {
      this.$httpBackend.expectDELETE(DIR_SYNC_CONNECTORS_REGEX).respond(204);
      let promise = this.DirSyncService.deregisterConnector('test-connector');
      expect(promise).toBeResolved();
    });

    it('should handle deregiserConnector failure', function () {
      this.$httpBackend.expectDELETE(DIR_SYNC_CONNECTORS_REGEX).respond(304);
      let promise = this.DirSyncService.deregisterConnector('test-connector');
      expect(promise).toBeRejected();
    });

  });

  describe('Disable Dir Sync', () => {
    it('should handle disableSync success', function () {
      this.$httpBackend.expectPATCH(DIR_SYNC_MODE_REGEX).respond(204);
      let promise = this.DirSyncService.disableSync();
      expect(promise).toBeResolved();
    });

    it('should handle disableSync failure', function () {
      this.$httpBackend.expectPATCH(DIR_SYNC_MODE_REGEX).respond(304);
      let promise = this.DirSyncService.disableSync();
      expect(promise).toBeRejected();
    });

  });

});
