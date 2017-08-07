import { IPendingOrderSubscription, IPendingLicense } from './meeting-settings/meeting-settings.interface';
import { Notification } from 'modules/core/notifications';
import { HuronCustomerService } from 'modules/huron/customer';
import { HuronCompassService } from 'modules/huron/compass';

export class SetupWizardService {
  public pendingLicenses: IPendingLicense[];
  public provisioningCallbacks = {};
  public country = '';
  public currentOrderNumber = '';
  public willNotProvision: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $http: ng.IHttpService,
    private Authinfo,
    private Config,
    private Notification: Notification,
    private SessionStorage,
    private StorageKeys,
    private UrlConfig,
    private Orgservice,
    private HuronCompassService: HuronCompassService,
    private HuronCustomerService: HuronCustomerService,
  ) { }

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

  public getActingSubscriptionId(): string {
    const subscriptionId = this.SessionStorage.get(this.StorageKeys.SUBSCRIPTION_ID);
    return subscriptionId || _.get(this.Authinfo.getSubscriptions()[0], 'externalSubscriptionId', '');
  }

  public getInternalSubscriptionId(): string {
    const actingSubscription = this.getActingSubscription();
    return _.get<string>(actingSubscription, 'subscriptionId');
  }

  public getActingSubscriptionServiceOrderUUID(): string {
    return _.get<string>(this.getActingSubscription(), 'pendingServiceOrderUUID', undefined);
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

  public getWillNotProvision(): boolean {
    return this.willNotProvision;
  }

  public setWillNotProvision(flag: boolean): void {
    this.willNotProvision = flag;
  }

  public hasPendingServiceOrder(): boolean {
    return this.getActingSubscriptionServiceOrderUUID() !== undefined;
  }

  public hasPendingLicenses(): boolean {
    return !_.isEmpty(this.pendingLicenses);
  }

  public hasPendingWebExMeetingLicenses(): boolean {
    return _.some(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], license.offerName)); });
  }

  public getPendingMeetingLicenses(): IPendingLicense[] {
    return _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC, this.Config.offerCodes.CF, this.Config.offerCodes.CMR], license.offerName)); });
  }

  public hasPendingCallLicenses(): boolean {
    return _.some(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.licenseTypes.COMMUNICATION, this.Config.licenseTypes.SHARED_DEVICES], license.licenseType)); });
  }

  public getPendingCallLicenses(): IPendingLicense[] {
    return _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.licenseTypes.COMMUNICATION, this.Config.licenseTypes.SHARED_DEVICES], license.licenseType)); });
  }

  public getPendingAudioLicenses(): IPendingLicense[] {
    return _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && license.licenseType === this.Config.licenseTypes.AUDIO; });
  }

  public getPendingMessageLicenses(): IPendingLicense[] {
    return _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && license.offerName === this.Config.offerCodes.MS; });
  }

  public getCurrentOrderNumber() {
    return this.currentOrderNumber;
  }

  public hasTSPAudioPackage() {
    return _.some(this.pendingLicenses, { offerName: this.Config.offerCodes.TSP });
  }

  private getActingSubscription(): IPendingOrderSubscription {
    return _.find(this.Authinfo.getSubscriptions(), { externalSubscriptionId: this.getActingSubscriptionId() });
  }

  public getPendingLicenses(): ng.IPromise<IPendingLicense[]> {
    return this.getPendingLicensesFromActiveSubscription(this.getActingSubscriptionId())
      .then(response => {
        return this.populatePendingLicenses(response);
      })
      .catch(response => {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.pendingLicensesError');
        return this.$q.reject(response);
      });
  }

  private populatePendingLicenses(response) {
    this.currentOrderNumber = _.get<string>(response, 'data.webOrderId', '');
    return this.pendingLicenses = _.get<IPendingLicense[]>(response, 'data.licenseFeatures', []);
  }

  private getPendingLicensesFromActiveSubscription(externalSubscriptionId) {
    if (!_.isString(externalSubscriptionId)) {
      return this.$q.reject('An invalid subscriptionId was passed.');
    }
    const pendingLicensesUrl = `${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=${externalSubscriptionId}`;

    return this.$http.get(pendingLicensesUrl);
  }

  public getOrderAndSubId() {
    return {
      orderId: this.formatWebOrderId(),
      subscriptionId: this.getActingSubscriptionId(),
    };
  }

  private formatWebOrderId() {
    if (this.currentOrderNumber.lastIndexOf('/') !== -1) {
      return this.currentOrderNumber.slice(0, this.currentOrderNumber.lastIndexOf('/'));
    }
    return this.currentOrderNumber;
  }

  public isCustomerPresent() {
    const params = {
      basicInfo: true,
    };

    return this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId(), params).then( (response) => {
      const org = _.get(response, 'data', null);
      this.country = _.get<string>(org, 'countryCode');
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
    }).catch( () => {
      _.noop();
    });
  }

  public getCustomerCountry() {
    return this.country;
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
    const conferencingServices = _.filter(this.Authinfo.getConferenceServices(), { license: { isTrial: true } });

    return _.some(conferencingServices, function (service) {
      return _.get(service, 'license.offerName') === this.Config.offerCodes.MC || _.get(service, 'license.offerName') === this.Config.offerCodes.EE;
    });
  }

  public validateTransferCode(payload) {
    const orderUuid = this.getActingSubscriptionServiceOrderUUID();
    const url = `${this.UrlConfig.getAdminServiceUrl()}orders/${orderUuid}/transferCode/verify`;
    return this.$http.post(url, payload);
  }
}

export default angular
  .module('core.setup-wizard-service', [
    require('modules/huron/customer').default,
    require('modules/core/notifications').default,
    require('modules/huron/compass').default,
  ])
  .service('SetupWizardService', SetupWizardService)
  .name;
