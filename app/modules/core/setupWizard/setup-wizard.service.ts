import { IPendingOrderSubscription, IPendingLicense } from './meeting-settings/meeting-settings.interface';
import { Notification } from 'modules/core/notifications';

export class SetupWizardService {
  public pendingMeetingLicenses: IPendingLicense[];
  public pendingLicenses: IPendingLicense[];
  public provisioningCallbacks = {};

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
    return _.get<string>(this.getActingSubscription(), 'pendingServiceOrderUUID');
  }

  public hasPendingLicenses() {
    return !_.isEmpty(this.pendingLicenses);
  }

  public hasPendingMeetingLicenses() {
    return _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.offerCodes.EE, this.Config.offerCodes.MC, this.Config.offerCodes.EC, this.Config.offerCodes.TC, this.Config.offerCodes.SC], license.offerName)); });
  }

  public hasPendingCallLicenses() {
    return _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (_.includes([this.Config.licenseTypes.COMMUNICATION, this.Config.licenseTypes.SHARED_DEVICES], license.licenseType)); });
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

}

export default angular
  .module('core.setup-wizard-service', [])
  .service('SetupWizardService', SetupWizardService)
  .name;
