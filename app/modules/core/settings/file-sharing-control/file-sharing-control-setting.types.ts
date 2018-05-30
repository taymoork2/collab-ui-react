export enum FileSharingControlModelType {
  BLOCK_BOTS = 'blockBots',
  BLOCK_DESKTOP = 'blockDesktopApp',
  BLOCK_MOBILE = 'blockMobileApp',
  BLOCK_WEBAPP = 'blockWebApp',
}

export interface IDownloadUploadModel {
  download: boolean;
  upload: boolean;
}

export type IFileSharingControlModel = {
  [key in FileSharingControlModelType]: IDownloadUploadModel;
};
