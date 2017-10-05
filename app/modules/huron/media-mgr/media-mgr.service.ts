import { IMedia } from './media-mgr.component';
import { IMediaUpload } from './media-mgr.component';
import { MAX_DISPLAY_NAME } from './media-mgr.component';

interface IUploadMetaDataResponse {
  createTime: string;
  displayName: string;
  filename: string;
  mediaId: string;
  orgId: string;
  uploadUrl: string;
  uploadUrlTtl: number;
}

export interface IVariantMetaDataResponse {
  createTime: string;
  downloadUrl: string;
  encoding: string;
  lastModifyTime: string;
  locale: string;
  md5Sum: string;
  mediaId: string;
  size: number;
  state: string;
  transcodeJobId: string;
  variantId: string;
}

export class MediaMgrService {

  public upload: ng.angularFileUpload.IUploadPromise<any>;

  /* @ngInject */
  constructor(
    private Authinfo,
    private HuronConfig,
    private Upload: ng.angularFileUpload.IUploadService,
    private $http: ng.IHttpService,
    private $q: ng.IQService,
  ) {}

  public getMedia(): ng.IPromise<IMedia[]> {
    return this.$http<IMedia[]>({
      method: 'GET',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media`,
    }).then(response => response.data);
  }

  public uploadMedia(media: IMediaUpload, uploadProgressCallback: (number) => void): ng.IPromise<any> {
    let mediaId = '';
    return this.getUploadUrl(media)
      .then((response) => {
        const data = <IUploadMetaDataResponse> response.data;
        mediaId = data.mediaId;
        return this.uploadToUrl(media.file, data.uploadUrl, uploadProgressCallback);
      }).then(() => {
        return this.transcodeMedia(mediaId, media.checksum);
      });
  }

  private getUploadUrl(media: IMediaUpload): ng.IPromise<angular.IHttpResponse<{}>> {
    const urlReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media`,
      data: {
        filename: media.filename,
        displayName: media.filename.substr(0, MAX_DISPLAY_NAME),
        md5Sum: media.checksum,
        size: media.filesize,
      },
    };
    return this.$http(urlReq);
  }

  private uploadToUrl(file: File, url: string, uploadProgressCallback: (number) => void): ng.angularFileUpload.IUploadPromise<any> {
    const uploadReq: ng.IRequestConfig = {
      method: 'PUT',
      url: url,
      headers: {
        Authorization: undefined,
      },
      data: file,
    };
    this.upload = this.Upload.http(uploadReq);
    this.upload.catch((response) => response.data);
    return this.upload
      .progress((event) => {
        uploadProgressCallback(Math.round(event.loaded / event.total * 100));
      });
  }

  public cancelUpload(): ng.IPromise<any> {
    if (this.upload) {
      this.upload.abort();
    }
    return this.$q.resolve();
  }

  private transcodeMedia(mediaId: string, checkSum: string): ng.IPromise<angular.IHttpResponse<{}>> {
    const transcodeReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${mediaId}/variants`,
      data: {
        action: 'TRANSCODE_AND_DELIVER',
        encoding: 'scpf',
        locale: 'en_US',
        md5Sum: checkSum,
      },
    };
    return this.$http(transcodeReq);
  }

  public downloadFromUrl(media: IMedia): ng.IPromise<angular.IHttpResponse<{}>>  {
    const urlReq: ng.IRequestConfig = {
      method: 'GET',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}/variants/${media.mediaId}`,
    };
    return this.$http(urlReq)
      .then((response) => {
        const data = <IVariantMetaDataResponse> response.data;
        const url = data.downloadUrl;
        const downloadReq: ng.IRequestConfig = {
          method: 'GET',
          url: url,
          responseType: 'arraybuffer',
          headers: {
            Authorization: undefined,
          },
        };
        return this.$http(downloadReq);
      });
  }

  public editMedia(media: IMedia): ng.IPromise<angular.IHttpResponse<{}>> {
    const editReq: ng.IRequestConfig = {
      method: 'PUT',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}`,
      data: {
        displayName: media.displayName,
        description: media.description,
      },
    };
    return this.$http(editReq);
  }

  public restoreMedia(media: IMedia): ng.IPromise<angular.IHttpResponse<{}>> {
    const deleteReq: ng.IRequestConfig = {
      method: 'PUT',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}`,
      data: {
        action: 'UNDELETE',
      },
    };
    return this.$http(deleteReq);
  }

  public deleteMedia(media: IMedia): ng.IPromise<angular.IHttpResponse<{}>> {
    const deleteReq: ng.IRequestConfig = {
      method: 'DELETE',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}`,
    };
    return this.$http(deleteReq);
  }

  public deletePermAll(): ng.IPromise<angular.IHttpResponse<{}>> {
    const deleteReq: ng.IRequestConfig = {
      method: 'DELETE',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media`,
    };
    return this.$http(deleteReq);
  }

  public deletePermMedia(media: IMedia): ng.IPromise<angular.IHttpResponse<{}>> {
    const deleteReq: ng.IRequestConfig = {
      method: 'DELETE',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}?permanent=true`,
    };
    return this.$http(deleteReq);
  }

}
