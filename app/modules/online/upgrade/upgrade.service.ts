interface ISubscriptionResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {
  patch: ng.resource.IResourceMethod<any>;
}

interface IToolkitModalSettings extends ng.ui.bootstrap.IModalSettings {
  type: string;
}

interface IToolkitModalService extends ng.ui.bootstrap.IModalService {
  open(options: IToolkitModalSettings): ng.ui.bootstrap.IModalServiceInstance;
}

const CANCELLED = 'CANCELLED';
const CANCEL = 'CANCEL';

export class OnlineUpgradeService {
  private subscriptionResource: ISubscriptionResource;
  private upgradeModal: ng.ui.bootstrap.IModalServiceInstance;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private Authinfo,
    private Notification,
    private UrlConfig
  ) {
    let patchAction: ng.resource.IActionDescriptor = {
      method: 'PATCH',
    };
    this.subscriptionResource = <ISubscriptionResource>$resource(UrlConfig.getAdminServiceUrl() + 'commerce/online/subscriptions/:subscriptionId', {}, {
      patch: patchAction,
    });
  }

  public openUpgradeModal(): void {
    this.dismissModal();
    this.upgradeModal = this.$modal.open({
      template: '<online-upgrade-modal></online-upgrade-modal>',
      backdrop: 'static',
      keyboard: false,
      type: 'dialog',
    });
  }

  public dismissModal(): void {
    if (this.upgradeModal) {
      this.upgradeModal.dismiss();
    }
  }

  public cancelSubscriptions(): ng.IPromise<any> {
    let hasError = false;
    return this.$q.all(_.map(this.Authinfo.getSubscriptions(), (subscription) => {
      return this.cancelSubscription(_.get<string>(subscription, 'subscriptionId'))
        .catch((response) => {
          hasError = true;
          this.Notification.errorWithTrackingId(response, 'subscriptions.cancelError');
        });
    })).then(() => {
      if (hasError) {
        return this.$q.reject();
      }
    });
  }

  public getSubscriptionId(): string {
    return _.get<string>(this.Authinfo.getSubscriptions(), '[0].subscriptionId');
  }

  public shouldForceUpgrade(): boolean {
    return this.Authinfo.isOnline() && this.hasExpiredSubscriptions();
  }

  public hasCancelledSubscriptions(): boolean {
    let subscriptions = this.Authinfo.getSubscriptions();
    return !!subscriptions.length && _.every(subscriptions, subscription => this.isSubscriptionCancelled(subscription));
  }

  private cancelSubscription(id: string): ng.IHttpPromise<any> {
    return this.subscriptionResource.patch({
      subscriptionId: id,
    }, {
      action: CANCEL,
    }).$promise;
  }

  private hasExpiredSubscriptions(): boolean {
    let subscriptions = this.Authinfo.getSubscriptions();
    return !!subscriptions.length && _.every(subscriptions, subscription => this.isSubscriptionCancelledOrExpired(subscription));
  }

  private isSubscriptionCancelledOrExpired(subscription): boolean {
    return this.isSubscriptionCancelled(subscription) || this.isSubscriptionExpired(subscription);
  }

  private isSubscriptionCancelled(subscription): boolean {
    return _.get<string>(subscription, 'status') === CANCELLED;
  }

  private isSubscriptionExpired(subscription): boolean {
    const currentDate = new Date();
    const subscriptionEndDate = _.get<string>(subscription, 'endDate');
    const gracePeriod = _.get<number>(subscription, 'gracePeriod', 0);

    return !subscriptionEndDate
      || (currentDate > new Date(moment(subscriptionEndDate).add(gracePeriod, 'days').toString()));
  }
}
