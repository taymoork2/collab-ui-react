import { Config } from 'modules/core/config/config';
import { IPendingOrderSubscription, IPendingLicense, IConferenceService, ICCASPLicense, IConferenceLicense, ITSPLicense } from './meeting-settings/meeting-settings.interface';
import { HuronCustomerService } from 'modules/huron/customer';
import { HuronCompassService } from 'modules/huron/compass';

interface IPendingSubscription {
  externalSubscriptionId: string;
  licenses: IPendingLicense[];
  orderId: string;
  pendingLicenses: IPendingLicense[];
  pendingServiceOrderUUID: string;
  subscriptionId: string;
}

interface IOption {
  label: string;
  value: string;
}

export class SetupWizardService {
  public provisioningCallbacks = {};
  public serviceDataHasBeenInitialized: boolean = false;

  private actingSubscription?: IPendingSubscription;
  private pendingSubscriptions: IPendingSubscription[] = [];
  private country = '';
  private endCustomer = '';
  private willNotProvision = false;
  private actingSubscriptionChangeFn: Function = _.noop;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config: Config,
    private SessionStorage,
    private StorageKeys,
    private UrlConfig,
    private Orgservice,
    private HuronCompassService: HuronCompassService,
    private HuronCustomerService: HuronCustomerService,
  ) { }

  public isProvisionedSubscription(subscriptionId): boolean {
    if (!_.isString(subscriptionId)) {
      return false;
    }
    const subscription = _.find(this.Authinfo.getSubscriptions(), { externalSubscriptionId: subscriptionId });

    return (_.get(subscription, 'status') === this.Config.subscriptionStatus.ACTIVE) && !_.has(subscription, 'pendingServiceOrderUUID');
  }

  public addProvisioningCallbacks(callObject: { [keys: string]: Function }) {
    _.assign(this.provisioningCallbacks, callObject);
  }

  public processCallbacks() {
    const calls: Function[] = _.values<Function>(this.provisioningCallbacks);
    const promises = _.map(calls, (callback) => {
      return this.$q.resolve(callback());
    });

    return this.$q.all(promises);
  }

  // A subscriptionId parameter is passed from outside of Atlas (Order Processing Client)
  // to induce a determinant Service Setup flow; acting on a specified pending subscription.
  // Once the flow is complete, the subscriptionID must be cleared to prevent interference with state flows.
  public clearDeterminantParametersFromSession() {
    this.SessionStorage.remove(this.StorageKeys.SUBSCRIPTION_ID);
  }

  public hasPendingSubscriptionOptions(): boolean {
    return this.pendingSubscriptions.length > 1;
  }

  public getPendingSubscriptionOptions(): IOption[] {
    return _.map(this.pendingSubscriptions, (subscription) => {
      return {
        label: `${this.$translate.instant('firstTimeWizard.orderNumber')}${subscription.orderId} - ${this.$translate.instant('firstTimeWizard.subscriptionID')}${subscription.externalSubscriptionId}`,
        value: subscription.externalSubscriptionId,
      };
    });
  }

  public getActingPendingSubscriptionOptionSelection(): IOption {
    const options = this.getPendingSubscriptionOptions();
    const matchingOption = _.find(options, {
      value: this.getActingSubscriptionId(),
    });
    return matchingOption || options[0] || undefined;
  }

  public setActingSubscriptionOption(subscriptionOption: IOption) {
    const subscription = _.find(this.pendingSubscriptions, {
      externalSubscriptionId: subscriptionOption.value,
    });
    if (subscription !== this.actingSubscription) {
      this.actingSubscription = subscription;
      this.actingSubscriptionChangeFn();
    }
  }

  public onActingSubscriptionChange(callback: Function = _.noop) {
    this.actingSubscriptionChangeFn = callback;
  }

  public getActingOrderId(): string | undefined {
    return _.get(this.actingSubscription, 'orderId');
  }

  public getActingSubscriptionId(): string | undefined {
    return _.get(this.actingSubscription, 'externalSubscriptionId');
  }

  public getInternalSubscriptionId(): string | undefined {
    return _.get<string>(this.actingSubscription, 'subscriptionId');
  }

  public getActingSubscriptionServiceOrderUUID(): string | undefined {
    return _.get<string>(this.actingSubscription, 'pendingServiceOrderUUID');
  }

  public getActingSubscriptionLicenses(): IPendingLicense[] {
    return _.get(this.actingSubscription, 'licenses', []);
  }

  public getActingSubscriptionPendingLicenses(): IPendingLicense[] {
    return _.get(this.actingSubscription, 'pendingLicenses', []);
  }

  public getPendingOrderStatusDetails(pendingServiceOrderUUID) {
    if (!_.isString(pendingServiceOrderUUID)) {
      return this.$q.reject('No valid pendingServiceOrderUUID passed');
    }

    const pendingServiceOrderUrl = `${this.UrlConfig.getAdminServiceUrl()}orders/${pendingServiceOrderUUID}`;

    return this.$http.get(pendingServiceOrderUrl).then((response) => {
      return _.get(response, 'data.productProvStatus');
    });
  }

  public getConferenceLicensesBySubscriptionId(subscriptionId) {
    const conferenceLicenses = _.map(this.Authinfo.getConferenceServices(), 'license');
    const actingSubscriptionLicenses = _.filter(conferenceLicenses, { billingServiceId: subscriptionId });
    const existingConferenceLicensesInActingSubscripton = _.filter(actingSubscriptionLicenses,
      (license: IConferenceLicense) => _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], license.offerName));
    return existingConferenceLicensesInActingSubscripton;
  }

  public getWillNotProvision(): boolean {
    return this.willNotProvision;
  }

  public setWillNotProvision(flag: boolean): void {
    this.willNotProvision = flag;
  }

  // the pendingServiceOrderUUID property indicates whether a subscription has pending licenses
  // This is the main flag to determine if a subscription is pending or has a pending order on it
  public hasPendingServiceOrder(): boolean {
    return this.getActingSubscriptionServiceOrderUUID() !== undefined;
  }

  public hasPendingLicenses(): boolean {
    return !_.isEmpty(this.getActingSubscriptionPendingLicenses());
  }

  public hasPendingWebExMeetingLicenses(): boolean {
    return _.some(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], license.offerName));
  }

  public getPendingMeetingLicenses(): IPendingLicense[] {
    return _.filter(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC, this.Config.offerCodes.CF, this.Config.offerCodes.CMR], license.offerName));
  }

  public hasPendingCallLicenses(): boolean {
    return _.some(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => _.includes([this.Config.licenseTypes.COMMUNICATION, this.Config.licenseTypes.SHARED_DEVICES], license.licenseType));
  }

  public getPendingCallLicenses(): IPendingLicense[] {
    return _.filter(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => _.includes([this.Config.licenseTypes.COMMUNICATION, this.Config.licenseTypes.SHARED_DEVICES], license.licenseType));
  }

  public getPendingAudioLicenses(): IPendingLicense[] {
    return _.filter(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => license.licenseType === this.Config.licenseTypes.AUDIO);
  }

  public getPendingMessageLicenses(): IPendingLicense[] {
    return _.filter(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => license.offerName === this.Config.offerCodes.MS);
  }

  public getPendingCareLicenses(): IPendingLicense[] {
    return _.filter(this.getActingSubscriptionPendingLicenses(), (license: IPendingLicense) => license.offerName === this.Config.offerCodes.CDC || license.offerName === this.Config.offerCodes.CVC);
  }

  public hasPendingTSPAudioPackage() {
    return _.some(this.getActingSubscriptionPendingLicenses(), { offerName: this.Config.offerCodes.TSP });
  }

  public hasPendingCCASPPackage() {
    return _.some(this.getActingSubscriptionPendingLicenses(), { offerName: this.Config.offerCodes.CCASP });
  }

  public getActiveTSPAudioPackage() {
    return <ITSPLicense>_.find(this.getActingSubscriptionLicenses(), { offerName: this.Config.offerCodes.TSP });
  }

  public getActiveCCASPPackage() {
    return <ICCASPLicense>_.find(this.getActingSubscriptionLicenses(), { offerName: this.Config.offerCodes.CCASP });
  }

  private getPendingAuthinfoSubscriptions() {
    return _.filter(this.Authinfo.getSubscriptions(), (subscription: IPendingOrderSubscription) => _.has(subscription, 'pendingServiceOrderUUID'));
  }

  public populatePendingSubscriptions(): ng.IPromise<IPendingSubscription[]> {
    const pendingSubscriptions = this.getPendingAuthinfoSubscriptions();

    const requestedSubscriptionId = this.SessionStorage.get(this.StorageKeys.SUBSCRIPTION_ID);
    if (requestedSubscriptionId) {
      _.remove(pendingSubscriptions, pendingSubscription => pendingSubscription.externalSubscriptionId !== requestedSubscriptionId);
    }
    const externalSubscriptionIds = _.map<IPendingOrderSubscription, string>(pendingSubscriptions, 'externalSubscriptionId');
    const pendingSubscriptionPromises = _.map(externalSubscriptionIds, externalSubscriptionId => this.getPendingLicensesFromExternalSubscription(externalSubscriptionId));
    return this.$q.all(pendingSubscriptionPromises).then(pendingSubscriptionResponses => {
      this.pendingSubscriptions = _.map(pendingSubscriptionResponses, (pendingSubscriptionResponse, index) => {
        const pendingSubscription = pendingSubscriptions[index];
        return _.assign(pendingSubscriptionResponse, {
          externalSubscriptionId: pendingSubscription.externalSubscriptionId,
          licenses: pendingSubscription.licenses,
          pendingServiceOrderUUID: pendingSubscription.pendingServiceOrderUUID!,
          subscriptionId: pendingSubscription.subscriptionId!,
        });
      });
      if (!_.isEmpty(this.pendingSubscriptions)) {
        this.actingSubscription = this.pendingSubscriptions[0];
      }
      this.serviceDataHasBeenInitialized = true;
      return this.pendingSubscriptions;
    });
  }

  private getPendingLicensesFromExternalSubscription(externalSubscriptionId) {
    if (!_.isString(externalSubscriptionId)) {
      return this.$q.reject('An invalid subscriptionId was passed.');
    }
    const pendingLicensesUrl = `${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=${externalSubscriptionId}`;

    return this.$http.get(pendingLicensesUrl).then(response => this.getPendingSubscriptionData(response));
  }

  private getPendingSubscriptionData(response) {
    return {
      orderId: this.formatWebOrderId(_.get<string>(response, 'data.webOrderId', '')),
      pendingLicenses: _.get<IPendingLicense[]>(response, 'data.licenseFeatures', []),
    };
  }

  public getOrderDetails() {
    return {
      orderId: this.getActingOrderId(),
      subscriptionId: this.getActingSubscriptionId(),
      endCustomer: this.getEndCustomerName(),
    };
  }

  private formatWebOrderId(webOrderId) {
    if (webOrderId.lastIndexOf('/') !== -1) {
      return webOrderId.slice(0, webOrderId.lastIndexOf('/'));
    }
    return webOrderId;
  }

  public isCustomerPresent() {
    const params = {
      basicInfo: true,
    };

    return this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId(), params).then((response) => {
      const org = _.get(response, 'data', null);
      this.country = _.get<string>(org, 'countryCode', 'US');
      this.endCustomer = _.get<string>(org, 'displayName');
      if (_.get(org, 'orgSettings.sparkCallBaseDomain')) {
        //check cmi in base domain for customer
        return this.findCustomerInDc(_.get(org, 'orgSettings.sparkCallBaseDomain'));
      } else {
        //check CI for country
        if (_.get(org, 'countryCode')) {
          if (_.get(org, 'countryCode') === 'GB') {
            //check CMI in EC DC
            return this.findCustomerInDc('sparkc-eu.com');
          } else {
            //check CMI in NA DC
            return this.findCustomerInDc(this.HuronCompassService.defaultDomain());
          }
        } else {
          //check CMI in NA DC
          return this.findCustomerInDc(this.HuronCompassService.defaultDomain());
        }
      }
    }).catch(() => {
      _.noop();
    });
  }

  public getCustomerCountry() {
    return this.country;
  }

  public getEndCustomerName() {
    return this.endCustomer;
  }

  public findCustomerInDc(baseDomain) {
    this.HuronCompassService.setCustomerBaseDomain(baseDomain);
    return this.HuronCustomerService.getCustomer()
      .then(() => true)
      .catch(() => false);
  }

  public activateAndCheckCapacity(countryCode?) {
    const url = `${this.UrlConfig.getAdminServiceUrl()}organizations/${this.Authinfo.getOrgId()}/setup/communication`;
    const param = this.getActingSubscriptionId();
    return this.$http.patch(url, {
      countryCode: countryCode ? countryCode : this.country,
      subscriptionId: param,
    });
  }

  public getTSPPartners() {
    const url = `${this.UrlConfig.getAdminServiceUrl()}partners/tsp`;
    return this.$http.get(url).then((response) => {
      return _.get(response, 'data.tspPartnerList', []);
    });
  }

  public hasWebexMeetingTrial() {
    const conferencingServices: IConferenceService[] = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });
    return _.some(conferencingServices, (service: IConferenceService) => _.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC, this.Config.offerCodes.CF, this.Config.offerCodes.CMR], service.license.offerName));
  }

  public validateTransferCode(payload) {
    const orderUuid = this.getActingSubscriptionServiceOrderUUID();
    const url = `${this.UrlConfig.getAdminServiceUrl()}orders/${orderUuid}/transferCode/verify`;
    return this.$http.post(url, payload);
  }

  public getCCASPPartners() {
    const url = `${this.UrlConfig.getAdminServiceUrl()}partners/ccasp`;
    return this.$http.get(url).then((response) => {
      return _.sortBy(_.get(response, 'data.ccaspPartnerList', []));
    });
  }

  public validateCCASPPartner(subscriptionId: string, partnerName: string): ng.IPromise<any> {
    const payload = {
      ccaspSubscriptionId: subscriptionId,
      ccaspPartnerName: partnerName,
    };

    const orderUuid = this.getActingSubscriptionServiceOrderUUID();
    enum validationResult  {
      SUCCESS = 'VALID',
      FAILURE = 'INVALID',
    }
    const config = {
      method: 'POST',
      url: `${this.UrlConfig.getAdminServiceUrl()}orders/${orderUuid}/ccasp/verify`,
      data: payload,
    };
    return this.$http(config).then((response) => {
      return {
        response: response,
        isValid: response.data === validationResult.SUCCESS && response.status === 200,
        payload: payload,
      };
    })
    .catch((response) => {
      return {
        response: response,
        isValid: false,
        payload: payload,
      };
    });
  }

}

export default angular
  .module('core.setup-wizard-service', [
    require('angular-translate'),
    require('modules/core/config/config').default,
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    require('modules/core/storage').default,
    require('modules/huron/customer').default,
    require('modules/huron/compass').default,
  ])
  .service('SetupWizardService', SetupWizardService)
  .name;
