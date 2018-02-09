import { CsdmConfigurationService, IConfigRule } from '../../../squared/devices/services/CsdmConfigurationService';

export class DeviceBrandingController implements ng.IComponentController {
  private static brandingLogoRule = 'userinterface.branding';
  private static halfwakeBrandingRule = 'userinterface.halfwakebranding';
  private static halfwakeBackgroundRule = 'userinterface.halfwakebackground';

  get useDefaultBranding(): boolean {
    return this._useDefaultBranding;
  }

  set useDefaultBranding(value: boolean) {
    this._useDefaultBranding = value;
  }

  get file(): File {
    return this._file;
  }

  set file(value: File) {
    this._file = value;
  }

  private _file: File;
  public halfwakeBackground: ImgFile;
  public logolight: ImgFile;
  public logodark: ImgFile;
  private _useDefaultBranding = true;
  private useDefaultBrandingInitialValue = true;
  private applyInProgress = false;

  /* @ngInject */
  constructor(private Upload, private $q: ng.IQService, private Notification, private $state,
              private $http, private UrlConfig, private Authinfo, private CsdmConfigurationService: CsdmConfigurationService) {
    this.resetFiles();
  }

  private resetFiles() {
    this.halfwakeBackground = new ImgFile(this.Upload, this.Notification, this.$q, this.$http, this.UrlConfig, this.Authinfo);
    this.logolight = new ImgFile(this.Upload, this.Notification, this.$q, this.$http, this.UrlConfig, this.Authinfo);
    this.logodark = new ImgFile(this.Upload, this.Notification, this.$q, this.$http, this.UrlConfig, this.Authinfo);
  }

  public $onInit() {
    this.$q.all({
      wakeup: DeviceBrandingController.fetchRule(this.CsdmConfigurationService.getRuleForOrg(DeviceBrandingController.halfwakeBackgroundRule)),
      logoLight: DeviceBrandingController.fetchRule(this.CsdmConfigurationService.getRuleForOrg(DeviceBrandingController.halfwakeBrandingRule)),
      logoDark: DeviceBrandingController.fetchRule(this.CsdmConfigurationService.getRuleForOrg(DeviceBrandingController.brandingLogoRule)),
    }).then(p => {
      this.setFilesFromBrandingSetting(p, false);

    }).catch(r => {
      if (r && r.status === 404) {
        this.setFilesFromBrandingSetting(null, false);
      }
    });

    // this.CsdmConfigurationService.getRuleForOrg('branding')
    //   .then((brandingSetting) => {
    //     this.setFilesFromBrandingSetting(brandingSetting, false);
    //   })
    //   .catch((response) => {
    //     if (response && response.status === 404) {
    //       this.setFilesFromBrandingSetting({}, false);
    //     }
    //   });
  }

  private setFilesFromBrandingSetting(brandingSetting: IBrandingRules | null, reset) {
    if (reset) {
      this.resetFiles();
    }
    if (brandingSetting && (brandingSetting.logoDark || brandingSetting.logoLight || brandingSetting.wakeup)) {

      this.logolight.url = _.get<string>(brandingSetting, 'logoLight.value.url');
      this.logolight.changed = false;
      this.logolight.fetchTempDownloadUrl();
      this.logodark.url = _.get<string>(brandingSetting, 'logoDark.value.url');
      this.logodark.changed = false;
      this.logodark.fetchTempDownloadUrl();
      this.halfwakeBackground.url = _.get<string>(brandingSetting, 'wakeup.value.url');
      this.halfwakeBackground.changed = false;
      this.halfwakeBackground.fetchTempDownloadUrl();
      this._useDefaultBranding = false;
      this.useDefaultBrandingInitialValue = false;
    } else {
      this.useDefaultBrandingInitialValue = true;
      this._useDefaultBranding = true;
    }
  }

  public changeInBranding(): boolean {
    return (this.halfwakeBackground.changed || this.logolight.changed || this.logodark.changed) && !this.useDefaultBranding || this.useDefaultBranding !== this.useDefaultBrandingInitialValue;
  }

  public applyAllowed(): boolean {
    return (this.halfwakeBackground.isvalid || this.logolight.isvalid || this.logodark.isvalid) || (this.useDefaultBrandingInitialValue === false && this.useDefaultBranding);
  }

  public showDeviceBrandingExample() {
    this.$state.go('deviceBrandingExample', {});
  }

  public applyBranding() {
    this.applyInProgress = true;

    const urlUploadPromises = {
      wakeup: this.generateUploadPromise(this.halfwakeBackground),
      logolight: this.generateUploadPromise(this.logolight),
      logodark: this.generateUploadPromise(this.logodark),
    };

    this.$q.all(urlUploadPromises)
      .then(() => {
        return this.saveBrandingConfig();
      })
      .then((setting: IBrandingRules) => {
        return this.$q.all({
          wakeup: this.cleanOld(this.halfwakeBackground),
          logolight: this.cleanOld(this.logolight),
          logodark: this.cleanOld(this.logodark),
          settings: this.$q.resolve(setting),
        });
      })
      .then((results: { settings: IBrandingRules }) => {
        this.setFilesFromBrandingSetting(results.settings, true);
        return this.CsdmConfigurationService.notifyOrgSetting();
      })
      .then(_results => {
        this.Notification.success('partnerProfile.processing');
      })
      .catch((error) => {
        this.Notification.errorResponse(error, 'globalSettings.deviceBranding.failedToSave');
      })
      .finally(() => {
        this.applyInProgress = false;
      });
  }

  public saveBrandingConfig(): IPromise<IBrandingRules> {
    this.applyInProgress = true;
    if (this.useDefaultBranding) {
      return this.$q.all({
        wakeup: this.generateDeleteRulePromise(DeviceBrandingController.halfwakeBackgroundRule),
        logoLight: this.generateDeleteRulePromise(DeviceBrandingController.halfwakeBrandingRule),
        logoDark: this.generateDeleteRulePromise(DeviceBrandingController.brandingLogoRule),
        // combined: this.CsdmConfigurationService.deleteRuleForOrg('branding')
        //   .then(() => {
        //     return {};
        //   }, _error => {}),
      });
    } else {
      return this.$q.all({
        wakeup: this.halfwakeBackground.url
          ? this.generateUpdateRulePromise(DeviceBrandingController.halfwakeBackgroundRule, this.halfwakeBackground.url)
          : this.generateDeleteRulePromise(DeviceBrandingController.halfwakeBackgroundRule),
        logoLight: this.logolight.url
          ? this.generateUpdateRulePromise(DeviceBrandingController.halfwakeBrandingRule, this.logolight.url)
          : this.generateDeleteRulePromise(DeviceBrandingController.halfwakeBrandingRule),
        logoDark: this.logodark.url
          ? this.generateUpdateRulePromise(DeviceBrandingController.brandingLogoRule, this.logodark.url)
          : this.generateDeleteRulePromise(DeviceBrandingController.brandingLogoRule),
        // combined: this.CsdmConfigurationService.deleteRuleForOrg('branding')
        //   .then(() => {
        //     return {};
        //   }),
      }).then((rules: IBrandingRules) => {
        return rules;
      });
    }
  }

  private generateDeleteRulePromise(type: String): IPromise<null> {
    return this.CsdmConfigurationService.deleteRuleForOrg(type)
      .then(() => {
        return null;
      }, _error => null);
  }

  private generateUpdateRulePromise(type: String, url: String) {
    return this.CsdmConfigurationService.updateRuleForOrg<IBrandingRule>(type,
      {
        source: 'Spark',
        url: url,
      })
      .then(p => {
        console.info('success update');
        return p.data;
      }, _error => {
        console.info('failure update');
        return null;
      });
  }

  private generateUploadPromise(imgFile: ImgFile) {
    if (!imgFile.changed || !imgFile.file) {
      return this.$q.resolve({});
    }
    return imgFile.fetchNewUploadUrl()
      .then(() => {
        return imgFile.uploadImage();
      });
  }

  private cleanOld(imgFile: ImgFile) {
    if (!imgFile.origUrl || (imgFile.origUrl === imgFile.url && !this.useDefaultBranding)) {
      return this.$q.resolve({});
    }
    return imgFile.deleteOrig();
  }

  private static fetchRule(getRulePromise: ng.IPromise<any>): ng.IPromise<IConfigRule<IBrandingRule>> {
    return getRulePromise.then(
      r => r,
      _error => null,
    );
  }
}

interface IBrandingRule {
  source: string;
  url: string;
}

interface IBrandingRules {
  wakeup: IConfigRule<IBrandingRule> | null;
  logoLight: IConfigRule<IBrandingRule> | null;
  logoDark: IConfigRule<IBrandingRule> | null;
}

export class ImgFile {
  public changed = false;
  public status: string;
  private _url?: string;
  private _origUrl?: string;
  private _file?: File;
  public image;
  private uploadUrl: string;
  private _tempDownloadUrl: string | undefined;
  public uploadProgress: number = -1;
  public logoCriteria = {
    pattern: '.png',
    width: {
      min: '100',
    },
    size: {
      max: '40MB',
    },
  };

  get origUrl(): string | undefined {
    return this._origUrl;
  }

  public get fileSize() {
    return this._file && this._file.size || '';
  }

  public get file(): File | undefined {
    return this._file;
  }

  public get hasImg(): boolean {
    return !!(this._file || this._tempDownloadUrl);
  }

  get tempDownloadUrl(): string | any {
    return this._tempDownloadUrl;
  }

  public set file(value: File | undefined) {
    this._file = value;
    this._tempDownloadUrl = undefined;
    this.url = undefined;
    this.changed = true;
  }

  public removeFile() {
    this.file = undefined;
  }

  public get isvalid(): boolean {
    return !!(this.file || this.url);
  }

  get url(): string | undefined {
    return this._url;
  }

  set url(value: string | undefined) {
    this._url = value;
    if (!this._origUrl) {
      this._origUrl = value;
    }
  }

  constructor(private Upload, private Notification, private $q, private $http, private UrlConfig, private Authinfo) {
  }

  public fetchNewUploadUrl() {
    this.uploadProgress = 0;
    this.status = 'globalSettings.deviceBranding.uploading';
    const adminUrl = this.UrlConfig.getAdminServiceUrl();
    return this.$http.post(adminUrl + 'organizations/' + this.Authinfo.getOrgId() + '/config/files/')
      .then((res) => {
        if (res.data) {
          this.url = res.data.downloadUrl;
          this.uploadUrl = res.data.uploadUrl;
          this._tempDownloadUrl = _.get(res, 'data.tempURL', undefined);
        }
      });
  }

  public fetchTempDownloadUrl() {
    if (this.url && _.startsWith(this.url, this.UrlConfig.getAdminServiceUrl())) {
      this.$http.get(this.url + '/tempUrl').then((resp) => {
        this._tempDownloadUrl = _.get(resp, 'data.tempURL', undefined);
      });
    }

  }

  public uploadImage() {
    this.uploadProgress = 1;
    this.status = 'globalSettings.deviceBranding.uploading';
    return this.Upload.http({
      url: this.uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': this.file && this.file.type,
      },
      data: this.file,
    })
      .then(() => {
        this.uploadProgress = 100;
        this.status = 'globalSettings.deviceBranding.uploaded';
      }, (error) => {
        this.status = 'globalSettings.deviceBranding.uploadFailed';
        this.Notification.errorResponse(error, 'globalSettings.deviceBranding.uploadFailedWithReason');
        return this.$q.reject(error);
      }, (evt) => {
        this.uploadProgress = Math.round(100.0 * evt.loaded / evt.total);
      });
  }

  public deleteOrig() {
    return this.$http.delete(this.origUrl);
  }
}
