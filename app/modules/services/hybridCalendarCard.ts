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
      name: 'servicesOverview.cards.hybridCalendar.buttons.resources',
      routerState: 'calendar-service.list',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
      routerState: 'calendar-service.settings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this._buttons;
    }
    return [this._setupButton];
  }

  public googleCalendarFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = this.Authinfo.isFusionCal() && (!this.Authinfo.isFusionGoogleCal() || !hasFeature);
  }

  /* @ngInject */
  public constructor(private Authinfo, FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.hybridCalendar.title',
      description: 'servicesOverview.cards.hybridCalendar.description',
      service: 'squared-fusion-cal',
      routerState: 'calendar-service.list',
      cardClass: 'calendar',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
    // Optimisticly display it (will be hidden if the org has google calendar feature)
    this.display = Authinfo.isFusionCal() && !Authinfo.isFusionGoogleCal();
  }
}
