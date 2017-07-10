import { IPendingOrderSubscription, IPendingLicense } from './setup-wizard-service.interface';

export class SetupWizardService {
  public pendingMeetingLicenses: IPendingLicense[];
  public pendingLicenses: IPendingLicense[];
  private callbacks: Function[] = [];

  /* @ngInject */
  constructor(
    private $q,
    private $http,
    private Authinfo,
    private Config,
    private Notification,
    private SessionStorage,
    private UrlConfig,
  ) {
    this.init();
  }

  private init() {
    this.getPendingLicenses();
  }

  public addProvisioningCallbacks(func: Function) {
    this.callbacks.push(func);
  }

  public processCallbacks() {
    const promises = _.map(this.callbacks, (callback) => {
      return this.$q.resolve(callback());
    });

    return this.$q.all(_.uniq(promises));
  }

  private getActingSubscriptionId(): string {
    const subscriptionId = this.SessionStorage.get('subscriptionId');
    return subscriptionId || this.Authinfo.getSubscriptions()[0].externalSubscriptionId;
  }

  public getInternalSubscriptionId(): string {
    const actingSubscription = this.getActingSubscription();
    return _.get<string>(actingSubscription, 'subscriptionId');
  }

  public getActingSubscriptionServiceOrderUUID(): string {
    return _.get<string>(this.getActingSubscription(), 'pendingServiceOrderUUID');
  }

  private getActingSubscription(): IPendingOrderSubscription {
    return _.find(this.Authinfo.getSubscriptions(), { externalSubscriptionId: this.getActingSubscriptionId() });
  }

  private getPendingLicenses() {
    this.getPendingLicensesFromActiveSubscription(this.getActingSubscriptionId())
      .then(response => {
        this.populatePendingLicenses(response);
      })
      .catch(response => {
        this.Notification.errorWithTrackingId(response, 'firstTimeWizard.pendingLicensesError');
      });
  }

  private populatePendingLicenses(response): void {
    this.pendingLicenses = _.get<IPendingLicense[]>(response, 'data.licenseFeatures');
    this.pendingMeetingLicenses = _.filter(this.pendingLicenses, (license: IPendingLicense) => { return license.status === this.Config.licenseStatus.INITIALIZED && (license.offerName === this.Config.offerCodes.EE || license.offerName === this.Config.offerCodes.MC || license.offerName === this.Config.offerCodes.EC || license.offerName === this.Config.offerCodes.TC || license.offerName === this.Config.offerCodes.SC); });
  }

  private getPendingLicensesFromActiveSubscription(externalSubscriptionId) {
    if (!_.isString(externalSubscriptionId)) {
      return this.$q.reject('An invalid subscriptionId was passed.');
    }
    const pendingLicensesUrl = this.UrlConfig.getAdminServiceUrl() + 'subscriptions/pending?externalSubscriptionId=' + externalSubscriptionId;

    return this.$http.get(pendingLicensesUrl);
  }

}

export default angular
  .module('core.setup-wizard-service', [])
  .service('SetupWizardService', SetupWizardService)
  .name;
