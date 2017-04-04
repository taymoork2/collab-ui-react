import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

export class ServicesOverviewHybridDataSecurityCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

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
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  private checkRoles() {
    const hasRequiredRoles = _.includes(this.Authinfo.getRoles(), this.Config.roles.full_admin) ||
      _.includes(this.Authinfo.getRoles(), this.Config.roles.readonly_admin);
    this.display = hasRequiredRoles && this.Authinfo.isFusionHDS();
  }

  /* @ngInject */
  public constructor(
    private Authinfo,
    private Config,
    HybridServicesClusterStatesService: HybridServicesClusterStatesService,
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
    }, HybridServicesClusterStatesService);
    this.checkRoles();
  }
}
