import { SERVICE_SCHEMAS, IUcManagerProfile } from './jabber-to-webex-teams.types';

export class JabberToWebexTeamsUtil {
  public static mkUcManagerProfile(options: {
    schemas?: string[];
    id?: string;
    meta?: object;
    templateType?: string;
    templateName?: string;
    VoiceMailServer?: string;
    CUCMServer?: string;
    BackupVoiceMailServer?: string,
    VoiceServicesDomain?: string,
    BackupCUCMServer?: string,
    cisEntryCreator?: string,
    cisEntryModifier?: string,
  } = {}): IUcManagerProfile {
    return _.assignIn({
      schemas: SERVICE_SCHEMAS,
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
    }, options);
  }
}
