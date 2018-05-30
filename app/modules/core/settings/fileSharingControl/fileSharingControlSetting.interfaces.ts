import { FileSharingControlModelType } from './fileSharingControlSetting.types';

export interface IDownloadUploadModel {
  download: boolean;
  upload: boolean;
}

export type IFileSharingControlModel = {
  [key in FileSharingControlModelType]: IDownloadUploadModel;
};
