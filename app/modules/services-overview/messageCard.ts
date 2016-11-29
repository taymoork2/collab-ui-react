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
      description: 'servicesOverview.cards.message.description',
      icon: 'icon-circle-message',
      name: 'servicesOverview.cards.message.title',
    });

    this._buttons = Authinfo.isAllowedState('messenger')
      ? [{
        name: 'servicesOverview.cards.message.buttons.webexMessenger',
        routerState: 'messenger',
        buttonClass: 'btn-link',
      }]
      : [];

    this.loading = false;
  }
}
