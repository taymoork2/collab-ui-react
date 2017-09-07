interface IGetFileSharingControlSettingResponse {
  blockDesktopAppDownload: boolean;
  blockWebAppDownload: boolean;
  blockMobileAppDownload: boolean;
  blockBotsDownload: boolean;

  blockDesktopAppUpload: boolean;
  blockWebAppUpload: boolean;
  blockMobileAppUpload: boolean;
  blockBotsUpload: boolean;
}
export class FileSharingControlSettingController {

  private _isBlockDesktopAppDownload: boolean = false;
  private _isBlockWebAppDownload: boolean = false;
  private _isBlockMobileAppDownload: boolean = false;
  private _isBlockBotsDownload: boolean = false;

  private _isBlockDesktopAppUpload: boolean = false;
  private _isBlockWebAppUpload: boolean = false;
  private _isBlockMobileAppUpload: boolean = false;
  private _isBlockBotsUpload: boolean = false;

  public isFileSharingControlSettingLoaded: boolean = false;
  public isProPackPurchased: boolean = false;

  private orgId: string;

  /* @ngInject */
  constructor(
    private $q,
    private AccountOrgService,
    private Authinfo,
    private ProPackService,
    private Notification,
  ) {
  }

  public $onInit() {
    this.orgId = this.Authinfo.getOrgId();
    this.loadSetting();
  }

  public loadSetting() {
    const promises = {
      fileSharingControl: this.AccountOrgService.getFileSharingControl(this.orgId),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.fileSharingControlSettingLoaded(response.fileSharingControl);
        this.isProPackPurchased = response.proPackPurchased;
      });
  }

  private fileSharingControlSettingLoaded(fileSharingControl: IGetFileSharingControlSettingResponse) {
    if (fileSharingControl !== undefined) {
      this._isBlockDesktopAppDownload = fileSharingControl.blockDesktopAppDownload;
      this._isBlockWebAppDownload = fileSharingControl.blockWebAppDownload;
      this._isBlockMobileAppDownload = fileSharingControl.blockMobileAppDownload;
      this._isBlockBotsDownload = fileSharingControl.blockBotsDownload;

      this._isBlockDesktopAppUpload = fileSharingControl.blockDesktopAppUpload;
      this._isBlockWebAppUpload = fileSharingControl.blockWebAppUpload;
      this._isBlockMobileAppUpload = fileSharingControl.blockMobileAppUpload;
      this._isBlockBotsUpload = fileSharingControl.blockBotsUpload;
    }
    this.isFileSharingControlSettingLoaded = true;
  }

  public get isBlockDesktopAppDownload(): boolean {
    return this._isBlockDesktopAppDownload;
  }

  public set isBlockDesktopAppDownload(value: boolean) {
    this._isBlockDesktopAppDownload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockWebAppDownload(): boolean {
    return this._isBlockWebAppDownload;
  }

  public set isBlockWebAppDownload(value: boolean) {
    this._isBlockWebAppDownload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockMobileAppDownload(): boolean {
    return this._isBlockWebAppDownload;
  }

  public set isBlockMobileAppDownload(value: boolean) {
    this._isBlockMobileAppDownload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockBotsDownload(): boolean {
    return this._isBlockBotsDownload;
  }

  public set isBlockBotsDownload(value: boolean) {
    this._isBlockBotsDownload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockDesktopAppUpload(): boolean {
    return this._isBlockDesktopAppUpload;
  }

  public set isBlockDesktopAppUpload(value: boolean) {
    this._isBlockDesktopAppUpload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockWebAppUpload(): boolean {
    return this._isBlockWebAppUpload;
  }

  public set isBlockWebAppUpload(value: boolean) {
    this._isBlockWebAppUpload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockMobileAppUpload(): boolean {
    return this._isBlockWebAppUpload;
  }

  public set isBlockMobileAppUpload(value: boolean) {
    this._isBlockMobileAppUpload = value;
    this.updateFileSharingControlSetting();
  }

  public get isBlockBotsUpload(): boolean {
    return this._isBlockBotsDownload;
  }

  public set isBlockBotsUpload(value: boolean) {
    this._isBlockBotsDownload = value;
    this.updateFileSharingControlSetting();
  }

  public updateFileSharingControlSetting() {
    if (this.isFileSharingControlSettingLoaded) {
      this.AccountOrgService.setFileSharingControl(this.orgId, {
        blockDesktopAppDownload : this._isBlockDesktopAppDownload,
        blockWebAppDownload : this._isBlockWebAppDownload,
        blockMobileAppDownload : this._isBlockMobileAppDownload,
        blockBotsDownload : this._isBlockBotsDownload,
        blockDesktopAppUpload : this._isBlockDesktopAppUpload,
        blockWebAppUpload : this._isBlockWebAppUpload,
        blockMobileAppUpload : this._isBlockMobileAppUpload,
        blockBotsUpload : this._isBlockBotsUpload})
        .then(() => {
          this.Notification.success('firstTimeWizard.messengerFileSharingControlSuccess');
        })
        .catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerFileSharingControlError');
        });
    }
  }
}
