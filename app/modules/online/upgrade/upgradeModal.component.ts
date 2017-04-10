import { OnlineUpgradeService } from './upgrade.service';
import { Notification } from 'modules/core/notifications';
import { IBmmpAttr, IProdInst } from 'modules/online/upgrade/upgrade.service';

class OnlineUpgrade {
  public subscriptionId: string;
  public cancelLoading: boolean = false;
  public showCancelButton: boolean = true;
  public bmmpAttr: IBmmpAttr;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Auth,
    private Authinfo,
    private Notification: Notification,
    private OnlineUpgradeService: OnlineUpgradeService,
  ) {}

  public $onInit(): void {
    this.OnlineUpgradeService.getProductInstance(this.Authinfo.getUserId(), this.OnlineUpgradeService.getSubscriptionId()).then((prodResponse: IProdInst) => {
      this.bmmpAttr = {
        subscriptionId: this.OnlineUpgradeService.getSubscriptionId(),
        productInstanceId: prodResponse.productInstanceId,
        changeplanOverride: '',
      };
    });
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

  public logout(): void {
    this.Auth.logout();
  }
}

export class OnlineUpgradeComponent implements ng.IComponentOptions {
  public controller = OnlineUpgrade;
  public templateUrl = 'modules/online/upgrade/upgradeModal.html';
}
