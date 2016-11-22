import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridCallCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'call-service.list',
    buttonClass: 'btn',
  };

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.hybridCall.buttons.resources',
      routerState: 'call-service.list',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.hybridCall.buttons.settings',
      routerState: 'call-service.settings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this._buttons;
    }
    return [this._setupButton];
  }

  /* @ngInject */
  public constructor(Authinfo, FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.hybridCall.title',
      description: 'servicesOverview.cards.hybridCall.description',
      activeServices: ['squared-fusion-uc'],
      statusServices: ['squared-fusion-uc'],
      routerState: 'call-service.list',
      cardClass: 'call',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
    this.display = Authinfo.isFusionUC();
  }
}
