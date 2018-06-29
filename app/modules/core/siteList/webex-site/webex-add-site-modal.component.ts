import './webex-site.scss';

import { IWebExSite, IConferenceLicense, ICenterDetails } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { WebExSiteService, Actions } from './webex-site.service';
import { Notification } from 'modules/core/notifications';
import { EventNames } from './webex-site.constants';

export interface IStep {
  name: string;
  event?: EventNames;
}

class WebexAddSiteModalController implements ng.IComponentController {

  // parameters for child controls
  public sitesArray: IWebExSite[] = [];
  public existingWebexSites: IWebExSite[];
  public conferenceLicensesInSubscription: IConferenceLicense[];
  public audioPackage: string | null;
  public audioPartnerName?: string;
  public subscriptionList: {
    id: string;
    isPending: boolean;
  }[] = [];
  public currentCenterDetails: ICenterDetails[];

  // parameters received
  public singleStep?: number;
  public modalTitle: string;
  public dismiss: Function;
  public centerDetails;
  public centerDetailsForAllSubscriptions;

  // used in own ui
  public currentSubscriptionId?: string;
  public isLoading = false;
  public steps: IStep[];
  public currentStep = 0;
  public firstStep = 0;
  public isSuccess: boolean | undefined = undefined;

  private totalSteps = 4;
  private isCanProceed = true;
  private webexSiteDetailsList = [];
  private ccaspSubscriptionId?: string;
  private transferCode?: string;

  /* @ngInject */
  constructor(
    private Analytics,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private $rootScope: ng.IRootScopeService,
    private WebExSiteService: WebExSiteService,
  ) {

    this.steps = [{
      name: 'SELECT_SUBSCRIPTION',
    }, {
      name: 'TRANSFER_SITE',
      event: EventNames.VALIDATE_TRANSFER_SITE,
    }, {
      name: 'ADD_SITES',
      event: EventNames.ADD_SITES,
    }, {
      name: 'DISTRIBUTE_LICENSES',
    }];
  }

  public $onInit(): void {
    this.subscriptionList = this.SetupWizardService.getEnterpriseSubscriptionListWithStatus();
    const hasActionableSubscriptions = !_.isEmpty(this.subscriptionList) && !_.first(this.subscriptionList).isPending;
    if (hasActionableSubscriptions) {
      // if there are any non-pending subs the first will be non-pending
      if (!this.currentSubscriptionId) {
        const firstSubscription = _.first(this.subscriptionList);
        this.changeCurrentSubscription(firstSubscription.id);
      }
      if (this.subscriptionList.length === 1 && _.isNil(this.singleStep)) {
        this.firstStep = 1;
        this.currentCenterDetails = this.centerDetails || this.getCenterDetails(this.subscriptionList[0].id);
        this.next();
      }
    } else {
      this.currentSubscriptionId = _.get(this.subscriptionList, '[0].id', '');
      this.currentCenterDetails = this.centerDetails || this.getCenterDetails(this.currentSubscriptionId);
      this.isCanProceed = false;
      this.totalSteps = 1;
      this.singleStep = 1;
    }
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.singleStep) {
      if (!_.isNil(changes.singleStep.currentValue)) {
        this.singleStep = this.currentStep = changes.singleStep.currentValue;
        this.totalSteps = 1;
      }
    }
    if (changes.subscriptionId && changes.subscriptionId.currentValue) {
      this.changeCurrentSubscription(changes.subscriptionId.currentValue);
    }
  }

  public sendMetrics(event, properties?) {
    _.set(properties, 'subscriptionId', this.currentSubscriptionId);
    this.Analytics.trackWebExMgmntSteps(event, properties);
  }

  // wizard navigation logic
  public cancel(): void {
    this.dismiss();
  }

  public isNextDisabled(): boolean {
    if (this.isResult()) {
      return false;
    }
    switch (this.currentStep) {
      case 0:
        return _.isEmpty(this.currentSubscriptionId) || !this.isCanProceed;
      case 1:
      case 2:
      case 3:
        return !this.isCanProceed;
      default:
        return true;
    }
  }

  public hasNext(): boolean {
    return this.currentStep < (this.totalSteps - 1);
  }

  public getPrimaryButtonText() {
    if (this.isResult()) {
      return 'common.close';
    } else {
      return  this.hasNext()  ? 'common.next' : 'common.save';
    }
  }
  //if there is not an event associated with a step: - proceed. Otherwise - emit event and set loading
  public next(): void {
    if (this.hasNext()) {
      const event = this.steps[this.currentStep].event;
      if (event) {
        this.isLoading = true;
        this.$rootScope.$broadcast(event);
      } else {
        this.advanceStep();
      }
    } else if (this.isResult()) {
      this.cancel();
      this.$rootScope.$broadcast(EventNames.SITE_LIST_MODIFIED);
    } else {
      this.saveData();
    }
  }

  public setNextEnabled(isCanProceed) {
    this.isCanProceed = isCanProceed;
  }

  private getCenterDetails(externalSubId: string = ''): ICenterDetails[] {
    const singleSub: any = _.find(this.centerDetailsForAllSubscriptions, { externalSubscriptionId: externalSubId });
    return singleSub ? singleSub.purchasedServices : [];
  }

  private advanceStep(canProceed?: boolean) {
    this.currentStep = this.currentStep + 1;
    // you can just breeze through transfer sites. Next is enabled
    if (this.steps[this.currentStep].name !== 'TRANSFER_SITE') {
      this.isCanProceed = canProceed || false;
    }
  }

  public getCurrentStep(): number {
    return this.currentStep - this.firstStep + 1;
  }

  public getTotalSteps(): number {
    return this.totalSteps - this.firstStep;
  }

  public isResult(): boolean {
    return this.isSuccess !== undefined;
  }

  // callbacks from components
  public changeCurrentSubscription(subscriptionId, needsSetup?: boolean) {
    if (needsSetup) {
      this.$rootScope.$broadcast(EventNames.LAUNCH_MEETING_SETUP);
      this.dismiss();
    } else {
      this.currentSubscriptionId = subscriptionId;
      this.conferenceLicensesInSubscription = this.SetupWizardService.getConferenceLicensesBySubscriptionId(subscriptionId);
      this.setAudioPackageInfo(subscriptionId);
      this.existingWebexSites = this.WebExSiteService.getExistingSites(this.conferenceLicensesInSubscription);
      this.sitesArray = this.WebExSiteService.transformExistingSites(this.conferenceLicensesInSubscription);
      this.currentCenterDetails = this.centerDetails || this.getCenterDetails(subscriptionId);
    }
  }

  public addTransferredSites(sites, transferCode, isValid) {
    this.isLoading = false;
    if (isValid) {
      this.sitesArray = _.concat(this.sitesArray, sites);
      this.transferCode = transferCode;
      // if transferring a site - we dont have to add new one
      this.advanceStep(!_.isEmpty(transferCode));
    }
  }

  public addNewSites(sites, isValid) {
    this.sitesArray = _.concat(this.sitesArray, sites);
    this.isLoading = false;
    if (isValid) {
      this.advanceStep();
    }
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

  public isLicenseRedistribution() {
    return this.singleStep === 3;
  }

  private setAudioPackageInfo(subscripionId): void {
    const audioPackage = this.WebExSiteService.getAudioPackageInfo(subscripionId);
    this.audioPackage = audioPackage.audioPackage;
    if (this.audioPackage) {
      this.audioPartnerName = audioPackage.audioPartnerName;
      this.ccaspSubscriptionId = audioPackage.ccaspSubscriptionId;
    }
  }

  private saveData() {
    const action = this.isLicenseRedistribution() ? Actions.UPDATE : Actions.ADD;
    const toasterPrefix = this.isLicenseRedistribution() ? 'redistribute' : 'addSite';
    this.isLoading = true;
    const payload = this.WebExSiteService.constructWebexLicensesPayload(this.webexSiteDetailsList, this.currentSubscriptionId || '',
      action, this.audioPartnerName, this.ccaspSubscriptionId, this.transferCode);
    this.SetupWizardService.updateSitesInActiveSubscription(payload)
      .then(() => {
        this.Notification.success('webexSiteManagement.' + toasterPrefix + 'SuccessToaster');
        this.isSuccess = true;
      })
      .catch((response) => {
        this.isSuccess = false;
        this.Notification.errorWithTrackingId(response, 'webexSiteManagement.' + toasterPrefix + 'FailureToaster');
      })
      .finally(() => {
        this.isLoading = false;
        this.currentStep = this.currentStep + 1;
      });
  }
}

export class WebexAddSiteModalComponent implements ng.IComponentOptions {
  public controller = WebexAddSiteModalController;
  public template = require('./webex-add-site-modal.html');
  public bindings = {
    modalTitle: '<',
    dismiss: '&',
    singleStep: '<',
    subscriptionId: '<',
    centerDetails: '<?',
    centerDetailsForAllSubscriptions: '<?',
  };
}
