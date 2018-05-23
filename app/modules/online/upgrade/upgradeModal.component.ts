import { IBmmpAttr, IProdInst } from 'modules/online/upgrade/shared/upgrade.service';
import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';
import { OrganizationDeleteService } from 'modules/core/organizations/organization-delete/organization-delete.service';

class OnlineUpgrade {
  public showBmmpButton: boolean = false;
  public showMoreOptionsButton: boolean = false;
  public bodyText: string = '';
  public titleText: string = '';
  public bmmpAttr: IBmmpAttr;
  private accountExpiredModal: IToolkitModalServiceInstance;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private Auth,
    private Authinfo,
    private OnlineUpgradeService,
    private OrganizationDeleteService: OrganizationDeleteService,
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
      this.showBmmpButton = true;
      // allow customer to downgrade to Freemium
      this.showMoreOptionsButton = !this.OnlineUpgradeService.hasCancelledSubscriptions() &&
                                   !this.OnlineUpgradeService.hasOnlySparkSubscriptions() &&
                                   !this.OnlineUpgradeService.hasFreemiumSubscription();
    }
    if (!this.showMoreOptionsButton) {
      this.OrganizationDeleteService.canOnlineOrgBeDeleted()
      .then((result) => {
        this.showMoreOptionsButton = result;
      });
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

  public openAccountExpiredModal(): void {
    this.dismissAccountExpiredModal();
    this.accountExpiredModal = this.$modal.open({
      template: '<account-expired-modal dismiss="$dismiss()"></account-expired-modal>',
      backdrop: 'static',
      keyboard: false,
    });
  }

  public dismissAccountExpiredModal(): void {
    if (this.accountExpiredModal) {
      this.accountExpiredModal.dismiss();
    }
  }

  public logout(): void {
    this.Auth.logout();
  }
}

export class OnlineUpgradeComponent implements ng.IComponentOptions {
  public controller = OnlineUpgrade;
  public template = require('modules/online/upgrade/upgradeModal.html');
}
