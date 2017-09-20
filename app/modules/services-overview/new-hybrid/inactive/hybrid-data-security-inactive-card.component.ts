import { Config } from 'modules/core/config/config';
import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';

class HybridDataSecurityInactiveCardController implements ng.IComponentController {
  private hasProPackPurchased: boolean = false;
  private hasProPackEnabled: boolean = false;
  public showProBadge: boolean = true;
  public infoText: string = '';

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config: Config,
    private HDSService,
    private ModalService,
    private Notification: Notification,
    private ProPackService: ProPackService,
  ) {}

  public $onInit() {
    const PropackPromises = {
      hasProPackEnabled: this.ProPackService.hasProPackEnabled(),
      hasProPackPurchased: this.ProPackService.hasProPackPurchased(),
    };
    this.$q.all(PropackPromises)
      .then(result => {
        this.proPackEventHandler(result);
      });
  }

  public openPrerequisites(): void {
    this.ModalService.open({
      hideDismiss: true,
      title: 'Not implemented yet',
      message: '🐻',
      close: this.$translate.instant('common.close'),
    });
  }

  public openSetUp(): void {
    const hdsEntitlementObj = {
      serviceId: 'sparkHybridDataSecurity',
      displayName: 'Hybrid Data Security',
      ciName: this.Config.entitlements.hds,
      isConfigurable: false,
      type: 'FREE_WITH_LICENSE',
    };
    this.HDSService.enableHdsEntitlement()
      .then(() => {
        if (!this.Authinfo.isEntitled(this.Config.entitlements.hds)) {
          this.Authinfo.addEntitlement(hdsEntitlementObj);
        }
        this.$state.go('hds.list');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'Error setting HDS service entitlements');
      });
  }

  public proPackEventHandler(result): void {
    this.hasProPackEnabled = result.hasProPackEnabled;
    this.hasProPackPurchased = result.hasProPackPurchased;
    this.infoText = this.treatAsPurchased() ? '' : 'common.proPackTooltip';
  }

  private treatAsPurchased(): boolean {
    return this.hasProPackPurchased || !this.hasProPackEnabled;
  }
}

export class HybridDataSecurityInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridDataSecurityInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="servicesOverview.cards.hybridDataSecurity.title"></h4>
        <div class="inactive-card_logo"><cr-pro-pack-icon ng-if="$ctrl.showProBadge" tooltip="{{::$ctrl.infoText| translate}}" tooltip-append-to-body="true" tooltip-placement="right" tooltip-trigger="focus mouseenter" tabindex="0" aria-label="{{::$ctrl.infoText| translate}}"></cr-pro-pack-icon></div>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridDataSecurity.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
