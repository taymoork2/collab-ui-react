export const SERVICE_SCHEMAS: string[] = ['urn:cisco:codev:identity:template:core:1.0'];
export const PROFILE_TEMPLATE = {
  schemas: SERVICE_SCHEMAS,
  templateType: 'jabber',
};
export const PREREQS_CONFIG_TEMPLATE_TYPE = 'jabber-to-webex-teams-prereqs';
export const PREREQS_CONFIG_TEMPLATE = {
  schemas: SERVICE_SCHEMAS,
  templateType: PREREQS_CONFIG_TEMPLATE_TYPE,
  templateName: PREREQS_CONFIG_TEMPLATE_TYPE,
};

export interface IConfigTemplateRequest {
  schemas: string[];
  templateType: string;
  templateName: string;
}

export interface IConfigTemplateResponse extends IConfigTemplateRequest {
  id: string;
  meta: object;
}

export interface IUcManagerProfile extends IConfigTemplateResponse {
  VoiceMailServer: string;
  CUCMServer: string;
  BackupVoiceMailServer: string;
  VoiceServicesDomain: string;
  BackupCUCMServer: string;
  cisEntryCreator: string;
  cisEntryModifier: string;
}

export interface IPrereqsSettingsRequest extends IConfigTemplateRequest {
  allPrereqsDone: string;
}

export interface IPrereqsSettingsResponse extends IConfigTemplateResponse {
  allPrereqsDone: string;
}

export interface IPrereqsSettings {
  id: string;
  templateType: string;
  templateName: string;
  allPrereqsDone: boolean;
}
