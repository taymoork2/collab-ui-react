import { JabberToWebexTeamsUtil } from './jabber-to-webex-teams.util';

describe('Util: JabberToWebexTeamsUtil:', () => {
  describe('mkUcManagerProfile():', () => {
    it('should return a new object with default property values', function () {
      expect(JabberToWebexTeamsUtil.mkUcManagerProfile()).toEqual({
        schemas: ['urn:cisco:codev:identity:template:core:1.0'],
        id: '',
        meta: {},
        templateType: '',
        templateName: '',
        VoiceMailServer: '',
        CUCMServer: '',
        BackupVoiceMailServer: '',
        VoiceServicesDomain: '',
        BackupCUCMServer: '',
        cisEntryCreator: '',
        cisEntryModifier: '',
      });
    });
  });

  describe('mkPrereqsSettingsRequest():', () => {
    it('should return a new object with default property values', function () {
      expect(JabberToWebexTeamsUtil.mkPrereqsSettingsRequest()).toEqual({
        schemas: ['urn:cisco:codev:identity:template:core:1.0'],
        templateType: 'jabber-to-webex-teams-prereqs',
        templateName: 'jabber-to-webex-teams-prereqs',
        allPrereqsDone: 'false',
      });
    });

    it('should return a new object with "allPrereqsDone" set to true or false as a string, depending on the input', function () {
      let result = JabberToWebexTeamsUtil.mkPrereqsSettingsRequest({ allPrereqsDone: true });
      expect(result.allPrereqsDone).toBe('true');

      result = JabberToWebexTeamsUtil.mkPrereqsSettingsRequest({ allPrereqsDone: false });
      expect(result.allPrereqsDone).toBe('false');
    });
  });
});
