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

const GET_MEDIA_INTERVAL = 6000;

export class MediaMgrCtrl implements ng.IComponentController {

  public media: IMedia;
  public mohUpload: IMediaUpload = {} as IMediaUpload;

  public loading: boolean = false;
  public ModalView = ModalView;
  public activeModal: ModalView = ModalView.Media;
  public activeMedia?: IMedia;
  public mohFileReadPercentComplete: number = 0;
  public mohUploadCancelInProgress: boolean = false;
  public mohUploadInProgress: boolean = false;
  public mohUploadPercentComplete: number = 0;
  public mohEditInProgress: boolean = false;
  public searchStr: string = '';
  public mediaList: IMedia[];
  public displayNameMessages = {
    required: this.$translate.instant('mediaMgrModal.displayName.required'),
    minlength: this.$translate.instant('mediaMgrModal.displayName.tooShortError'),
    maxlength: this.$translate.instant('mediaMgrModal.displayName.tooLongError'),
  };
  public descriptionMessages = {
    maxlength: this.$translate.instant('mediaMgrModal.description.tooLongError'),
  };
  public form: ng.IFormController;

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private MediaMgrService: MediaMgrService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private ModalService,
  ) {}

  public $onInit(): ng.IPromise<any> {
    this.loading = true;
    return this.getMedia()
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

  private sortByLastAccess(media: IMedia) {
    return media.lastModifyTime.epochSecond;
  }

  public getMedia(): ng.IPromise<any> {
    return this.MediaMgrService.getMedia()
    .then(media => {
      this.mediaList = media;
      this.mediaList = _.orderBy(this.mediaList, (media) => { return this.sortByLastAccess(media); }, 'desc');
      const inProgressMedia = _.find(this.mediaList, { mediaState: STATE_PROCESSING });
      if (!(_.isUndefined(inProgressMedia) || _.isNull(inProgressMedia))) {
        this.$timeout(() => this.getMedia(), GET_MEDIA_INTERVAL);
      }
    }).catch(response => this.Notification.errorResponse(response, 'mediaMgrModal.getMediaListError'));
  }

  public uploadMedia(file: File, filename: string, filesize: number, checksum: string): void {

    const uploadProgressCallback = (percentComplete: number) => {
      this.mohUploadPercentComplete = percentComplete;
    };

    this.mohUpload.file = file;
    this.mohUpload.filename = filename;
    this.mohUpload.filesize = filesize;
    this.mohUpload.checksum = checksum;
    this.mohUploadPercentComplete = 0;
    this.mohUploadInProgress = true;
    this.MediaMgrService.uploadMedia(this.mohUpload, uploadProgressCallback)
      .then(() => this.getMedia())
      .catch(error => {
        if (!this.mohUploadCancelInProgress) {
          this.Notification.errorResponse(error, 'mediaMgrModal.uploadMediaError');
        }
      }).finally(() => {
        this.mohUploadInProgress = false;
      });
  }

  public restoreMedia(mohFile: IMedia): void {
    this.MediaMgrService.restoreMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.restoreMediaError'));
  }

  public editMedia(): void {
    this.mohEditInProgress = true;
  }

  public cancelEditMedia(mohFile: IMedia): void {
    this.getMedia()
      .then(() => {
        const activeMedia = _.find(this.mediaList, { filename: mohFile.filename });
        this.setActiveMedia(activeMedia);
      }).finally(() => this.mohEditInProgress = false);
  }

  public saveEditMedia(mohFile: IMedia): void {
    this.MediaMgrService.editMedia(mohFile)
      .then(() => this.getMedia())
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.editMediaError'))
      .finally(() => this.mohEditInProgress = false);
  }

  public deleteMedia(mohFile: IMedia): void {
    this.MediaMgrService.deleteMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => {
        const mediaInUseError = true;  // Need to replace with error code check once API returns said error
        if (mediaInUseError) {
          this.ModalService.open({
            title: this.$translate.instant('mediaMgrModal.deleteMediaNotAvailable.title'),
            message: this.$translate.instant('mediaMgrModal.deleteMediaNotAvailable.message'),
            close: this.$translate.instant('mediaMgrModal.deleteMediaNotAvailable.confirm'),
          });
        } else {
          this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError');
        }
      });
  }

  public deletePermMedia(mohFile: IMedia): void {
    const tsMinus24Hours = Math.round(new Date().getTime() / 1000) - (24 * 3600);
    if (mohFile.lastModifyTime.epochSecond > tsMinus24Hours) {
      return this.ModalService.open({
        type: 'dialog',
        title: this.$translate.instant('mediaMgrModal.deleteMedia.title'),
        message: this.$translate.instant('mediaMgrModal.deleteMedia.message'),
        dismiss: this.$translate.instant('mediaMgrModal.deleteMedia.cancel'),
        close: this.$translate.instant('mediaMgrModal.deleteMedia.confirm'),
        btnType: 'alert',
      }).result.then(() => {
        this.MediaMgrService.deletePermMedia(mohFile)
        .then(() => {
          this.setActiveMedia(undefined);
          return this.getMedia();
        }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
      });
    } else {
      this.MediaMgrService.deletePermMedia(mohFile)
        .then(() => {
          this.setActiveMedia(undefined);
          return this.getMedia();
        }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
    }
  }

  public cancelUpload(): void {
    this.mohUploadCancelInProgress = true;
    this.ModalService.open({
      type: 'dialog',
      title: this.$translate.instant('mediaMgrModal.cancelUpload.title'),
      message: this.$translate.instant('mediaMgrModal.cancelUpload.message'),
      dismiss: this.$translate.instant('mediaMgrModal.cancelUpload.cancel'),
      close: this.$translate.instant('mediaMgrModal.cancelUpload.confirm'),
      btnType: 'alert',
    }).result.then(() => {
      this.MediaMgrService.cancelUpload()
        .then(() => this.MediaMgrService.getMedia())
        .then(media => {
          const myMedia: IMedia[] = media;
          const badMedia = _.find(myMedia, { filename: this.mohUpload.filename });
          if (!(_.isUndefined(badMedia) || _.isNull(badMedia))) {
            this.MediaMgrService.deleteMedia(badMedia)
              .then(() => this.MediaMgrService.deletePermMedia(badMedia))
              .then(() => this.getMedia())
              .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.cleanupMediaError'));
          }
        }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.cancelUploadError'));
    }).finally(() => this.mohUploadCancelInProgress = false);
  }

  public deletePermAll(): void {
    if (_.find(this.mediaList, function(m) {
      const tsMinus24Hours = Math.round(new Date().getTime() / 1000) - (24 * 3600);
      return m.lastModifyTime.epochSecond > tsMinus24Hours; })) {
      return this.ModalService.open({
        type: 'dialog',
        title: this.$translate.instant('mediaMgrModal.deleteMedia.title'),
        message: this.$translate.instant('mediaMgrModal.deleteMedia.message'),
        dismiss: this.$translate.instant('mediaMgrModal.deleteMedia.cancel'),
        close: this.$translate.instant('mediaMgrModal.deleteMedia.confirm'),
        btnType: 'alert',
      }).result.then(() => {
        this.MediaMgrService.deletePermAll()
          .then(() => this.getMedia())
          .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
      });
    } else {
      this.MediaMgrService.deletePermAll()
        .then(() => this.getMedia())
        .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.deleteMediaError'));
    }
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

  public closeMediaMgrModal() {
    if (!this.mohUploadInProgress) {
      return;
    }
    this.ModalService.open({
      type: 'dialog',
      title: this.$translate.instant('mediaMgrModal.exitMediaMgr.title'),
      message: this.$translate.instant('mediaMgrModal.exitMediaMgr.message'),
      dismiss: this.$translate.instant('mediaMgrModal.exitMediaMgr.cancel'),
      close: this.$translate.instant('mediaMgrModal.exitMediaMgr.confirm'),
      btnType: 'alert',
    }).result.then(() => {

    });
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
