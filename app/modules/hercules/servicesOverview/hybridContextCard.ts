import { CardButton, CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewHybridContextCard extends ServicesOverviewCard {
  getShowMoreButton():CardButton {
    return undefined;
  }

  private _buttons:Array<CardButton> = [];

  getButtons():Array<CardButton> {
    return _.take(this._buttons, 3);
  }

  public constructor() {
    super({
      name: 'servicesOverview.cards.hybridContext.title',
      description: 'servicesOverview.cards.hybridContext.description',
      cardClass: 'context',
      cardType: CardType.hybrid
    });

    this._loading = false;
  }
}
