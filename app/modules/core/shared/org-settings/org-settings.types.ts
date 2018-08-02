export enum FileShareControlType {
  BLOCK_BOTH = 'BLOCK_BOTH',
  BLOCK_UPLOAD = 'BLOCK_UPLOAD',
  NONE = 'NONE',
}

export enum WhiteboardFileShareControlType {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
}

export enum OrgSetting {
  BLOCK_EXTERNAL_COMMUNICATIONS = 'blockExternalCommunications',
  CLIENT_SECURITY_POLICY = 'clientSecurityPolicy',
  SIP_CLOUD_DOMAIN = 'sipCloudDomain',
  WHITEBOARD_FILE_SHARE_CONTROL = 'whiteboardFileShareControl',
}

export type IOrgSettingsResponse = '' | IOrgSettings; // API can return 204 no content

interface IOrgSettings {
  orgSettings: string[];
}

export interface IFileShareControl {
  desktopFileShareControl: FileShareControlType;
  mobileFileShareControl: FileShareControlType;
  webFileShareControl: FileShareControlType;
  botFileShareControl: FileShareControlType;
}

export interface IFileShareControlOptions {
  desktopFileShareControl?: FileShareControlType;
  mobileFileShareControl?: FileShareControlType;
  webFileShareControl?: FileShareControlType;
  botFileShareControl?: FileShareControlType;
}
