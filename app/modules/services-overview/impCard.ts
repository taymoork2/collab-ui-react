import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

export class ServicesOverviewImpCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'imp-service.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.hybridImp.buttons.resources',
    routerState: 'imp-service.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridImp.buttons.settings',
    routerState: 'imp-service.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  public atlasHybridImpFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = hasFeature;
  }

  /* @ngInject */
  public constructor(
    Authinfo,
    HybridServicesClusterStatesService: HybridServicesClusterStatesService,
  ) {
    super({
      active: false,
      cardClass: 'imp',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridImp.description',
      name: 'servicesOverview.cards.hybridImp.title',
      routerState: 'imp-service.list',
      service: 'spark-hybrid-impinterop',
    }, HybridServicesClusterStatesService);
    this.display = Authinfo.isFusionIMP();
  }
}
