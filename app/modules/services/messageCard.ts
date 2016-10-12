import { ICardButton, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewMessageCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton>;

  public getButtons(): Array<ICardButton> {
    return this._buttons;
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.message.title',
      description: 'servicesOverview.cards.message.description',
      icon: 'icon-circle-message',
    });

    this._buttons = Authinfo.isAllowedState('messenger')
      ? [{
        name: 'servicesOverview.cards.message.buttons.webexMessenger',
        routerState: 'messenger',
        buttonClass: 'btn-link',
      }]
      : [];

    this._loading = false;
  }
}
