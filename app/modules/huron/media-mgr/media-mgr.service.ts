import { IMedia } from 'modules/huron/media-mgr/media-mgr.component';
import { IMediaUpload } from 'modules/huron/media-mgr/media-mgr.component';

interface IUploadMetaDataResponse {
  createTime: string;
  displayName: string;
  filename: string;
  mediaId: string;
  orgId: string;
  uploadUrl: string;
  uploadUrlTtl: number;
}

export class MediaMgrService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private HuronConfig,
    private Upload: ng.angularFileUpload.IUploadService,
    private $http: ng.IHttpService,
  ) {}

  public getMedia(): ng.IPromise<IMedia[]> {
    return this.$http({
      method: 'GET',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media`,
    }).then((response) => {
      return response.data;
    });
  }

  public uploadMedia(media: IMediaUpload): ng.IPromise<any> {
    let mediaId = '';
    return this.getUploadUrl(media)
      .then((response) => {
        const data = <IUploadMetaDataResponse> response.data;
        mediaId = data.mediaId;
        return this.uploadToUrl(media.file, data.uploadUrl);
      }).then(() => {
        return this.transcodeMedia(mediaId, media.checksum);
      });
  }

  private getUploadUrl(media: IMediaUpload): ng.IPromise<any> {
    const urlReq: ng.IRequestConfig = {
      method: 'POST',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media`,
      data: {
        filename: media.filename,
        md5Sum: media.checksum,
        size: media.filesize,
      },
    };
    return this.$http(urlReq);
  }

  private uploadToUrl(file: File, url: string): ng.angularFileUpload.IUploadPromise<any> {
    const uploadReq: ng.IRequestConfig = {
      method: 'PUT',
      url: url,
      headers: {
        Authorization: undefined,
      },
      data: file,
    };
    return this.Upload.http(uploadReq);
  }

  private transcodeMedia(mediaId: string, checkSum: string): ng.IPromise<any> {
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

  public deleteMedia(media: IMedia): ng.IPromise<any> {
    const deleteReq: ng.IRequestConfig = {
      method: 'DELETE',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}`,
    };
    return this.$http(deleteReq);
  }

  public deleteAll(): ng.IPromise<any> {
    const deleteReq: ng.IRequestConfig = {
      method: 'DELETE',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media`,
    };
    return this.$http(deleteReq);
  }

  public removeMedia(media: IMedia): ng.IPromise<any> {
    const deleteReq: ng.IRequestConfig = {
      method: 'DELETE',
      url: `${this.HuronConfig.getMmsUrl()}/organizations/${this.Authinfo.getOrgId()}/media/${media.mediaId}?permanent=true`,
    };
    return this.$http(deleteReq);
  }

}
