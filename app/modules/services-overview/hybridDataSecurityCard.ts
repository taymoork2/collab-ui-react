import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HDSService } from 'modules/hds/services/hds.service';

export class ServicesOverviewHybridDataSecurityCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private hasITProPackPurchased: boolean;
  private hasITProPackEnabled: boolean;

  private learnMoreButton: ICardButton = {
    name: 'servicesOverview.genericButtons.learnMore',
    externalLink: 'http://www.cisco.com',
    buttonClass: 'btn btn--primary',
  };

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'hds.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridDataSecurity.buttons.resources',
    routerState: 'hds.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridDataSecurity.buttons.settings',
    routerState: 'hds.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.treatAsPurchased()) {
      return (this.active) ? this.buttons : [this.setupButton];
    } else {
      return [this.learnMoreButton];
    }
  }

  private checkRoles(): boolean {
    const hasRequiredRoles = _.includes(this.Authinfo.getRoles(), this.Config.roles.full_admin) ||
      _.includes(this.Authinfo.getRoles(), this.Config.roles.readonly_admin);
    return hasRequiredRoles;
  }

  public hybridDataSecurityFeatureToggleEventHandler(hasFeature: boolean): void {
    this.display = this.checkRoles() && (this.Authinfo.isFusionHDS() || hasFeature);
    this.setLoading();

  }

  public itProPackEventHandler(result): void {
    this.hasITProPackEnabled = result.hasITProPackEnabled;
    this.hasITProPackPurchased = result.hasITProPackPurchased;
    this.infoText = this.treatAsPurchased() ? '' : 'servicesOverview.cards.hybridDataSecurity.tooltip';
    this.setLoading();
  }

  private treatAsPurchased(): boolean {
    return this.hasITProPackPurchased || !this.hasITProPackEnabled;
  }

  /* @ngInject */
  public constructor(
    private $state,
    private Authinfo,
    private Config,
    private HDSService: HDSService,
    HybridServicesClusterStatesService: HybridServicesClusterStatesService,
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
      service: 'spark-hybrid-datasecurity',
      infoIcon: 'icon-certified',
      infoText: 'servicesOverview.cards.hybridDataSecurity.tooltip',
      initEventsNumber: 2,
    }, HybridServicesClusterStatesService);
    this.display = this.checkRoles() && this.Authinfo.isFusionHDS();
    this.hasITProPackPurchased = false;
    this.hasITProPackEnabled = false;
    this.$state = $state;
    this.Notification = Notification;
    this.HDSService = HDSService;
    this.setupButton.onClick = function () {
      let hdsEntitlementObj = {
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
