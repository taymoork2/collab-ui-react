import { FileShareControlType } from './org-settings.types';

export interface IOrgSettingsResponse {
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
