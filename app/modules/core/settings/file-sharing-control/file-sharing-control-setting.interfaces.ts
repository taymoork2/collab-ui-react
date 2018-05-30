import { FileSharingControlModelType } from './file-sharing-control-setting.types';

export interface IDownloadUploadModel {
  download: boolean;
  upload: boolean;
}

export type IFileSharingControlModel = {
  [key in FileSharingControlModelType]: IDownloadUploadModel;
};
