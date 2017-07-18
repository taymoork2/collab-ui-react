import { IPendingOrderSubscription, IPendingLicense } from './meeting-settings/meeting-settings.interface';
import { Notification } from 'modules/core/notifications';
import { HuronCustomerService } from 'modules/huron/customer';
import { HuronCompassService } from 'modules/huron/compass';

export class SetupWizardService {
  public pendingMeetingLicenses: IPendingLicense[];
  public pendingLicenses: IPendingLicense[];
  public provisioningCallbacks = {};
  public country = '';

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

    return this.$q.all(_.uniq(promises));
  }

  private getActingSubscriptionId(): string {
    const subscriptionId = this.SessionStorage.get(this.StorageKeys.SUBSCRIPTION_ID);
    return subscriptionId || _.get(this.Authinfo.getSubscriptions()[0], 'externalSubscriptionId');
  }

  public getInternalSubscriptionId(): string {
    const actingSubscription = this.getActingSubscription();
    return _.get<string>(actingSubscription, 'subscriptionId');
  }

  public getActingSubscriptionServiceOrderUUID(): string {
    return _.get<string>(this.getActingSubscription(), 'pendingServiceOrderUUID', undefined);
  }

  public hasPendingServiceOrder() {
    return this.getActingSubscriptionServiceOrderUUID() !== undefined;
  }

  public hasPendingLicenses() {
    return !_.isEmpty(this.pendingLicenses);
  }

  public hasPendingMeetingLicenses() {
    return _.some(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], license.offerName)); });
  }

  public hasPendingCallLicenses() {
    return _.some(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.licenseTypes.COMMUNICATION, this.Config.licenseTypes.SHARED_DEVICES], license.licenseType)); });
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
    return this.pendingLicenses = _.get<IPendingLicense[]>(response, 'data.licenseFeatures', []);
  }

  private getPendingLicensesFromActiveSubscription(externalSubscriptionId) {
    if (!_.isString(externalSubscriptionId)) {
      return this.$q.reject('An invalid subscriptionId was passed.');
    }
    const pendingLicensesUrl = `${this.UrlConfig.getAdminServiceUrl()}subscriptions/pending?externalSubscriptionId=${externalSubscriptionId}`;

    return this.$http.get(pendingLicensesUrl);
  }

  public isCustomerPresent() {
    const params = {
      basicInfo: true,
    };
    const _this = this;
    return this.Orgservice.getOrg(_.noop, this.Authinfo.getOrgId(), params).then(function (response) {
      const org = _.get(response, 'data', null);
      _this.country = _.get(org, 'countryCode');
      if (_.get(org, 'orgSettings.sparkCallBaseDomain')) {
        //check cmi in base domain for customer
        return _this.findCustomerInDc(_.get(org, 'orgSettings.sparkCallBaseDomain'));
      } else {
        //check CI for country
        if (_.get(org, 'countryCode')) {
          if (_.get(org, 'countryCode') === 'GB') {
            //check CMI in EC DC
            return _this.findCustomerInDc('sparkc-eu.com');
          } else {
            //check CMI in NA DC
            return _this.findCustomerInDc(this.HuronCompassService.defaultDomain());
          }
        } else {
          //check CMI in NA DC
          return _this.findCustomerInDc(this.HuronCompassService.defaultDomain());
        }
      }
    }).catch(function () {
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
    const param = this.getActingSubscription();
    return this.$http.patch(url, {
      countryCode: countryCode ? countryCode : this.country,
      subscriptionId: param,
    });
  }

}

export default angular
  .module('core.setup-wizard-service', [
    require('modules/huron/customer').default,
  ])
  .service('SetupWizardService', SetupWizardService)
  .name;
