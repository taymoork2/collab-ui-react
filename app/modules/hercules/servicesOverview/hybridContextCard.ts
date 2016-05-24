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
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.hybridContext.title', 'servicesOverview.cards.hybridContext.description', '', true, 'context', CardType.hybrid);

      this._loading = false;
    }
  }
}
