import { MediaMgrService } from 'modules/huron/media-mgr';
import { Notification } from 'modules/core/notifications';

export interface IMedia {
  mediaId: string;
  mediaState: string;
  filename: string;
  description: string;
  displayName: string;
  duration: string;
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

  public $onInit(): void {
    this.loading = true;
    this.MediaMgrService.getMedia()
      .then(media => this.mediaList = media)
      .catch(response => this.Notification.errorResponse(response, 'mediaMgrModal.getMediaListError'))
      .finally(() => this.loading = false);
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
        return this.MediaMgrService.getMedia();
      }).then(media => {
        this.mediaList = media;
        this.mohUploadInProgress = false;
      }).catch(error => {
        this.mohUploadInProgress = false;
        this.Notification.errorResponse(error, 'mediaMgrModal.uploadMediaError');
      });
  }

  public deleteMedia(mohFile: IMedia): void {
    this.MediaMgrService.deleteMedia(mohFile)
      .then(() => this.MediaMgrService.getMedia())
      .then(media => this.mediaList = media)
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
    this.setActiveMedia(undefined);
    this.setModal(ModalView.Trash);
  }

  public removeMedia(mohFile: IMedia): void {
    this.MediaMgrService.removeMedia(mohFile)
      .then(() => this.MediaMgrService.getMedia())
      .then(media => this.mediaList = media)
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
  }

  public cleanupFailedUpload(mohFile: IMedia): void {
    this.MediaMgrService.deleteMedia(mohFile)
      .then(() => this.MediaMgrService.removeMedia(mohFile))
      .then(() => this.MediaMgrService.getMedia())
      .then(media => this.mediaList = media)
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.cleanupMediaError'));
  }

  public deleteAll(): void {
    this.MediaMgrService.deleteAll()
      .then(() => this.MediaMgrService.getMedia())
      .then(media => this.mediaList = media)
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
  }

  public searchByString(searchStr: string): void {
    this.searchStr = searchStr;
  }

  public handleFileTypeError(): void {
    this.Notification.error('mediaMgrModal.unsupportedTypeError');
  }

  public convertSize(sizeBytes: number): number {
    const sizeMB = Math.round((sizeBytes / 1024) / 1024);
    return sizeMB;
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
