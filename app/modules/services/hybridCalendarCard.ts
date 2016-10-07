import { ICardButton, CardType } from './ServicesOverviewCard';
import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';

export class ServicesOverviewHybridCalendarCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'calendar-service.list',
    buttonClass: 'btn',
  };

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.calendar.buttons.resources',
      routerState: 'calendar-service.list',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.calendar.buttons.settings',
      routerState: 'calendar-service.settings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [this._setupButton];
  }

  /* @ngInject */
  public constructor(FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.calendar.title',
      description: 'servicesOverview.cards.calendar.description',
      activeServices: ['squared-fusion-cal'],
      statusService: 'squared-fusion-cal',
      routerState: 'calendar-service.list',
      cardClass: 'calendar',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
  }
}
