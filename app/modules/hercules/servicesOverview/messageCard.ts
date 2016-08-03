import { CardButton, CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewMessageCard extends ServicesOverviewCard {
  getShowMoreButton():CardButton {
    return undefined;
  }

  private _buttons:Array<CardButton>;

  getButtons():Array<CardButton> {
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
