export const SERVICE_SCHEMAS: string[] = ['urn:cisco:codev:identity:template:core:1.0'];
export const PROFILE_TEMPLATE: object = { schemas: SERVICE_SCHEMAS, templateType: 'jabber' };

export interface IUcManagerProfile {
  schemas: string[];
  id: string;
  meta: object;
  templateType: string;
  templateName: string;
  VoiceMailServer: string;
  CUCMServer: string;
  BackupVoiceMailServer: string;
  VoiceServicesDomain: string;
  BackupCUCMServer: string;
  cisEntryCreator: string;
  cisEntryModifier: string;
}
