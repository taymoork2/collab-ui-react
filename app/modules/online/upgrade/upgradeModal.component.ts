import { OnlineUpgradeService } from './upgrade.service';
import { Notification } from 'modules/core/notifications';
import { IBmmpAttr, IProdInst } from 'modules/online/upgrade/upgrade.service';

class OnlineUpgrade {
  public subscriptionId: string;
  public cancelLoading: boolean = false;
  public showCancelButton: boolean = false;
  public showBmmpButton: boolean = false;
  public bodyText: string = '';
  public cancelBodyText: string = '';
  public titleText: string = '';
  public bmmpAttr: IBmmpAttr;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private Auth,
    private Authinfo,
    private Notification: Notification,
    private OnlineUpgradeService: OnlineUpgradeService,
  ) {}

  public $onInit(): void {
    if (this.OnlineUpgradeService.isPending()) {
      this.bodyText = this.$translate.instant('onlineUpgradeModal.pendingBody');
      this.titleText = this.$translate.instant('onlineUpgradeModal.pendingTitle');
    } else if (this.OnlineUpgradeService.isFreemium()) {
      this.titleText = this.$translate.instant('onlineUpgradeModal.freemiumTitle');
      this.bodyText = this.$translate.instant('onlineUpgradeModal.freemiumBody');
      this.showBmmpButton = true;
    } else {
      this.titleText = this.$translate.instant('onlineUpgradeModal.expiredTitle');
      this.bodyText = this.$translate.instant('onlineUpgradeModal.body');
      this.cancelBodyText = this.$translate.instant('onlineUpgradeModal.cancelBody');
      this.showBmmpButton = true;
      this.showCancelButton = !this.OnlineUpgradeService.hasCancelledSubscriptions() &&
                              !this.OnlineUpgradeService.hasOnlySparkSubscriptions();
    }
    if (this.showBmmpButton) {
      this.OnlineUpgradeService.getProductInstances(this.Authinfo.getUserId()).then((productInstances: IProdInst[]) => {
        const productInstance = _.find(productInstances, (instance: any) => {
          return instance.subscriptionId === this.OnlineUpgradeService.getSubscriptionId();
        });
        this.bmmpAttr = {
          subscriptionId: productInstance.subscriptionId,
          productInstanceId: productInstance.productInstanceId,
          changeplanOverride: '',
        };
      });
    }
  }

  public cancel(): void {
    this.cancelLoading = true;
    this.Analytics.trackEvent(this.Analytics.sections.ONLINE_ORDER.eventNames.FREEMIUM, {
      subscriptionId: this.bmmpAttr.subscriptionId,
    });
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
  public template = require('modules/online/upgrade/upgradeModal.html');
}
