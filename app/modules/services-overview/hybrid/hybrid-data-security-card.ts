import { ServicesOverviewHybridCard } from './services-overview-hybrid-card';
import { ICardButton, CardType } from '../shared/services-overview-card';
import { Config } from 'modules/core/config/config';

export class ServicesOverviewHybridDataSecurityCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private hasProPackPurchased: boolean;
  private hasProPackEnabled: boolean;
  public showProBadge: boolean;

  private learnMoreButton: ICardButton = {
    name: 'servicesOverview.genericButtons.learnMore',
    externalLink: 'http://www.cisco.com/go/hybrid-data-security',
    buttonClass: 'btn btn--primary',
  };

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'hds.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.hybridDataSecurity.buttons.resources',
    routerState: 'hds.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridDataSecurity.buttons.settings',
    routerState: 'hds.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      // Always display Resources + Settings if the service is active
      return this.buttons;
    } else if (this.treatAsPurchased()) {
      // Service not active and we consider that they have Pro Pack, setup button
      return [this.setupButton];
    } else {
      // Service not active and no Pro Pack, Learn More button
      this.showProBadge = true;
      return [this.learnMoreButton];
    }
  }

  private checkRoles(): boolean {
    const hasRequiredRoles = _.includes(this.Authinfo.getRoles(), this.Config.roles.full_admin) ||
      _.includes(this.Authinfo.getRoles(), this.Config.roles.readonly_admin);
    return hasRequiredRoles;
  }

  public proPackEventHandler(result): void {
    this.hasProPackEnabled = result.hasProPackEnabled;
    this.hasProPackPurchased = result.hasProPackPurchased;
    this.infoText = this.treatAsPurchased() ? '' : 'common.proPackTooltip';
  }

  private treatAsPurchased(): boolean {
    return this.hasProPackPurchased || !this.hasProPackEnabled;
  }

  /* @ngInject */
  public constructor(
    private $state,
    private Authinfo,
    private Config: Config,
    private HDSService,
    private Notification,
  ) {
    super({
      active: false,
      cardClass: 'media',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridDataSecurity.description',
      display : false,
      name: 'servicesOverview.cards.hybridDataSecurity.title',
      routerState: 'hds.list',
      serviceId: 'spark-hybrid-datasecurity',
      infoText: 'common.proPackTooltip',
    });
    this.display = this.checkRoles() && this.Authinfo.isFusionHDS() && this.Authinfo.isEnterpriseCustomer();
    this.hasProPackPurchased = false;
    this.hasProPackEnabled = false;
    this.showProBadge = false;
    this.$state = $state;
    this.Notification = Notification;
    this.HDSService = HDSService;
    this.setupButton.onClick = function () {
      const hdsEntitlementObj = {
        serviceId: 'sparkHybridDataSecurity',
        displayName: 'Hybrid Data Security',
        ciName: Config.entitlements.hds,
        isConfigurable: false,
        type: 'FREE_WITH_LICENSE',
      };
      HDSService.enableHdsEntitlement()
        .then(function () {
          if (!Authinfo.isEntitled(Config.entitlements.hds)) {
            Authinfo.addEntitlement(hdsEntitlementObj);
          }
          $state.go('hds.list');
        }).catch(function (error) {
          Notification.errorWithTrackingId(error, 'error setting HDS service entitlements');
        });
    };
  }
}
