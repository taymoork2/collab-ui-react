/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingHybridContextCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.hybridContext.buttons.settings', link: ''}];


    getButtons():Array<servicesLanding.CardButton> {
      return _.take(this._buttons, 3);
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.hybridContext.title', 'servicesLanding.cards.hybridContext.description', 'icon-circle-data', true, 'context', CardType.hybrid);

      this._loading = false;
    }
  }
}
