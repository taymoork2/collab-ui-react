import './webex-site.scss';

import { IWebExSite, IConferenceLicense, IWebexProvisioningParams } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Config } from 'modules/core/config/config';
import { Notification } from 'modules/core/notifications';
import { EventNames } from './webex-site.constants';

export interface IStep {
  name: string;
  event?: EventNames;
}

export interface IWebexLicencesPayload {
  externalSubscriptionId?: string;
  webexProvisioningParams?: IWebexProvisioningParams;
}

class WebexAddSiteModalController implements ng.IComponentController {

  // parameters for child controls
  public sitesArray: IWebExSite[] = [];
  public conferenceLicensesInSubscription: IConferenceLicense[];
  public audioPackage?: string;
  public audioPartnerName = null;
  public subscriptionList: string[] = [];

  // parameters received
  public singleStep?: number;
  public modalTitle: string;
  public dismiss: Function;

  // used in own ui
  public currentSubscriptionId?: string;
  public isLoading = false;
  public steps: IStep[];
  public currentStep = 0;
  public firstStep = 0;
  private totalSteps = 4;
  private isCanProceed = true;
  private webexSiteDetailsList = [];

  private ccaspSubscriptionId?: string;
  private transferCode?: string;

  /* @ngInject */
  constructor(
    private Authinfo,
    private Config: Config,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
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
    this.subscriptionList = <string[]>_.chain(this.SetupWizardService.getNonTrialWebexLicenses()).map('billingServiceId').uniq().value();
    this.changeCurrentSubscription(_.first(this.subscriptionList));
    if (this.subscriptionList.length === 1 && _.isNil(this.singleStep)) {
      this.firstStep = 1;
      this.next();
    }
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.singleStep) {
      if (!_.isNil(changes.singleStep.currentValue)) {
        this.singleStep = this.currentStep = changes.singleStep.currentValue;
        this.totalSteps = 1;
      }
    }
    if (changes.subscriptionId) {
      this.changeCurrentSubscription(changes.subscriptionId.currentValue);
    }
  }

  // wizard navigation logic
  public cancel(): void {
    this.dismiss();
  }

  public isNextDisabled(): boolean {
    switch (this.currentStep) {
      case 0:
        return _.isEmpty(this.currentSubscriptionId);
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
    } else {
      this.saveData();
    }
  }

  public setNextEnabled(isCanProceed) {
    this.isCanProceed = isCanProceed;
  }

  private advanceStep() {
    this.currentStep = this.currentStep + 1;
    // you can just breeze through transfer sites. Next is enabled
    if (this.steps[this.currentStep].name !== 'TRANSFER_SITE') {
      this.isCanProceed = false;
    }
  }

  public getCurrentStep(): number {
    return this.currentStep - this.firstStep + 1;
  }

  public getTotalSteps(): number {
    return this.totalSteps - this.firstStep;
  }

  // callbacks from components
  public changeCurrentSubscription(subscriptionId) {
    this.currentSubscriptionId = subscriptionId;
    this.conferenceLicensesInSubscription = this.SetupWizardService.getConferenceLicensesBySubscriptionId(subscriptionId);
    this.setAudioPackageInfo(subscriptionId);
    this.sitesArray = this.transformExistingSites(this.conferenceLicensesInSubscription);
  }

  public addTransferredSites(sites, transferCode, isValid) {
    this.isLoading = false;
    if (isValid) {
      this.sitesArray = _.concat(this.sitesArray, sites);
      this.transferCode = transferCode;
      this.advanceStep();
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

  // data massaging

  private setAudioPackageInfo(subscripionId): void {
    const audioLicenses = _.filter(this.Authinfo.getLicenses(), { licenseType: this.Config.licenseTypes.AUDIO });
    const license = <IConferenceLicense>_.find(audioLicenses, { billingServiceId: subscripionId });
    if (_.isEmpty(license)) {
      return;
    }
    this.audioPackage = license.offerName;
    if (this.audioPackage === this.Config.offerCodes.CCASP) {
      this.audioPartnerName = _.get(license, 'ccaspPartnerName');
      this.ccaspSubscriptionId = _.get(license, 'ccaspSubscriptionId');
    } else if (this.audioPackage === this.Config.offerCodes.TSP) {
      this.audioPartnerName = _.get(license, 'tspPartnerName');
      this.ccaspSubscriptionId = _.get(license, 'ccaspSubscriptionId');
    }
  }

  private transformExistingSites(confServicesInActingSubscription): IWebExSite[] {
    return _.chain(confServicesInActingSubscription).map('siteUrl').uniq().map(siteUrl => {
      return {
        siteUrl: _.replace(siteUrl.toString(), this.Config.siteDomainUrl.webexUrl, ''),
        quantity: 0,
        centerType: '',
      };
    }).value();
  }

  private saveData() {
    const payload = this.constructWebexLicensesPayload(this.webexSiteDetailsList);
    this.SetupWizardService.addSiteToActiveSubscription(payload).then(() => {
      // TODO algendel: 10/30/17 - get real copy.
      this.Notification.success(this.$translate.instant('webexSiteManagement.addSiteSuccess'));
    });
  }

  private constructWebexLicensesPayload(webexSiteDetailsList): IWebexLicencesPayload {
    const webexLicensesPayload: IWebexLicencesPayload = {
      externalSubscriptionId: this.currentSubscriptionId,
    };
    _.set(webexLicensesPayload, 'webexProvisioningParams', {
      webexSiteDetailsList: webexSiteDetailsList,
      audioPartnerName: this.audioPartnerName,
      transferCode: this.transferCode,
      ccaspSubscriptionId: this.ccaspSubscriptionId,
      asIs: false,
      siteManagementAction: 'ADD',
    });
    return webexLicensesPayload;
  }
}

export class WebexAddSiteModalComponent implements ng.IComponentOptions {
  public controller = WebexAddSiteModalController;
  public template = require('./webex-add-site-modal.html');
  public bindings = {
    modalTitle: '<',
    dismiss: '&',
    singleStep: '<',
  };
}

