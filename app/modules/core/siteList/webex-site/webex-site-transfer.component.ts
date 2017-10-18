import { IWebExSite, ISiteNameError } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config } from 'modules/core/config/config';
import { TrialTimeZoneService } from 'modules/core/trials/trialTimeZone.service';
import { Notification } from 'modules/core/notifications';
import { EventNames } from './webex-site.constants';

class WebexSiteTransferCtrl implements ng.IComponentController {

  private currentSubscriptionId;
  public existingSites;
  public hasTrialSites;
  public showTransferCodeInput;
  public transferSiteCode;
  public migrateSiteUrl;
  public transferSiteUrl;
  public error: ISiteNameError = {
    isError: false,
    errorMsg: '',
  };
  public sitesArray: IWebExSite[] = [];
  public onValidationStatusChange: Function;
  public onSitesReceived: Function;

  public siteModel: IWebExSite = {
    siteUrl: '',
    timezone: '',
    centerType: '',
    quantity: 0,
  };

  private timeZoneOptions;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private Config: Config,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private TrialTimeZoneService: TrialTimeZoneService,
  ) {
  }

  public $onInit() {
    this.hasTrialSites = this.SetupWizardService.hasWebexMeetingTrial();
    this.timeZoneOptions = this.TrialTimeZoneService.getTimeZones();
    this.$scope.$on(EventNames.VALIDATE_TRANSFER_SITE, () => {
      this.processNext();
    });
  }

  public $onChanges(changes: ng.IOnChangesObject) {
    if (changes.currentSubscription) {
      this.currentSubscriptionId = changes.currentSubscription.currentValue;
    }
  }

  public checkValidTransferData() {
    this.clearError();
    let invalid = false;
    if (this.showTransferCodeInput) {
      const siteUrlEmpty = _.isEmpty(this.transferSiteUrl);
      const transferCodeEmpty = _.isEmpty(this.transferSiteCode);
      if ((siteUrlEmpty && !transferCodeEmpty) || (transferCodeEmpty && !siteUrlEmpty)) {
        invalid = true;
      }
      this.onValidationStatusChange({ isValid: !invalid });
    }

  }

  public processNext() {
    this.migrateTrialNext().then(() => {
      this.onSitesReceived({ sites: this.sitesArray, isValid: true });
    })
      .catch(() => {
        this.onValidationStatusChange({ isValid: false });
        this.onSitesReceived({ sites: null, isValid: false });
      });
  }

  public migrateTrialNext(): ng.IPromise<any> {
    if (_.isEmpty(this.transferSiteUrl) && _.isEmpty(this.transferSiteCode)) {
      this.stripTransferredSitesFromSitesArray();
      return this.$q.resolve();
    }
    const transferSiteDetails = {
      siteUrl: this.transferSiteUrl,
      transferCode: this.transferSiteCode,
    };
    if (!(_.endsWith(transferSiteDetails.siteUrl, this.Config.siteDomainUrl.webexUrl))) {
      transferSiteDetails.siteUrl += this.Config.siteDomainUrl.webexUrl;
    }
    return this.SetupWizardService.validateTransferCode(transferSiteDetails).then((response) => {
      const status = _.get(response, 'data.status');
      if (!status || status !== 'INVALID') {
        // if transferred sites have already been added and the back button clicked, strip old sites.
        if (!_.isEmpty(this.sitesArray)) {
          this.stripTransferredSitesFromSitesArray();
        }
        const transferredSitesArray = _.get(response, 'data.siteList');
        _.forEach(transferredSitesArray, (site) => {
          if (!(_.some(this.sitesArray, { siteUrl: site.siteUrl }))) {
            const transferredSiteModel = _.clone(this.siteModel);
            transferredSiteModel.siteUrl = site.siteUrl.replace(this.Config.siteDomainUrl.webexUrl, ''),
              transferredSiteModel.timezone = this.findTimezoneObject(site.timezone);
            transferredSiteModel.setupType = this.Config.setupTypes.transfer;
            this.sitesArray.push(transferredSiteModel);
          }
        });
        return this.$q.resolve();
      } else {
        this.showError(this.$translate.instant('firstTimeWizard.transferCodeInvalidError'));
        return this.$q.reject();
      }
    }).catch((response) => {
      if (response) {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.transferCodeError');
      }
      return this.$q.reject();
    });
  }

  private findTimezoneObject(timezoneId) {
    return _.find(this.timeZoneOptions, { timeZoneId: timezoneId });
  }

  private showError(msg) {
    this.error.isError = true;
    this.error.errorMsg = msg;
  }


  private stripTransferredSitesFromSitesArray() {
    this.sitesArray = _.filter(this.sitesArray, (site) => {
      return site.setupType !== this.Config.setupTypes.transfer;
    });
  }

  private clearError(): void {
    this.error.isError = false;
    this.error.errorMsg = '';
    delete this.error.errorType;
  }
}

export class WebexSiteTransferComponent implements ng.IComponentOptions {
  public controller = WebexSiteTransferCtrl;
  public template = require('./webex-site-transfer.html');
  public bindings = {
    onSitesReceived: '&',
    onValidationStatusChange: '&',
    currentSubscription: '<',
  };
}
