import { ICardButton, CardType } from './ServicesOverviewCard';
import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';

export class ServicesOverviewHybridCalendarCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    link: 'services/calendar',
    buttonClass: 'btn',
  };

  private _buttons: Array<ICardButton> = [
    { name: 'servicesOverview.cards.calendar.buttons.resources', link: 'services/calendar', buttonClass: 'btn-link' },
    {
      name: 'servicesOverview.cards.calendar.buttons.settings',
      link: 'services/calendar/settings',
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
      name: 'servicesOverview.cards.calendar.title',
      description: 'servicesOverview.cards.calendar.description',
      activeServices: ['squared-fusion-cal'],
      statusService: 'squared-fusion-cal',
      statusLink: 'services/calendar',
      cardClass: 'calendar',
      cardType: CardType.hybrid,
    });
  }
}
