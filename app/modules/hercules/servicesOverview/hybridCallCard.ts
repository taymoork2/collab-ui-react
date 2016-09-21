import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridCallCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton {
    return undefined;
  }

  private _setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    link: 'services/call',
    buttonClass: 'btn',
  };

  private _buttons: Array<ICardButton> = [
    { name: 'servicesOverview.cards.hybridCall.buttons.resources', link: 'services/call', buttonClass: 'btn-link' },
    {
      name: 'servicesOverview.cards.hybridCall.buttons.settings',
      link: 'services/call/settings',
      buttonClass: 'btn-link',
    }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [this._setupButton];
  }

  public constructor() {
    super({
      name: 'servicesOverview.cards.hybridCall.title',
      description: 'servicesOverview.cards.hybridCall.description',
      activeServices: ['squared-fusion-uc'],
      statusService: 'squared-fusion-uc',
      statusLink: 'services/call',
      active: false, cardClass: 'call', cardType: CardType.hybrid,
    });
  }
}
