import { IBmmpAttr, IProdInst } from 'modules/online/upgrade/shared/upgrade.service';
import { Notification } from 'modules/core/notifications';
import { OrganizationDeleteService } from 'modules/core/organizations/organization-delete/organization-delete.service';

export class AccountExpiredModalController implements ng.IComponentController {
  public useFreeLoading: boolean = false;
  public useFreeDisabled: boolean = false;
  public showUseFreeButton: boolean = false;
  public bmmpDisabled: boolean = false;
  public bmmpAttr: IBmmpAttr;
  public deleteLoading: boolean = false;
  public deleteDisabled: boolean = false;
  public showDeleteButton: boolean = false;
  public orgName: string;
  public cardCount: number = 1;

  /* @ngInject */
  constructor(
    private Analytics,
    private Auth,
    private Authinfo,
    private Notification: Notification,
    private OnlineUpgradeService,
    private OrganizationDeleteService: OrganizationDeleteService,
  ) {}

  public dismiss: Function;

  public $onInit(): void {
    this.orgName = this.Authinfo.getOrgName();
    this.showUseFreeButton = !this.OnlineUpgradeService.hasCancelledSubscriptions() &&
                             !this.OnlineUpgradeService.hasOnlySparkSubscriptions() &&
                             !this.OnlineUpgradeService.hasFreemiumSubscription();
    this.OnlineUpgradeService.getProductInstances(this.Authinfo.getUserId()).then((productInstances: IProdInst[]) => {
      const productInstance = _.find(productInstances, (instance) => {
        return instance.subscriptionId === this.OnlineUpgradeService.getSubscriptionId();
      });
      this.bmmpAttr = {
        subscriptionId: productInstance.subscriptionId,
        productInstanceId: productInstance.productInstanceId,
        changeplanOverride: '',
      };
    });
    this.OrganizationDeleteService.canOnlineOrgBeDeleted()
      .then((result) => {
        this.showDeleteButton = result;
        if (this.showUseFreeButton) {
          this.cardCount++;
        }
        if (this.showDeleteButton) {
          this.cardCount++;
        }
      });
  }

  public close(): void {
    this.dismiss();
  }

  public delete(): void {
    this.OrganizationDeleteService.openOrgDeleteModal('organizationDeleteModal.title.accountExpired');
  }

  public logout(): void {
    this.Auth.logout();
  }

  public useFree(): void {
    this.bmmpDisabled = true;
    this.deleteDisabled = true;
    this.useFreeLoading = true;
    this.Analytics.trackEvent(this.Analytics.sections.ONLINE_ORDER.eventNames.FREEMIUM, {
      subscriptionId: this.bmmpAttr.subscriptionId,
    });
    this.OnlineUpgradeService.cancelSubscriptions()
      .then(() => {
        this.Notification.success('onlineUpgradeModal.cancelSuccess');
        this.OnlineUpgradeService.dismissModal();
        this.Auth.logout();
      })
      .finally(() => {
        this.useFreeLoading = false;
      });
  }
}

export class AccountExpiredModalComponent implements ng.IComponentOptions {
  public controller = AccountExpiredModalController;
  public template = require('./account-expired-modal.html');
  public bindings = {
    dismiss: '&',
  };
}
