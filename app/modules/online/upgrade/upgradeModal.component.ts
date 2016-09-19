import { OnlineUpgradeService } from './upgrade.service';

class OnlineUpgrade {
  public subscriptionId: string;
  public cancelLoading: boolean = false;
  public showCancelButton: boolean = true;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Authinfo,
    private Notification,
    private OnlineUpgradeService: OnlineUpgradeService
  ) {
  }

  public $onInit(): void {
    this.subscriptionId = this.OnlineUpgradeService.getSubscriptionId();
    this.showCancelButton = !this.OnlineUpgradeService.hasCancelledSubscriptions();
  }

  public cancel(): void {
    this.cancelLoading = true;
    this.OnlineUpgradeService.cancelSubscriptions()
      .then(() => {
        this.Notification.success('onlineUpgradeModal.cancelSuccess');
        this.OnlineUpgradeService.dismissModal();
        this.$state.go('login', {
          reauthorize: true,
        }, {
          reload: true,
        });
      })
      .finally(() => {
        this.cancelLoading = false;
      });
  }
}

export class OnlineUpgradeComponent implements ng.IComponentOptions {
  public controller = OnlineUpgrade;
  public templateUrl = 'modules/online/upgrade/upgradeModal.html';
}
