import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridCallCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'call-service.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridCall.buttons.resources',
    routerState: 'call-service.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridCall.buttons.settings',
    routerState: 'call-service.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  /* @ngInject */
  public constructor(Authinfo, FusionClusterStatesService) {
    super({
      active: false,
      cardClass: 'call',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridCall.description',
      name: 'servicesOverview.cards.hybridCall.title',
      routerState: 'call-service.list',
      service: 'squared-fusion-uc',
    }, FusionClusterStatesService);
    this.display = Authinfo.isFusionUC();
  }
}
