import { ServicesOverviewHybridCard } from './services-overview-hybrid-card';
import { ICardButton, CardType } from '../shared/services-overview-card';

export class ServicesOverviewImpCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): undefined {
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
  ) {
    super({
      active: false,
      cardClass: 'imp',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridImp.description',
      name: 'servicesOverview.cards.hybridImp.title',
      routerState: 'imp-service.list',
      serviceId: 'spark-hybrid-impinterop',
    });
    this.display = Authinfo.isFusionIMP();
  }
}
