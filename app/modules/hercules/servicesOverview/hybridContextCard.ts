/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewHybridContextCard extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.hybridContext.buttons.settings', link: ''}];


    getButtons():Array<servicesOverview.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.hybridContext.title', 'servicesOverview.cards.hybridContext.description', 'icon-circle-data', true, 'context', CardType.hybrid);

      this._loading = false;
    }
  }
}
