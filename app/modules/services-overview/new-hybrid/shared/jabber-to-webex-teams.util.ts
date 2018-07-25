import { IPrereqsSettingsRequest, IUcManagerProfile, PREREQS_CONFIG_TEMPLATE, SERVICE_SCHEMAS } from './jabber-to-webex-teams.types';

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

  public static mkPrereqsSettingsRequest(options: {
    allPrereqsDone?: boolean,
  } = {}): IPrereqsSettingsRequest {
    // notes:
    // - as of 2018-07-23, because CI endpoint accepts config property values as strings only, we
    //   convert boolean to string, otherwise default to 'false'
    const strAllPrereqsDone = (_.has(options, 'allPrereqsDone')) ? options.allPrereqsDone + '' : 'false';
    return _.assignIn({}, PREREQS_CONFIG_TEMPLATE, {
      allPrereqsDone: strAllPrereqsDone,
    });
  }
}
