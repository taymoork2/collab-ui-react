import './webex-site.scss';

import { IWebExSite, IConferenceLicense } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { WebExSiteService, Actions } from './webex-site.service';
import { Notification } from 'modules/core/notifications';

class WebexDeleteSiteModalController implements ng.IComponentController {

  // parameters for child controls
  public sitesArray: IWebExSite[] = [];
  public conferenceLicensesInSubscription: IConferenceLicense[];
  public siteUrl: string;

  // parameters received
  public subscriptionId: string;
  public dismiss: Function;

  // used in own ui
  public isSuccess: boolean | undefined = undefined;
  public isLoading;
  private isCanProceed = false;
  private webexSiteDetailsList = [];

  /* @ngInject */
  constructor(
    private Analytics,
    private $rootScope: ng.IRootScopeService,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private WebExSiteService: WebExSiteService,
  ) { }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.subscriptionId) {
      this.changeCurrentSubscription(changes.subscriptionId.currentValue);
    }
  }

  public sendMetrics(event, properties?) {
    _.set(properties, 'subscriptionId', this.subscriptionId);
    this.Analytics.trackWebExMgmntSteps(event, properties);
  }

  // wizard navigation logic
  public cancel(): void {
    this.dismiss();
  }

  public isNextDisabled(): boolean {
    return !this.isCanProceed;
  }

  public next(): void {
    if (!this.isResult()) {
      this.saveData();
    } else {
      this.cancel();
      this.$rootScope.$broadcast('EventNames.SITE_LIST_MODIFIED');
    }
  }

  public isResult(): boolean {
    return this.isSuccess !== undefined;
  }

  private changeCurrentSubscription(subscriptionId) {
    this.subscriptionId = subscriptionId;
    this.conferenceLicensesInSubscription = this.SetupWizardService.getConferenceLicensesBySubscriptionId(subscriptionId);
    const licensesWithoutDeletedSite = _.reject(this.conferenceLicensesInSubscription, { siteUrl: this.siteUrl });
    this.sitesArray = this.WebExSiteService.transformExistingSites(licensesWithoutDeletedSite);
  }

  // callbacks from components
  public updateSitesWithNewDistribution(sitesWithLicenseDetail, isValid) {
    if (isValid) {
      this.webexSiteDetailsList = sitesWithLicenseDetail;
      this.isCanProceed = true;
    } else {
      this.webexSiteDetailsList = [];
      this.isCanProceed = false;
    }
  }

  private saveData() {
    this.isLoading = true;
    const audioData = this.WebExSiteService.getAudioPackageInfo(this.subscriptionId);
    const payload = this.WebExSiteService.constructWebexLicensesPayload(this.webexSiteDetailsList, this.subscriptionId, Actions.DELETE,
      audioData.audioPartnerName, audioData.ccaspSubscriptionId);
    this.SetupWizardService.updateSitesInActiveSubscription(payload)
      .then(() => {
        this.isSuccess = true;
        this.Notification.success('webexSiteManagement.deleteSiteSuccessToaster');
      })
      .catch((response) => {
        this.isSuccess = false;
        this.Notification.errorWithTrackingId(response, 'webexSiteManagement.deleteSiteFailureToaster');
      })
      .finally(() => {
        this.isLoading = false;
        this.isCanProceed = true;
      });
  }
}

export class WebexDeleteSiteModalComponent implements ng.IComponentOptions {
  public controller = WebexDeleteSiteModalController;
  public template = require('./webex-delete-site-modal.html');
  public bindings = {
    subscriptionId: '<',
    dismiss: '&',
    siteUrl: '<',
  };
}

