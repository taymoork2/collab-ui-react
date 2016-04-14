/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingHybridMediaCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {name: 'servicesLanding.genericButtons.setup', link: 'services/media', buttonClass: 'cta-btn'};

    private _buttons:Array<servicesLanding.CardButton> = [
      {name: 'servicesLanding.cards.hybridMedia.buttons.settings', link: 'services/media'}];


    getButtons():Array<servicesLanding.CardButton> {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.hybridMedia.title', 'servicesLanding.cards.hybridMedia.description', 'icon-circle-media', false, 'media', CardType.hybrid);
    }
  }
}
