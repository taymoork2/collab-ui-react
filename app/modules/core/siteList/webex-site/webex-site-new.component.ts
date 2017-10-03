import { IWebExSite, ISiteNameError, SiteErrorType } from
  'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { Config } from 'modules/core/config/config';
import { TrialTimeZoneService } from 'modules/core/trials/trialTimeZone.service';
import { TrialWebexService } from 'modules/core/trials/trialWebex.service';
import { EventNames } from './webex-site.constants';

class WebexSiteNewCtrl implements ng.IComponentController {

  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 0,
  };
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $scope: ng.IScope,
    private Config: Config,
    private TrialTimeZoneService: TrialTimeZoneService,
    private TrialWebexService: TrialWebexService,

  ) {

  }
  public siteSetupForm: ng.IFormController;
  public siteErrorType = SiteErrorType;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };

  public setupTypeLegacy = this.Config.setupTypes.legacy;
  public currentSubscription = '';
  public selectTimeZonePlaceholder = this.$translate.instant('firstTimeWizard.selectTimeZonePlaceholder');
  public timeZoneOptions;
  public audioPackage = '';
  public disableValidateButton = false;
  public onSitesAdd: Function;
  public onValidationStatusChange: Function;
  public sitesArray: IWebExSite[] = [];
  public newSitesArray: IWebExSite[] = [];

  public $onChanges(changes) {
    if (changes.audioPackage) {
      this.audioPackage = changes.audioPackage.currentValue;
    }
    if (changes.sites) {
      this.sitesArray = _.clone(changes.sites.currentValue);
    }
  }

  public addSite(site) {
    this.newSitesArray.push(site);
    this.onValidationStatusChange({ isValid: true });
  }

  public removeSite(index: number): void {
    this.newSitesArray.splice(index, 1);
    this.onValidationStatusChange({ isValid: this.newSitesArray.length > 0 });
  }

  public validateMeetingSite(): void {
    this.disableValidateButton = true;
    if (_.isEmpty(this.siteModel.siteUrl)) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.pleaseEnterSiteName'), this.siteErrorType.URL);
      return;
    }
    if (_.isEmpty(this.siteModel.timezone)) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.pleaseSelectTimeZone'), this.siteErrorType.TIME_ZONE);
      return;
    }
    if (this.siteModel.setupType === undefined) {
      this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.noUserManagementSelected'), this.siteErrorType.USER_MGMT);
      return;
    }
    const siteName = this.siteModel.siteUrl.concat(this.Config.siteDomainUrl.webexUrl);
    this.validateWebexSiteUrl(siteName).then((response) => {
      if (response.isValid && (response.errorCode === 'validSite')) {
        //SparkControlHub user management means there is no setupType
        if (this.siteModel.setupType !== this.setupTypeLegacy) {
          delete this.siteModel.setupType;
        }
        this.addSite(_.clone(this.siteModel));
        this.clearWebexSiteInputs();
      } else {
        if (response.errorCode === 'duplicateSite') {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.duplicateSite'), this.siteErrorType.URL);
        } else {
          this.showError(this.$translate.instant('firstTimeWizard.meetingSettingsError.enteredSiteNotValid'), this.siteErrorType.URL);
        }
        return;
      }
    }).catch(() => {
      this.clearWebexSiteInputs();
    }).finally(() => {
      this.disableValidateButton = false;
    });
  }

  public $onInit(): void {
    this.timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
    this.$scope.$on(EventNames.addSites, () => {
      this.onSitesAdd({ sites: this.newSitesArray, isValid: true });
    });
  }

  private validateWebexSiteUrl(siteName): ng.IPromise<any> {
    const source = this.Config.shallowValidationSourceTypes.serviceSetup;
    return this.TrialWebexService.validateSiteUrl(siteName, source);
  }

  private showError(msg, errorType?: SiteErrorType) {
    this.error.isError = true;
    this.error.errorMsg = msg;
    if (!_.isUndefined(errorType)) {
      this.error.errorType = errorType;
    }
    this.disableValidateButton = false;
  }

  public onInputChange() {
    this.clearError();
  }

  private clearError(): void {

    this.error.isError = false;
    this.error.errorMsg = '';
    delete this.error.errorType;
  }

  private clearWebexSiteInputs(): void {
    this.siteModel.siteUrl = '';
    this.siteModel.timezone = '';
    this.siteModel.setupType = undefined;
  }

  public getSitesAudioPackageDisplay() {
    if (!(this.audioPackage)) {
      return null;
    }

    const audioPackageType = this.$translate.instant('subscriptions.licenseTypes.' + this.audioPackage);
    const audioPackageDisiplay = this.$translate.instant('firstTimeWizard.audioPackageWithType', { type: audioPackageType });
    //TODO: algendel 9/23 when we have audio partner name requirement add:
    /*if (this.audioPartnerName) {
      audioPackageDisplay = this.$translate.instant('firstTimeWizard.conferencingAudioProvided', {
        partner:  this.audioPartnerName,
        service: audioPackageDisplay,
      });
    }*/
    return audioPackageDisiplay;
  }
}


export class WebexSiteNewComponent implements ng.IComponentOptions {
  public controller = WebexSiteNewCtrl;
  public template = require('modules/core/siteList/webex-site/webex-site-new.html');
  public bindings = {
    sites: '<',
    onSitesAdd: '&',
    onValidationStatusChange: '&',
    audioPackage: '<',
  };
}

