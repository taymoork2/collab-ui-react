import moduleName from './index';
import { OrgSettingsService, FileShareControl, FileShareControlType, WhiteboardFileShareControlType } from './org-settings.service';

type Test = atlas.test.IServiceTest<{
  $rootScope: ng.IRootScopeService,
  OrgSettingsService: OrgSettingsService,
  UrlConfig,
}>;

describe('Component: orgSettings:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$rootScope',
      'OrgSettingsService',
      'UrlConfig',
    );
    this.orgId = '12345';
    this.url = `${this.UrlConfig.getAdminServiceUrl()}organizations/${this.orgId}/settings`;

    installPromiseMatchers();
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getSettings():', () => {
    it('should resolve a json object of first org settings string', function (this: Test) {
      const expectedObject = {
        someString: 'value',
        someNumber: 1,
        someBoolean: true,
      };
      const stringifiedObject = JSON.stringify(expectedObject);
      this.$httpBackend.expectGET(this.url).respond({
        orgSettings: [
          stringifiedObject,
        ],
      });

      const promise = this.OrgSettingsService.getSettings(this.orgId);
      expect(promise).toBeResolvedWith(expectedObject);
    });

    it('should reject if unable to parse org settings string', function (this: Test, done) {
      const unparseableString = 'I\'m not a stringified object!';
      this.$httpBackend.expectGET(this.url).respond({
        orgSettings: [
          unparseableString,
        ],
      });

      const promise = this.OrgSettingsService.getSettings(this.orgId);
      promise.then(fail).catch(error => {
        expect(error instanceof SyntaxError).toBe(true);
        _.defer(done);
      });
      this.$httpBackend.flush();
    });

    it('should reject if response is an error', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond(500);
      const promise = this.OrgSettingsService.getSettings(this.orgId);
      expect(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 500,
      }));
    });
  });

  describe('updateLatestSettings():', () => {
    it('should get the latest settings and update with new payload properties', function (this: Test) {
      const latestSettings = {
        someKey: 'someValue',
        otherKey: 'otherValue',
      };
      const newSettings = {
        otherKey: 'updatedValue',
        newKey: 'newValue',
      };
      const expectedSettings = {
        someKey: 'someValue',
        otherKey: 'updatedValue',
        newKey: 'newValue',
      };
      this.$httpBackend.expectGET(this.url).respond({
        orgSettings: [
          JSON.stringify(latestSettings),
        ],
      });
      this.$httpBackend.expectPATCH(this.url, expectedSettings).respond(200);

      const promise = this.OrgSettingsService.updateLatestSettings(this.orgId, newSettings);
      expect(promise).toBeResolved();
    });

    it('should reject if GET responds with an error', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond(500);
      const promise = this.OrgSettingsService.updateLatestSettings(this.orgId, {});
      expect(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 500,
      }));
    });

    it('should reject if PATCH responds with an error', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond({
        orgSettings: [
          '{}',
        ],
      });
      this.$httpBackend.expectPATCH(this.url, {}).respond(500);
      const promise = this.OrgSettingsService.updateLatestSettings(this.orgId, {});
      expect(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 500,
      }));
    });
  });

  describe('Client Security Policy', () => {
    beforeEach(function (this: Test) {
      this.url = `${this.url}/clientSecurityPolicy`;
    });

    it('should resolve existing clientSecurityPolicy value', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond({
        clientSecurityPolicy: true,
      });
      const promise = this.OrgSettingsService.getClientSecurityPolicy(this.orgId);
      expect(promise).toBeResolvedWith(true);
    });

    it('should update clientSecurityPolicy value', function (this: Test) {
      const expectedSetting = {
        clientSecurityPolicy: true,
      };
      this.$httpBackend.expectPUT(this.url, expectedSetting).respond(200);
      const promise = this.OrgSettingsService.setClientSecurityPolicy(this.orgId, true);
      expect(promise).toBeResolved();
    });
  });

  describe('Block External Communications', () => {
    beforeEach(function (this: Test) {
      this.url = `${this.url}/blockExternalCommunications`;
    });

    it('should resolve existing blockExternalCommunications value', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond({
        blockExternalCommunications: true,
      });
      const promise = this.OrgSettingsService.getBlockExternalCommunications(this.orgId);
      expect(promise).toBeResolvedWith(true);
    });

    it('should update blockExternalCommunications value', function (this: Test) {
      const expectedSetting = {
        blockExternalCommunications: true,
      };
      this.$httpBackend.expectPUT(this.url, expectedSetting).respond(200);
      const promise = this.OrgSettingsService.setBlockExternalCommunications(this.orgId, true);
      expect(promise).toBeResolved();
    });
  });

  describe('Whiteboard File Share Control', () => {
    beforeEach(function (this: Test) {
      this.url = `${this.url}/whiteboardFileShareControl`;
    });

    it('should resolve BLOCK if whiteboardFileShareControl is not set', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond({});
      const promise = this.OrgSettingsService.getWhiteboardFileShareControl(this.orgId);
      expect(promise).toBeResolvedWith('BLOCK');
    });

    it('should resolve existing whiteboardFileShareControl value', function (this: Test) {
      this.$httpBackend.expectGET(this.url).respond({
        whiteboardFileShareControl: WhiteboardFileShareControlType.ALLOW,
      });
      const promise = this.OrgSettingsService.getWhiteboardFileShareControl(this.orgId);
      expect(promise).toBeResolvedWith('ALLOW');
    });

    it('should update whiteboardFileShareControl value', function (this: Test) {
      const expectedSetting = {
        whiteboardFileShareControl: 'ALLOW',
      };
      this.$httpBackend.expectPUT(this.url, expectedSetting).respond(200);
      const promise = this.OrgSettingsService.setWhiteboardFileShareControl(this.orgId, WhiteboardFileShareControlType.ALLOW);
      expect(promise).toBeResolved();
    });
  });

  describe('File Share Control', () => {
    it('should resolve existing file share control properties', function (this: Test, done) {
      const settingsObject = {
        desktopFileShareControl: FileShareControlType.BLOCK_BOTH,
        mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        webFileShareControl: FileShareControlType.NONE,
        botFileShareControl: undefined,
        nonFileShareControlSetting: 'unused',
      };
      spyOn(this.OrgSettingsService, 'getSettings').and.returnValue(this.$q.resolve(settingsObject));

      const promise = this.OrgSettingsService.getFileShareControl(this.orgId);
      promise.then(response => {
        expect(response instanceof FileShareControl).toBe(true);
        expect(response.desktopFileShareControl).toBe(FileShareControlType.BLOCK_BOTH);
        expect(response.mobileFileShareControl).toBe(FileShareControlType.BLOCK_UPLOAD);
        expect(response.webFileShareControl).toBe(FileShareControlType.NONE);
        expect(response.botFileShareControl).toBe(FileShareControlType.NONE); // undefined became NONE
        expect((response as any).nonFileShareControlSetting).not.toBeDefined(); // non file share control properties don't exist
        _.defer(done);
      }).catch(fail);
      this.$rootScope.$apply();
    });

    it('should update latest settings with file share control properties', function (this: Test) {
      spyOn(this.OrgSettingsService, 'updateLatestSettings').and.returnValue(this.$q.resolve());
      const fileShareControlSettings = {
        desktopFileShareControl: FileShareControlType.BLOCK_BOTH,
        mobileFileShareControl: FileShareControlType.BLOCK_UPLOAD,
        webFileShareControl: FileShareControlType.NONE,
        botFileShareControl: FileShareControlType.NONE,
      };

      const promise = this.OrgSettingsService.setFileShareControl(this.orgId, fileShareControlSettings);
      expect(this.OrgSettingsService.updateLatestSettings).toHaveBeenCalledWith(this.orgId, fileShareControlSettings);
      expect(promise).toBeResolved();
    });
  });
});
