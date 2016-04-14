/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingWebexCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _buttons;

    getButtons():Array<servicesLanding.CardButton> {
      return this._buttons;
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.webex.title', 'servicesLanding.cards.webex.description', 'icon-circle-message');
      this._buttons = [{
        name: 'servicesLanding.cards.webex.buttons.webexMessenger',
        link: ''
      }];
    }
  }
}
