import { ServicesOverviewHybridCard } from './services-overview-hybrid-card';
import { ICardButton, CardType } from '../shared/services-overview-card';

export class ServicesOverviewHybridCallCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'call-service.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.hybridCall.buttons.resources',
    routerState: 'call-service.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridCall.buttons.settings',
    routerState: 'call-service.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  /* @ngInject */
  public constructor(
    Authinfo,
  ) {
    super({
      active: false,
      cardClass: 'call',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridCall.description',
      name: 'servicesOverview.cards.hybridCall.title',
      routerState: 'call-service.list',
      serviceId: 'squared-fusion-uc',
    });
    this.display = Authinfo.isFusionUC();
  }
}
