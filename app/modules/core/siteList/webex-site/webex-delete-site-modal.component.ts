import './webex-site.scss';

import { IWebExSite, IConferenceLicense, IWebexLicencesPayload } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config } from 'modules/core/config/config';

class WebexDeleteSiteModalController implements ng.IComponentController {

  // parameters for child controls
  public sitesArray: IWebExSite[] = [];
  public conferenceLicensesInSubscription: IConferenceLicense[];
  public siteUrl: string;

  // parameters received
  public subscriptionId: string;
  public dismiss: Function;

  // used in own ui
  public isLoading = false;
  private isCanProceed = false;
  private webexSiteDetailsList = [];

  /* @ngInject */
  constructor(
    private Config: Config,
    private SetupWizardService: SetupWizardService,
  ) { }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.subscriptionId) {
      this.changeCurrentSubscription(changes.subscriptionId.currentValue);
    }
  }

  // wizard navigation logic
  public cancel(): void {
    this.dismiss();
  }

  public isNextDisabled(): boolean {
    return !this.isCanProceed;
  }

  public next(): void {
    this.saveData();
  }

  // callbacks from components
  private changeCurrentSubscription(subscriptionId) {
    this.subscriptionId = subscriptionId;
    this.conferenceLicensesInSubscription = this.SetupWizardService.getConferenceLicensesBySubscriptionId(subscriptionId);
    const licensesWithoutDeletedSite = _.reject(this.conferenceLicensesInSubscription, { siteUrl: this.siteUrl });
    this.sitesArray = this.transformExistingSites(licensesWithoutDeletedSite);
  }

  public updateSitesWithNewDistribution(sitesWithLicenseDetail, isValid) {
    if (isValid) {
      this.webexSiteDetailsList = sitesWithLicenseDetail;
      this.isCanProceed = true;
    } else {
      this.webexSiteDetailsList = [];
      this.isCanProceed = false;
    }
  }

  // data massaging
  private transformExistingSites(confServicesInActingSubscription): IWebExSite[] {
    return _.chain(confServicesInActingSubscription).map('siteUrl').uniq().map((siteUrl: string) => {
      return {
        siteUrl: _.replace(siteUrl, this.Config.siteDomainUrl.webexUrl, ''),
        quantity: 0,
        centerType: '',
      };
    }).value();
  }

  private saveData() {
    this.constructWebexLicensesPayload(this.webexSiteDetailsList);
  }

  private constructWebexLicensesPayload(webexSiteDetailsList): IWebexLicencesPayload {
    const webexLicensesPayload: IWebexLicencesPayload = {
      provisionOrder: true,
      sendCustomerEmail: false,
      serviceOrderUUID: this.SetupWizardService.getActingSubscriptionServiceOrderUUID(),
    };
    _.set(webexLicensesPayload, 'webexProvisioningParams', {
      webexSiteDetailsList: webexSiteDetailsList,
    });
    return webexLicensesPayload;
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

