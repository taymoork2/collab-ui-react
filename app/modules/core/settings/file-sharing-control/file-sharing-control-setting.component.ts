import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { IFileShareControl } from 'modules/core/shared/org-settings/org-settings.interfaces';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';
import { FileShareControlType, WhiteboardFileShareControlType } from 'modules/core/shared/org-settings/org-settings.types';
import { ProPackSettingSection } from '../proPackSettingSection';
import { IDownloadUploadModel, IFileSharingControlModel } from './file-sharing-control-setting.interfaces';
import { FileSharingControlModelType } from './file-sharing-control-setting.types';

export class FileSharingControlSettingController {
  public allowWhiteboards = false;
  public isProPackPurchased = false;
  public isLoaded = false;
  public supportsWhiteboardFileShareControl = false;

  private hasWarningDisplayed = false;
  private model = this.mkFileSharingControlModel();

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private FeatureToggleService,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
    private OrgSettingsService: OrgSettingsService,
    private ProPackService: ProPackService,
  ) {}

  public $onInit() {
    this.loadSetting();
  }

  public loadSetting() {
    const promises = {
      supportsWhiteboardFileShareControl: this.FeatureToggleService.atlasWhiteboardFileShareControlGetStatus()
        .then(supportsWhiteboardFileShareControl => this.supportsWhiteboardFileShareControl = supportsWhiteboardFileShareControl),
      fileSharingControl: this.OrgSettingsService.getFileShareControl(this.Authinfo.getOrgId())
        .then(fileShareControl => this.model = this.mkFileSharingControlModel(fileShareControl)),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled()
        .then(isPurchased => this.isProPackPurchased = isPurchased),
      whiteboardFileShareControl: this.OrgSettingsService.getWhiteboardFileShareControl(this.Authinfo.getOrgId())
        .then(whiteboardFileShareControl => this.allowWhiteboards = this.isAllowWhiteboards(whiteboardFileShareControl)),
    };

    this.$q.all(promises)
      .then(() => this.isLoaded = true)
      .catch(_.noop);
  }

  public updateAllowWhiteboards(allowWhiteboards: boolean): void {
    this.OrgSettingsService.setWhiteboardFileShareControl(
      this.Authinfo.getOrgId(),
      allowWhiteboards ? WhiteboardFileShareControlType.ALLOW : WhiteboardFileShareControlType.BLOCK,
    ).then(() => {
      this.Notification.success('firstTimeWizard.messengerFileSharingControlSuccess');
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerFileSharingControlError');
      this.allowWhiteboards = !allowWhiteboards;
    });
  }

  private isAllowWhiteboards(whiteboardFileShareControl: WhiteboardFileShareControlType): boolean {
    return whiteboardFileShareControl === WhiteboardFileShareControlType.ALLOW;
  }

  public get isCheckboxDisabled(): boolean {
    return !this.isLoaded || !this.isProPackPurchased;
  }

  public get isBlockDesktopAppDownload(): boolean {
    return this.model.blockDesktopApp.download;
  }

  public set isBlockDesktopAppDownload(value: boolean) {
    this.setDownloadCheckbox(FileSharingControlModelType.BLOCK_DESKTOP, value);
  }

  public get isBlockWebAppDownload(): boolean {
    return this.model.blockWebApp.download;
  }

  public set isBlockWebAppDownload(value: boolean) {
    this.setDownloadCheckbox(FileSharingControlModelType.BLOCK_WEBAPP, value);
  }

  public get isBlockMobileAppDownload(): boolean {
    return this.model.blockMobileApp.download;
  }

  public set isBlockMobileAppDownload(value: boolean) {
    this.setDownloadCheckbox(FileSharingControlModelType.BLOCK_MOBILE, value);
  }

  public get isBlockBotsDownload(): boolean {
    return this.model.blockBots.download;
  }

  public set isBlockBotsDownload(value: boolean) {
    this.setDownloadCheckbox(FileSharingControlModelType.BLOCK_BOTS, value);
  }

  public get isBlockDesktopAppUpload(): boolean {
    return this.model.blockDesktopApp.upload;
  }

  public set isBlockDesktopAppUpload(value: boolean) {
    this.setUploadCheckbox(FileSharingControlModelType.BLOCK_DESKTOP, value);
  }

  public get isBlockWebAppUpload(): boolean {
    return this.model.blockWebApp.upload;
  }

  public set isBlockWebAppUpload(value: boolean) {
    this.setUploadCheckbox(FileSharingControlModelType.BLOCK_WEBAPP, value);
  }

  public get isBlockMobileAppUpload(): boolean {
    return this.model.blockMobileApp.upload;
  }

  public set isBlockMobileAppUpload(value: boolean) {
    this.setUploadCheckbox(FileSharingControlModelType.BLOCK_MOBILE, value);
  }

  public get isBlockBotsUpload(): boolean {
    return this.model.blockBots.upload;
  }

  public set isBlockBotsUpload(value: boolean) {
    this.setUploadCheckbox(FileSharingControlModelType.BLOCK_BOTS, value);
  }

  private setDownloadCheckbox(modelKey: keyof IFileSharingControlModel, value: boolean): void {
    this.getConfirmation(value).then(() => {
      const downloadUploadModel = this.model[modelKey];
      const {
        download: origDownload,
        upload: origUpload,
      } = downloadUploadModel;
      downloadUploadModel.download = value;
      if (value) {
        downloadUploadModel.upload = true;
      }
      this.updateFileSharingControlSetting().catch(() => {
        downloadUploadModel.download = origDownload;
        downloadUploadModel.upload = origUpload;
      });
    }).catch(_.noop);
  }

  private setUploadCheckbox(modelKey: keyof IFileSharingControlModel, value: boolean): void {
    this.getConfirmation(value).then(() => {
      this.model[modelKey].upload = value;
      this.updateFileSharingControlSetting().catch(() => {
        this.model[modelKey].upload = !value;
      });
    }).catch(_.noop);
  }

  private updateFileSharingControlSetting(): ng.IPromise<void> {
    if (!this.isLoaded) {
      return this.$q.reject();
    }
    return this.OrgSettingsService.setFileShareControl(
      this.Authinfo.getOrgId(),
      this.mkFileShareControl(this.model),
    ).then(() => {
      this.Notification.success('firstTimeWizard.messengerFileSharingControlSuccess');
    })
    .catch((response) => {
      this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerFileSharingControlError');
      return this.$q.reject(response);
    });
  }

  private getConfirmation(value: boolean): ng.IPromise<void> {
    if (this.hasWarningDisplayed || !value || this.allowWhiteboards) {
      return this.$q.resolve();
    }
    this.hasWarningDisplayed = true;
    return this.ModalService.open({
      title: this.$translate.instant('globalSettings.fileSharingControl.disableWhiteboardsTitle'),
      message: this.$translate.instant('globalSettings.fileSharingControl.disableWhiteboardsDescription'),
      close: this.$translate.instant('common.confirm'),
      dismiss: this.$translate.instant('common.cancel'),
    }).result;
  }

  private mkFileSharingControlModel(fileShareControl?: IFileShareControl): IFileSharingControlModel {
    const fileSharingControlModel = {
      blockDesktopApp: { download: false, upload: false },
      blockWebApp: { download: false, upload: false },
      blockMobileApp: { download: false, upload: false },
      blockBots: { download: false, upload: false },
    };

    if (fileShareControl) {
      this.setFileShareControlType(fileSharingControlModel.blockDesktopApp, fileShareControl.desktopFileShareControl);
      this.setFileShareControlType(fileSharingControlModel.blockWebApp, fileShareControl.webFileShareControl);
      this.setFileShareControlType(fileSharingControlModel.blockMobileApp, fileShareControl.mobileFileShareControl);
      this.setFileShareControlType(fileSharingControlModel.blockBots, fileShareControl.botFileShareControl);
    }

    return fileSharingControlModel;
  }

  private mkFileShareControl(model: IFileSharingControlModel): IFileShareControl {
    return {
      desktopFileShareControl: this.getFileShareControlType(model.blockDesktopApp),
      mobileFileShareControl: this.getFileShareControlType(model.blockMobileApp),
      webFileShareControl: this.getFileShareControlType(model.blockWebApp),
      botFileShareControl: this.getFileShareControlType(model.blockBots),
    };
  }

  private setFileShareControlType(model: IDownloadUploadModel, type: FileShareControlType): void {
    switch (type) {
      case FileShareControlType.BLOCK_BOTH:
        model.download = true;
        model.upload = true;
        break;
      case FileShareControlType.BLOCK_UPLOAD:
        model.upload = true;
        break;
    }
  }

  private getFileShareControlType(model: IDownloadUploadModel): FileShareControlType {
    if (model.upload && model.download) {
      return FileShareControlType.BLOCK_BOTH;
    }
    if (model.upload) {
      return FileShareControlType.BLOCK_UPLOAD;
    }
    return FileShareControlType.NONE;
  }
}

export class FileSharingControlSetting extends ProPackSettingSection {
  public description: string = '';
  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('fileSharingControl', proPackPurchased);
    this.description = 'globalSettings.fileSharingControl.description';
    this.subsectionLabel = '';
    this.subsectionDescription = '';
  }
}

export class FileSharingControlSettingComponent implements ng.IComponentOptions {
  public controller = FileSharingControlSettingController;
  public template = require('./file-sharing-control-setting.html');
}
