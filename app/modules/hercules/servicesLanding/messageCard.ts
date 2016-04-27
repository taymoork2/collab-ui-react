/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  export class ServicesLandingMessageCard extends ServicesLandingCard {
    getShowMoreButton():servicesLanding.CardButton {
      return undefined;
    }

    private _buttons;

    getButtons():Array<servicesLanding.CardButton> {
      return this._buttons;
    }

    public constructor() {
      super('modules/hercules/servicesLanding/serviceCard.tpl.html',
        'servicesLanding.cards.message.title', 'servicesLanding.cards.message.description', 'icon-circle-message',true);
      this._buttons = [];
      //   {
      //   name: 'servicesLanding.cards.message.buttons.webexMessenger',
      //   link: ''
      // }
      // ];
      this._loading = false;
    }
  }
}
