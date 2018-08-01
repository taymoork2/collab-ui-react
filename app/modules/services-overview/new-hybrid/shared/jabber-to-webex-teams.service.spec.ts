import moduleName from './index';

import { JabberToWebexTeamsService } from './jabber-to-webex-teams.service';
import { JabberToWebexTeamsUtil } from './jabber-to-webex-teams.util';
import { JABBER_CONFIG_TEMPLATE_TYPE, PREREQS_CONFIG_TEMPLATE_TYPE, PROFILE_TEMPLATE } from './jabber-to-webex-teams.types';

type Test = atlas.test.IServiceTest<{
  Authinfo;
  JabberToWebexTeamsService: JabberToWebexTeamsService;
  UrlConfig;
}>;

describe('Service: JabberToWebexTeamsService:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      'Authinfo',
      'JabberToWebexTeamsService',
      'UrlConfig',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('fake-org-id');
    spyOn(this.UrlConfig, 'getIdentityServiceUrl').and.returnValue('fake-identity-url');
  });

  describe('getConfigTemplatesUrl():', () => {
    it('should return the correct url for the current org id', function (this: Test) {
      const result = this.JabberToWebexTeamsService.getConfigTemplatesUrl();
      expect(result).toBe('fake-identity-url/organization/fake-org-id/v1/config/templates');
    });
  });

  describe('create():', () => {
    beforeEach(function () {
      spyOn(this.JabberToWebexTeamsService, 'getConfigTemplatesUrl').and.returnValue('fake-url');
    });

    it('should POST to config templates url for backendType.voiceServerDomain', function (this: Test) {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
      const createData = {
        profileName: 'fake-profile-name',
        voiceServerDomainName: 'fake-voice-server-domain',
        udsServerAddress: '', udsBackupServerAddress: '',
      };
      this.JabberToWebexTeamsService.create(createData);
      const requestData = _.assignIn({
        templateName: createData.profileName,
        VoiceMailServer: createData.voiceServerDomainName,
      }, PROFILE_TEMPLATE);
      expect(this.$http.post).toHaveBeenCalledWith('fake-url', requestData);
    });

    it('should POST to config templates url for backendType.udsServer', function (this: Test) {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
      const createData = {
        profileName: 'fake-profile-name',
        voiceServerDomainName: '',
        udsServerAddress: 'fake-uds-server',
        udsBackupServerAddress: 'fake-uds-backupserver',
      };
      this.JabberToWebexTeamsService.create(createData);
      const requestData = _.assignIn({
        templateName: createData.profileName,
        CUCMServer: createData.udsServerAddress,
        BackupCUCMServer: createData.udsBackupServerAddress,
      }, PROFILE_TEMPLATE);
      expect(this.$http.post).toHaveBeenCalledWith('fake-url', requestData);
    });

    it('should POST to config templates url for both backendTypes are used', function (this: Test) {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
      const createData = {
        profileName: 'fake-profile-name',
        voiceServerDomainName: 'fake-voice-server-domain',
        udsServerAddress: 'fake-uds-server',
        udsBackupServerAddress: 'fake-uds-backupserver',
      };
      this.JabberToWebexTeamsService.create(createData);
      const requestData = _.assignIn({
        templateName: createData.profileName,
        VoiceMailServer: createData.voiceServerDomainName,
        CUCMServer: createData.udsServerAddress,
        BackupCUCMServer: createData.udsBackupServerAddress,
      }, PROFILE_TEMPLATE);
      expect(this.$http.post).toHaveBeenCalledWith('fake-url', requestData);
    });
  });

  describe('updateUcManagerProfile', () => {
    it('should update the profile', function (this: Test, done) {
      const options = {
        profileName: 'profileName',
        voiceServerDomainName: 'voiceServerDomainName',
        udsServerAddress: 'udsServerAddress',
        udsBackupServerAddress: 'udsBackupServerAddress',
      };
      spyOn(this.JabberToWebexTeamsService, 'getConfigTemplatesUrl').and.returnValue('fake-url');
      const patchSpy = spyOn(this.$http, 'patch').and.returnValue(this.$q.resolve({ data: 'fake-data' }));
      this.JabberToWebexTeamsService.updateUcManagerProfile('12345', options).then(() => {
        const patchArgs = patchSpy.calls.mostRecent().args;
        expect(patchArgs[0]).toBe('fake-url/12345');
        const requestData = JSON.parse(patchArgs[1]);
        expect(requestData.profileName).toBe('profileName');
        expect(requestData.voiceServerDomainName).toBe('voiceServerDomainName');
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });
  });

  describe('savePrereqsSettings():', () => {
    beforeEach(function () {
      spyOn(this.JabberToWebexTeamsService, 'getConfigTemplatesUrl').and.returnValue('fake-url');
      spyOn(JabberToWebexTeamsUtil, 'mkPrereqsSettingsRequest').and.returnValue('fake-request-data');
    });

    it('should POST to config templates url with default request data payload', function (this: Test) {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve());
      this.JabberToWebexTeamsService.savePrereqsSettings({ allPrereqsDone: true });
      this.$scope.$apply();
      expect(this.$http.post).toHaveBeenCalledWith('fake-url', 'fake-request-data');
    });

    it('should resolve with the result of passing response data to "toPrereqsSettings()"', function (this: Test, done) {
      spyOn(this.$http, 'post').and.returnValue(this.$q.resolve({ data: 'fake-data' }));
      spyOn(this.JabberToWebexTeamsService, 'toPrereqsSettings').and.returnValue('fake-resolved-result');
      this.JabberToWebexTeamsService.savePrereqsSettings({ allPrereqsDone: true }).then((fakeResolvedResult) => {
        expect(this.JabberToWebexTeamsService.toPrereqsSettings).toHaveBeenCalledWith('fake-data');
        expect(fakeResolvedResult).toBe('fake-resolved-result' as any);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });
  });

  describe('hasAllPrereqsSettingsDone():', () => {
    beforeEach(function () {
      spyOn(this.JabberToWebexTeamsService, 'getConfigTemplatesUrl').and.returnValue('fake-url');
    });

    it('should GET to config templates url with default "filter" param', function (this: Test) {
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve());
      this.JabberToWebexTeamsService.hasAllPrereqsSettingsDone();
      this.$scope.$apply();
      expect(this.$http.get).toHaveBeenCalledWith('fake-url', {
        params: {
          filter: `templateType eq "${PREREQS_CONFIG_TEMPLATE_TYPE}" and templateName eq "${PREREQS_CONFIG_TEMPLATE_TYPE}"`,
        },
      });
    });

    it('should resolve with true if the response contains a "totalResults" property that is "1"', function (this: Test, done) {
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve({
        data: {
          totalResults: '1',
        },
      }));
      this.JabberToWebexTeamsService.hasAllPrereqsSettingsDone().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(true);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });

    it('should resolve with false if the response contains a "totalResults" property that is less than "1"', function (this: Test, done) {
      const fakeResolvedResult = {};

      // "totalResults" is "0"
      _.set(fakeResolvedResult, 'data.totalResults', '0');
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve(fakeResolvedResult));
      this.JabberToWebexTeamsService.hasAllPrereqsSettingsDone().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(false);
      }).catch(fail);
      this.$scope.$apply();

      // "totalResults" is "-1"
      _.set(fakeResolvedResult, 'data.totalResults', '-1');
      this.JabberToWebexTeamsService.hasAllPrereqsSettingsDone().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(false);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });

    it('should resolve with false if the GET call rejects', function (this: Test, done) {
      spyOn(this.$http, 'get').and.returnValue(this.$q.reject());
      this.JabberToWebexTeamsService.hasAllPrereqsSettingsDone().then((result) => {
        expect(result).toBe(false);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });
  });

  describe('toPrereqsSettings():', () => {
    it('should return an object with "id", "templateType", "templateName" and "allPrereqsDone" properties, with "allPrereqsDone" property converted to boolean', function (this: Test) {
      const fakeResponse = {
        schemas: ['fake-schema'],
        templateType: 'fake-template-type',
        templateName: 'fake-template-name',
        id: 'fake-id',
        meta: {},
        allPrereqsDone: 'true',
      };
      expect(this.JabberToWebexTeamsService.toPrereqsSettings(fakeResponse)).toEqual({
        id: 'fake-id',
        templateType: 'fake-template-type',
        templateName: 'fake-template-name',
        allPrereqsDone: true,
      });

      _.set(fakeResponse, 'allPrereqsDone', 'false');
      expect(this.JabberToWebexTeamsService.toPrereqsSettings(fakeResponse)).toEqual({
        id: 'fake-id',
        templateType: 'fake-template-type',
        templateName: 'fake-template-name',
        allPrereqsDone: false,
      });
    });
  });

  describe('hasAnyJabberTemplate():', () => {
    beforeEach(function () {
      spyOn(this.JabberToWebexTeamsService, 'getConfigTemplatesUrl').and.returnValue('fake-url');
    });

    it('should GET to config templates url with default "filter" param', function (this: Test) {
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve());
      this.JabberToWebexTeamsService.hasAnyJabberTemplate();
      expect(this.$http.get).toHaveBeenCalledWith('fake-url', {
        params: {
          filter: `templateType eq "${JABBER_CONFIG_TEMPLATE_TYPE}"`,
        },
      });
    });

    it('should resolve with true if the response contains a "totalResults" property that not less than 1', function (this: Test, done) {
      const fakeResolvedResult = {};

      // "totalResults" is "1"
      _.set(fakeResolvedResult, 'data.totalResults', '1');
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve(fakeResolvedResult));
      this.JabberToWebexTeamsService.hasAnyJabberTemplate().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(true);
      }).catch(fail);
      this.$scope.$apply();

      // "totalResults" is "2"
      _.set(fakeResolvedResult, 'data.totalResults', '2');
      this.JabberToWebexTeamsService.hasAnyJabberTemplate().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(true);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });

    it('should resolve with false if the response contains a "totalResults" property that is less than 1', function (this: Test, done) {
      const fakeResolvedResult = {};

      // "totalResults" is "0"
      _.set(fakeResolvedResult, 'data.totalResults', '0');
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve(fakeResolvedResult));
      this.JabberToWebexTeamsService.hasAnyJabberTemplate().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(false);
      }).catch(fail);
      this.$scope.$apply();

      // "totalResults" is "-1"
      _.set(fakeResolvedResult, 'data.totalResults', '-1');
      this.JabberToWebexTeamsService.hasAnyJabberTemplate().then((parsedResolvedResult) => {
        expect(parsedResolvedResult).toBe(false);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });

    it('should resolve with false if the GET call rejects', function (this: Test, done) {
      spyOn(this.$http, 'get').and.returnValue(this.$q.reject());
      this.JabberToWebexTeamsService.hasAnyJabberTemplate().then((result) => {
        expect(result).toBe(false);
        _.defer(done);
      }).catch(fail);
      this.$scope.$apply();
    });
  });
});
