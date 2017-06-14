import { OnlineUpgradeService } from './upgrade.service';
import { Notification } from 'modules/core/notifications';
import { IBmmpAttr, IProdInst } from 'modules/online/upgrade/upgrade.service';

class OnlineUpgrade {
  public subscriptionId: string;
  public cancelLoading: boolean = false;
  public showCancelButton: boolean = true;
  public nameChangeEnabled: boolean;
  public bmmpAttr: IBmmpAttr;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Auth,
    private Authinfo,
    private Notification: Notification,
    private OnlineUpgradeService: OnlineUpgradeService,
    private FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.atlas2017NameChangeGetStatus().then((toggle: boolean): void => {
      this.nameChangeEnabled = toggle;
    });

    this.OnlineUpgradeService.getProductInstances(this.Authinfo.getUserId()).then((productInstances: Array<IProdInst>) => {
      const productInstance = _.find(productInstances, (instance: any) => {
        return instance.subscriptionId === this.OnlineUpgradeService.getSubscriptionId();
      });

      this.bmmpAttr = {
        subscriptionId: productInstance.subscriptionId,
        productInstanceId: productInstance.productInstanceId,
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
