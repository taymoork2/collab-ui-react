import { CardButton, CardType } from './ServicesOverviewCard';
import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';

export class ServicesOverviewCalendarCard extends ServicesOverviewHybridCard {
  getShowMoreButton():CardButton {
    return undefined;
  }

  private _setupButton:CardButton = {
    name: 'servicesOverview.genericButtons.setup',
    link: 'services/calendar',
    buttonClass: 'btn'
  };

  private _buttons:Array<CardButton> = [
    {name: 'servicesOverview.cards.calendar.buttons.resources', link: 'services/calendar', buttonClass: 'btn-link'},
    {
      name: 'servicesOverview.cards.calendar.buttons.settings',
      link: 'services/calendar/settings',
      buttonClass: 'btn-link'
    }];


  getButtons():Array<CardButton> {
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
      statusServices: ['squared-fusion-cal'],
      statusLink: 'services/calendar',
      cardClass: 'calendar',
      cardType: CardType.hybrid
    });
  }
}
