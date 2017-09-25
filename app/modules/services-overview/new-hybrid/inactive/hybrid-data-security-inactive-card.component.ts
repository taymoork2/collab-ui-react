import { Config } from 'modules/core/config/config';
import { Notification } from 'modules/core/notifications';
import { ProPackService } from 'modules/core/proPack/proPack.service';

export class HybridDataSecurityInactiveCardController implements ng.IComponentController {
  public treatAsPurchased = false;
  public loading = true;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Authinfo,
    private Config: Config,
    private HDSService,
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
        this.treatAsPurchased = result.hasProPackPurchased || !result.hasProPackEnabled;
        this.loading = false;
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
}

export class HybridDataSecurityInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridDataSecurityInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="servicesOverview.cards.hybridDataSecurity.title"></h4>
        <div class="inactive-card_logo"><cr-pro-pack-icon ng-if="!$ctrl.loading && !$ctrl.treatAsPurchased" tooltip="{{::'common.proPackTooltip' | translate}}" tooltip-append-to-body="true" tooltip-placement="right" tooltip-trigger="focus mouseenter" tabindex="0" aria-label="{{::$ctrl.infoText| translate}}"></cr-pro-pack-icon></div>
      </div>
      <div ng-if="$ctrl.loading">
        <i class="icon icon-spinner icon-2x"></i>
      </div>
      <div class="inactive-card_content" ng-if="!$ctrl.loading">
        <p translate="servicesOverview.cards.hybridDataSecurity.description"></p>
      </div>
      <div class="inactive-card_footer" ng-if="!$ctrl.loading">
        <p ng-if="$ctrl.treatAsPurchased"><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
        <p ng-if="!$ctrl.treatAsPurchased"><a class="btn btn--primary" href="http://www.cisco.com/go/hybrid-data-security" target="_blank" translate="servicesOverview.genericButtons.learnMore"></a></p>
      </div>
    </article>
  `;
}
