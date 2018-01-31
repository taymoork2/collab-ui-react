import { ICardButton, ServicesOverviewCard } from '../shared/services-overview-card';
import { MessengerInteropService } from 'modules/core/users/userAdd/shared/messenger-interop/messenger-interop.service';

export class ServicesOverviewMessageCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: ICardButton[];

  public getButtons(): ICardButton[] {
    return this._buttons;
  }

  /* @ngInject */
  public constructor(
    Authinfo,
    MessengerInteropService: MessengerInteropService,
  ) {
    super({
      description: 'servicesOverview.cards.message.description',
      icon: 'icon-circle-message',
      name: 'servicesOverview.cards.message.title',
    });

    this._buttons = [];
    if (Authinfo.isAllowedState('messenger') && MessengerInteropService.hasMessengerLicense()) {
      this._buttons.push({
        name: 'servicesOverview.cards.message.buttons.webexMessenger',
        routerState: 'messenger',
        buttonClass: 'btn-link',
      });
    }
    this.loading = false;
  }
}
