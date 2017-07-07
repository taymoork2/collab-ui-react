import { MediaMgrService } from 'modules/huron/media-mgr';
import { Notification } from 'modules/core/notifications';

export interface IMedia {
  mediaId: string;
  mediaState: string;
  filename: string;
  description: string;
  displayName: string;
  duration: string;
  lastModifyTime: { nano: number, epochSecond: number };
  size: number;
  errorInfo: string;
}

export interface IMediaUpload {
  file: File;
  filename: string;
  filesize: number;
  checksum: string;
}

export enum ModalView {
  Media = 1,
  Trash,
}

const STATE_PROCESSING = 'PROCESSING';
const STATE_READY = 'READY';
const STATE_DELETED = 'DELETED';
const STATE_ERROR = 'ERROR';

export class MediaMgrCtrl implements ng.IComponentController {

  public media: IMedia;
  public mohUpload: IMediaUpload = {} as IMediaUpload;

  public loading: boolean = false;
  public ModalView = ModalView;
  public activeModal: ModalView = ModalView.Media;
  public activeMedia?: IMedia;
  public mohUploadInProgress: boolean = false;
  public mohUploadPercentComplete: number = 0;
  public searchStr: string = '';
  public mediaList: IMedia[];

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private MediaMgrService: MediaMgrService,
  ) {}

  public $onInit(): ng.IPromise<any> {
    return this.getMedia();
  }

  public setModal(modalSelection: ModalView): void {
    this.activeModal = modalSelection;
  }

  public isModalActive(modal: ModalView): boolean {
    return modal === this.activeModal;
  }

  public setActiveMedia(mediaSelection?: IMedia): void {
    this.activeMedia = mediaSelection;
  }

  public isActiveMedia(mediaSelection?: IMedia): boolean {
    return this.activeMedia === mediaSelection;
  }

  public isMohFileAvailable(mohFileState: string): boolean {
    return mohFileState === STATE_READY;
  }

  public isMohFileProcessing(mohFileState: string): boolean {
    return mohFileState === STATE_PROCESSING;
  }

  public isMohFileUnavailable(mohFileState: string): boolean {
    return mohFileState === STATE_ERROR;
  }

  public isMohFileDeleted(mohFileState: string): boolean {
    return mohFileState === STATE_DELETED;
  }

  public getMedia(): ng.IPromise<any> {
    this.loading = true;
    return this.MediaMgrService.getMedia()
    .then(media => {
      this.mediaList = media;
      this.mediaList = _.orderBy(this.mediaList, (media) => { return this.sortByLastAccess(media); }, 'desc');
      this.loading = false;
    }).catch(response => {
      this.Notification.errorResponse(response, 'mediaMgrModal.getMediaListError');
      this.loading = false;
    });
  }

  public sortByLastAccess(media: IMedia) {
    return media.lastModifyTime.epochSecond;
  }

  public readMediaStatus(filename: string, filesize: number, percentComplete: number): any {
    this.mohUpload.filename = filename;
    this.mohUpload.filesize = filesize;
    this.mohUploadInProgress = true;
    this.mohUploadPercentComplete = percentComplete;
  }

  public uploadMedia(file: File, filename: string, filesize: number, checksum: string): any {
    this.mohUpload.file = file;
    this.mohUpload.filename = filename;
    this.mohUpload.filesize = filesize;
    this.mohUpload.checksum = checksum;
    this.MediaMgrService.uploadMedia(this.mohUpload)
      .then(() => {
        this.mohUploadInProgress = false;
        return this.getMedia();
      }).catch(error => {
        this.mohUploadInProgress = false;
        this.Notification.errorResponse(error, 'mediaMgrModal.uploadMediaError');
      });
  }

  public restoreMedia(mohFile: IMedia): void {
    this.MediaMgrService.restoreMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.restoreMediaError'));
  }

  public deleteMedia(mohFile: IMedia): void {
    this.MediaMgrService.deleteMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
  }

  public removeMedia(mohFile: IMedia): void {
    this.MediaMgrService.removeMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
  }

  public cleanupFailedUpload(mohFile: IMedia): void {
    this.MediaMgrService.deleteMedia(mohFile)
      .then(() => this.MediaMgrService.removeMedia(mohFile))
      .then(() => this.getMedia())
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.cleanupMediaError'));
  }

  public deleteAll(): void {
    this.MediaMgrService.deleteAll()
      .then(() => this.getMedia())
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
  }

  public searchByString(searchStr: string): void {
    this.searchStr = searchStr;
  }

  public handleFileTypeError(): void {
    this.mohUploadInProgress = false;
    this.Notification.error('mediaMgrModal.unsupportedTypeError');
  }

  public getDisplayText(mohFile: IMedia): string {
    if (mohFile.description) {
      return mohFile.description;
    }
    return mohFile.filename;
  }

}

export class MediaMgrComponent implements ng.IComponentOptions {
  public controller = MediaMgrCtrl;
  public templateUrl = 'modules/huron/media-mgr/media-mgr.html';
  public bindings = {
    dismiss: '&',
    close: '&',
  };
}
