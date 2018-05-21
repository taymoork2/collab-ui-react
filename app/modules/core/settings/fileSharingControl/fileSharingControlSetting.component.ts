import { ProPackSettingSection } from '../proPackSettingSection';
import { FileSharingControlModel } from './fileSharingControl.model';
import { IToolkitModalService } from 'modules/core/modal';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { Notification } from 'modules/core/notifications';
import { OrgSettingsService } from 'modules/core/shared/org-settings/org-settings.service';

export class FileSharingControlSettingController {
  public isProPackPurchased = false;
  public isLoaded = false;

  private hasWarningDisplayed = false;
  private model = new FileSharingControlModel();

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
    private OrgSettingsService: OrgSettingsService,
    private ProPackService: ProPackService,
  ) {
  }

  public $onInit() {
    this.loadSetting();
  }

  public loadSetting() {
    const promises = {
      fileSharingControl: this.OrgSettingsService.getFileShareControl(this.Authinfo.getOrgId()),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.model = new FileSharingControlModel(response.fileSharingControl),
        this.isProPackPurchased = response.proPackPurchased;
        this.isLoaded = true;
      }).catch(_.noop);
  }

  public get isCheckboxDisabled(): boolean {
    return !this.isLoaded || !this.isProPackPurchased;
  }

  public get isBlockDesktopAppDownload(): boolean {
    return this.model.blockDesktopApp.download;
  }

  public set isBlockDesktopAppDownload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockDesktopApp.download = value;
      if (value) {
        this.model.blockDesktopApp.upload = value;
      }
      this.updateFileSharingControlSetting();
    })
    .catch(_.noop);
  }

  public get isBlockWebAppDownload(): boolean {
    return this.model.blockWebApp.download;
  }

  public set isBlockWebAppDownload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockWebApp.download = value;
      if (value) {
        this.model.blockWebApp.upload = value;
      }
      this.updateFileSharingControlSetting();
    });
  }

  public get isBlockMobileAppDownload(): boolean {
    return this.model.blockMobileApp.download;
  }

  public set isBlockMobileAppDownload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockMobileApp.download = value;
      if (value) {
        this.model.blockMobileApp.upload = value;
      }
      this.updateFileSharingControlSetting();
    });
  }

  public get isBlockBotsDownload(): boolean {
    return this.model.blockBots.download;
  }

  public set isBlockBotsDownload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockBots.download = value;
      if (value) {
        this.model.blockBots.upload = value;
      }
      this.updateFileSharingControlSetting();
    });
  }

  public get isBlockDesktopAppUpload(): boolean {
    return this.model.blockDesktopApp.upload;
  }

  public set isBlockDesktopAppUpload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockDesktopApp.upload = value;
      this.updateFileSharingControlSetting();
    });
  }

  public get isBlockWebAppUpload(): boolean {
    return this.model.blockWebApp.upload;
  }

  public set isBlockWebAppUpload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockWebApp.upload = value;
      this.updateFileSharingControlSetting();
    });
  }

  public get isBlockMobileAppUpload(): boolean {
    return this.model.blockMobileApp.upload;
  }

  public set isBlockMobileAppUpload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockMobileApp.upload = value;
      this.updateFileSharingControlSetting();
    });
  }

  public get isBlockBotsUpload(): boolean {
    return this.model.blockBots.upload;
  }

  public set isBlockBotsUpload(value: boolean) {
    this.getConfirmation(value).then(() => {
      this.model.blockBots.upload = value;
      this.updateFileSharingControlSetting();
    });
  }

  private updateFileSharingControlSetting() {
    if (this.isLoaded) {
      this.OrgSettingsService.setFileShareControl(
        this.Authinfo.getOrgId(),
        this.model.toFileShareControl(),
      ).then(() => {
        this.Notification.success('firstTimeWizard.messengerFileSharingControlSuccess');
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerFileSharingControlError');
      });
    }
  }

  private getConfirmation(value: boolean): ng.IPromise<void> {
    if (this.hasWarningDisplayed || !value) {
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
}

export class FileSharingControlSetting extends ProPackSettingSection {
  public description: string = '';
  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('fileSharingControl', proPackPurchased);
    this.description = 'globalSettings.fileSharingControl.description';
  }
}

export class FileSharingControlSettingComponent implements ng.IComponentOptions {
  public controller = FileSharingControlSettingController;
  public template = require('./fileSharingControlSetting.tpl.html');
}
