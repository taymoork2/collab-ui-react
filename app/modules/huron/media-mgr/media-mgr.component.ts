import { MediaMgrService } from 'modules/huron/media-mgr';
import { Notification } from 'modules/core/notifications';
import { AccessibilityService } from 'modules/core/accessibility';

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

const STATE_PROCESSING: string  = 'PROCESSING';
const STATE_READY: string = 'READY';
const STATE_DELETED: string = 'DELETED';
const STATE_ERROR: string = 'ERROR';

export const MAX_DISPLAY_NAME = 48;

const GET_MEDIA_INTERVAL: number = 30000;

const ERROR_DELETE_IN_USE: number = 106;

// html id tags
const MEDIA_DESCRIPTION: string = '#mediaDescription';
const MEDIA_DOWNLOAD: string = '#mediaDownload';
const MEDIA_SPINNER: string = '#mediaDownloadSpinner';
const MEDIA_TITLE: string = '#mediaTitle';
const SEARCH_FILTER: string = '#searchFilter';

export class MediaMgrCtrl implements ng.IComponentController {

  public media: IMedia;
  public mohUpload: IMediaUpload = {} as IMediaUpload;
  public loading: boolean = false;
  public dismiss: Function;
  public ModalView = ModalView;
  public activeModal: ModalView = ModalView.Media;
  public activeMedia?: IMedia;
  public mohUploadInProgress: boolean = false;
  public mohUploadPercentComplete: number = 0;
  public mohUploadCancelInProgress: boolean = false;
  public mohUploadCancelled: boolean = false;
  public mohDownloadInProgress: boolean = false;
  public mohCloseInProgress: boolean = false;
  public mohEditStatus = {
    title: false,
    description: false,
  };
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
    private $document: ng.IDocumentService,
    private $element: ng.IRootElementService,
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private AccessibilityService: AccessibilityService,
    private Notification: Notification,
    private MediaMgrService: MediaMgrService,
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

  public setActiveMedia(mediaSelection: IMedia | undefined): void {
    if ( this.mohDownloadInProgress ) {
      this.Notification.notify(this.$translate.instant('mediaMgrModal.downloadInProgress'));
    } else if ( mediaSelection !== this.activeMedia ) {
      // If edit in progress, cancel it!
      this.editMediaComplete();
      this.activeMedia = mediaSelection;
    }
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
        if (!this.mohUploadCancelled) {
          this.Notification.errorResponse(error, 'mediaMgrModal.uploadMediaError');
        }
      }).finally(() => {
        this.mohUploadInProgress = false;
        this.mohUploadCancelled = false;
      });
  }

  public downloadFromUrl(mohFile: IMedia): void {
    this.mohDownloadInProgress = true;
    this.AccessibilityService.setFocus(this.$element, MEDIA_SPINNER);
    this.MediaMgrService.downloadFromUrl(mohFile)
      .then(response => {
        const data = response.data;
        const fileName = mohFile.filename;
        const file = new this.$window.Blob([data], {
          type: 'application/octet-stream',
        });
        if (this.$window.navigator.msSaveOrOpenBlob) {
        // IE
          this.$window.navigator.msSaveOrOpenBlob(file, fileName);
        } else if (!('download' in this.$window.document.createElement('a'))) {
        // Pre-10 Safari
          this.$window.location.href = this.$window.URL.createObjectURL(file);
        } else {
          const downloadContainer = angular.element('<div><a></a></div>');
          const downloadLink = angular.element(downloadContainer.children()[0]);
          downloadLink.attr({
            href: this.$window.URL.createObjectURL(file),
            download: fileName,
            target: '_blank',
          });
          this.$document.find('body').append(downloadContainer);
          this.$timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, 100);
        }
      }).catch(error => {
        this.Notification.errorResponse(error, 'mediaMgrModal.downloadMediaError');
      }).finally(() => {
        this.mohDownloadInProgress = false;
        this.AccessibilityService.setFocus(this.$element, MEDIA_DOWNLOAD);
      });
  }

  public restoreMedia(mohFile: IMedia): void {
    this.MediaMgrService.restoreMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.restoreMediaError'));
  }

  public editMedia(content?: string): void {
    if (content === 'Title') {
      this.mohEditStatus.title = true;
      this.mohEditStatus.description = false;
      this.AccessibilityService.setFocus(this.$element, MEDIA_TITLE);
    } else if (content === 'Description') {
      this.mohEditStatus.title = false;
      this.mohEditStatus.description = true;
      this.AccessibilityService.setFocus(this.$element, MEDIA_DESCRIPTION);
    } else {
      this.mohEditStatus.title = true;
      this.mohEditStatus.description = true;
      this.AccessibilityService.setFocus(this.$element, MEDIA_TITLE);
    }
  }

  public editMediaComplete() {
    this.mohEditStatus.title = false;
    this.mohEditStatus.description = false;
    this.AccessibilityService.setFocus(this.$element, MEDIA_TITLE);
  }

  public mohEditInProgress(content?: string): boolean {
    switch (content) {
      case 'Title':
        if (this.mohEditStatus.title) {
          return true;
        }
        break;
      case 'Description':
        if (this.mohEditStatus.description) {
          return true;
        }
        break;
      case 'InlineEdit':
        if (this.mohEditStatus.title || this.mohEditStatus.description) {
          return true;
        }
        break;
      case 'FullEditMode':
        if (this.mohEditStatus.title && this.mohEditStatus.description) {
          return true;
        }
        break;
      default:
        if (this.mohEditStatus.title || this.mohEditStatus.description) {
          return true;
        }
        break;
    }
    return false;
  }

  public cancelEditMedia(mohFile: IMedia): void {
    this.getMedia()
      .then(() => {
        const activeMedia = _.find(this.mediaList, { filename: mohFile.filename });
        this.setActiveMedia(activeMedia);
      }).finally(() => this.editMediaComplete());
  }

  public saveEditMedia(mohFile: IMedia): void {
    this.MediaMgrService.editMedia(mohFile)
      .then(() => this.getMedia())
      .catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.editMediaError'))
      .finally(() => this.editMediaComplete());
  }

  public deleteMedia(mohFile: IMedia): void {
    this.MediaMgrService.deleteMedia(mohFile)
      .then(() => {
        this.setActiveMedia(undefined);
        this.AccessibilityService.setFocus(this.$element, SEARCH_FILTER);
        return this.getMedia();
      }).catch(error => {
        if (error.data.error.key === ERROR_DELETE_IN_USE) {
          this.ModalService.open({
            hideDismiss: true,
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

  public cancelUpload(): ng.IPromise<any> {
    this.mohUploadCancelInProgress = true;
    return this.ModalService.open({
      title: this.$translate.instant('mediaMgrModal.cancelUpload.title'),
      message: this.$translate.instant('mediaMgrModal.cancelUpload.message'),
      dismiss: this.$translate.instant('mediaMgrModal.cancelUpload.cancel'),
      close: this.$translate.instant('mediaMgrModal.cancelUpload.confirm'),
      btnType: 'alert',
    }).result.then(() => {
      return this.MediaMgrService.cancelUpload()
        .then(() => {
          this.mohUploadCancelled = true;
          return this.MediaMgrService.getMedia();
        }).then(media => {
          const myMedia: IMedia[] = media;
          const badMedia = _.find(myMedia, { filename: this.mohUpload.filename });
          if (!(_.isUndefined(badMedia) || _.isNull(badMedia))) {
            return this.cleanupMedia(badMedia);
          }
          return this.$q.resolve();
        }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.cancelUploadError'));
    }).catch(() => {
      return this.$q.reject();
    }).finally(() => {
      this.mohUploadCancelInProgress = false;
    });
  }

  public cleanupMedia(mohFile: IMedia): ng.IPromise<any> {
    return this.MediaMgrService.deleteMedia(mohFile)
      .then(() => this.MediaMgrService.deletePermMedia(mohFile))
      .then(() => {
        this.setActiveMedia(undefined);
        return this.getMedia();
      }).catch(error => this.Notification.errorResponse(error, 'mediaMgrModal.cleanupMediaError'));
  }

  public deletePermAll(): void {
    if (_.find(this.mediaList, function(m) {
      const tsMinus24Hours = Math.round(new Date().getTime() / 1000) - (24 * 3600);
      return m.lastModifyTime.epochSecond > tsMinus24Hours; })) {
      return this.ModalService.open({
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

  public getDuration(mohFile: IMedia): string {
    const minutes = Math.floor(Number(mohFile.duration) / 60);
    const seconds = Number(mohFile.duration) - minutes * 60;
    const finalTime = _.padStart(minutes.toString(), 2, '') + ':' + _.padStart(seconds.toString(), 2, '0');
    return finalTime;
  }

  public getDeleteTime(mohFile: IMedia): string {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(mohFile.lastModifyTime.epochSecond * 1000).toLocaleDateString('en-US', options);
  }

  public closeMediaMgrModal(): void {
    if (this.mohUploadInProgress) {
      this.mohCloseInProgress = true;
      this.cancelUpload()
        .then(() => this.dismiss())
        .catch(() => this.mohCloseInProgress = false);
    } else {
      this.dismiss();
    }
  }

  public uploadActionInProgress(): boolean {
    if (this.mohUploadInProgress || this.mohUploadCancelInProgress || this.mohCloseInProgress) {
      return true;
    }
    return false;
  }
}

export class MediaMgrComponent implements ng.IComponentOptions {
  public controller = MediaMgrCtrl;
  public template = require('modules/huron/media-mgr/media-mgr.html');
  public bindings = {
    dismiss: '&',
    close: '&',
  };
}
