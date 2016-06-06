/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewMessageCard extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _buttons:Array<servicesOverview.CardButton>;

    getButtons():Array<servicesOverview.CardButton> {
      return this._buttons;
    }

    public constructor(Authinfo) {
      super({
        name: 'servicesOverview.cards.message.title',
        description: 'servicesOverview.cards.message.description',
        icon: 'icon-circle-message',
      });

      this._buttons = Authinfo.isAllowedState('messenger')
        ? [{name: 'servicesOverview.cards.message.buttons.webexMessenger', link: 'messenger', buttonClass: 'btn-link'}]
        : [];

      this._loading = false;
    }
  }
}
