import { CsdmConfigurationService } from '../../../squared/devices/services/CsdmConfigurationService';
export class DeviceBrandingController implements ng.IComponentController {
  get usePartnerLogo(): boolean {
    return this._usePartnerLogo;
  }

  set usePartnerLogo(value: boolean) {
    this._usePartnerLogo = value;
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
  private _usePartnerLogo = true;
  private useParnerLogoInitialVal = true;
  private applyInProgress = false;
  // private CsdmConfigurationService: CsdmConfigurationService;

  /* @ngInject */
  constructor(private Upload, private $q: ng.IQService, private Notification,
              private $http, private UrlConfig, private Authinfo, private CsdmConfigurationService: CsdmConfigurationService) {
    this.resetFiles();

    // this.CsdmConfigurationService = new CsdmConfigurationService($http, Authinfo, UrlConfig);
  }

  private resetFiles() {
    this.halfwakeBackground = new ImgFile(this.Upload, this.Notification, this.$q, this.$http, this.UrlConfig, this.Authinfo);
    this.logolight = new ImgFile(this.Upload, this.Notification, this.$q, this.$http, this.UrlConfig, this.Authinfo);
    this.logodark = new ImgFile(this.Upload, this.Notification, this.$q, this.$http, this.UrlConfig, this.Authinfo);
  }

  public $onInit() {
    this.CsdmConfigurationService.getRuleForOrg('branding')
      .then((brandingSetting) => {
        this.setFilesFromBrandingSetting(brandingSetting, false);
      })
      .catch((response) => {
        if (response && response.status === 404) {
          this.setFilesFromBrandingSetting({}, false);
        }
      });
  }

  private setFilesFromBrandingSetting(brandingSetting, reset) {
    if (reset) {
      this.resetFiles();
    }
    if (brandingSetting && brandingSetting.value) {

      this.logolight.url = <string>_.get(brandingSetting.value, 'logoLight.url');
      this.logolight.changed = false;
      this.logolight.fetchTempDownloadUrl();
      this.logodark.url = <string>_.get(brandingSetting.value, 'logoDark.url');
      this.logodark.changed = false;
      this.logodark.fetchTempDownloadUrl();
      this.halfwakeBackground.url = <string>_.get(brandingSetting.value, 'halfwakeBackground.url');
      this.halfwakeBackground.changed = false;
      this.halfwakeBackground.fetchTempDownloadUrl();
      this._usePartnerLogo = false;
      this.useParnerLogoInitialVal = false;
    }
  }

  public changeInBranding(): boolean {
    return (this.halfwakeBackground.changed || this.logolight.changed || this.logodark.changed) && !this.usePartnerLogo || this.usePartnerLogo !== this.useParnerLogoInitialVal;
  }

  public applyAllowed(): boolean {
    return (this.halfwakeBackground.isvalid && this.logolight.isvalid && this.logodark.isvalid) || (this.useParnerLogoInitialVal === false && this.usePartnerLogo);
  }

  public toggleLogo() {
    //
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
      .then((setting) => {
        return this.$q.all({
          wakeup: this.cleanOld(this.halfwakeBackground),
          logolight: this.cleanOld(this.logolight),
          logodark: this.cleanOld(this.logodark),
          settings: this.$q.resolve(setting),
        });
      })
      .then((results) => {
        this.setFilesFromBrandingSetting(_.get(results, 'settings.data'), true);
        this.Notification.success('Branding files uploaded');
      })
      .catch((error) => {
        this.Notification.errorResponse(error, 'Failed to save');
      })
      .finally(() => {
        this.applyInProgress = false;
      });
  }

  public saveBrandingConfig() {
    this.applyInProgress = true;
    if (this.usePartnerLogo) {
      return this.CsdmConfigurationService.deleteRuleForOrg('branding')
        .then(() => {
          //   this.Notification.success('Branding set to default');
          //   this.useParnerLogoInitialVal = this.usePartnerLogo;
          return {};
        });
    } else {
      return this.CsdmConfigurationService.updateRuleForOrg('branding', {
        logoLight: { url: this.logolight.url },
        logoDark: { url: this.logodark.url },
        halfwakeBackground: { url: this.halfwakeBackground.url },
      })
        .then((setting) => {
          return setting;
        });
    }
  }

  private generateUploadPromise(imgFile: ImgFile) {
    if (!imgFile.changed) {
      return this.$q.resolve({});
    }
    return imgFile.fetchNewUploadUrl()
      .then(() => {
        return imgFile.uploadImage();
      });
  }

  private cleanOld(imgFile: ImgFile) {
    if (!imgFile.origUrl || (imgFile.origUrl === imgFile.url && !this.usePartnerLogo)) {
      return this.$q.resolve({});
    }
    return imgFile.deleteOrig();
  }
}

class ImgFile {
  public changed = false;
  private _url: string;
  private _origUrl: string;
  private _file: File;
  public image;
  private uploadUrl: string;
  private _tempDownloadUrl: string | undefined;
  public uploadProgress: number | boolean = false;
  public logoCriteria = {
    pattern: '.png',
    width: {
      min: '100',
    },
    size: {
      max: '40MB',
    },
  };

  get origUrl(): string {
    return this._origUrl;
  }

  public get file(): File {
    return this._file;
  }

  public get hasImg(): boolean {
    return !!(this._file || this._tempDownloadUrl);
  }

  get tempDownloadUrl(): string | any {
    return this._tempDownloadUrl;
  }

  public set file(value: File) {
    this._file = value;
    this.changed = true;
  }

  public get isvalid(): boolean {
    return !!(this.file || this.url);
  }

  get url(): string {
    return this._url;
  }

  set url(value: string) {
    this._url = value;
    if (!this._origUrl) {
      this._origUrl = value;
    }
  }

  constructor(private Upload, private Notification, private $q, private $http, private UrlConfig, private Authinfo) {
  }

  public fetchNewUploadUrl() {
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
    return this.Upload.http({
      url: this.uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': this.file.type,
      },
      data: this.file,
    })
      .then(() => {
        this.uploadProgress = 100;
      }, (error) => {
        this.Notification.errorResponse(error, 'Failed to upload image. Reason:');
        return this.$q.reject(error);
      }, (evt) => {
        this.uploadProgress = 100.0 * evt.loaded / evt.total;
      });
  }

  public deleteOrig() {
    return this.$http.delete(this.origUrl);
  }
}
