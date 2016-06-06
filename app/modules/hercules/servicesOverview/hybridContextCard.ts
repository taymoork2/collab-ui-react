/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridContextCard extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [];

    getButtons():Array<servicesOverview.CardButton> {
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
}
