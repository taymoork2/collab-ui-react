/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewMessageCard extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons;

    getButtons():Array<servicesOverview.CardButton> {
      return this._buttons;
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.message.title', 'servicesOverview.cards.message.description', 'icon-circle-message', true);
      this._buttons = [];
      //   {
      //   name: 'servicesOverview.cards.message.buttons.webexMessenger',
      //   link: ''
      // }
      // ];
      this._loading = false;
    }
  }
}
