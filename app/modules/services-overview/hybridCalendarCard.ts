import { ICardButton, CardType } from './ServicesOverviewCard';
import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';

export class ServicesOverviewHybridCalendarCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'calendar-service.list',
    buttonClass: 'btn btn--primary',
  };

  private buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridCalendar.buttons.resources',
    routerState: 'calendar-service.list',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'calendar-service.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this.buttons;
    }
    return [this.setupButton];
  }

  public googleCalendarFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = this.Authinfo.isFusionCal() && !(this.Authinfo.isFusionGoogleCal() || hasFeature);
  }

  /* @ngInject */
  public constructor(private Authinfo, FusionClusterStatesService) {
    super({
      active: false,
      cardClass: 'calendar',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridCalendar.description',
      name: 'servicesOverview.cards.hybridCalendar.title',
      routerState: 'calendar-service.list',
      service: 'squared-fusion-cal',
    }, FusionClusterStatesService);
    // Optimistically display it (will be hidden if the org has google calendar feature toggle)
    this.display = Authinfo.isFusionCal() && !Authinfo.isFusionGoogleCal();
  }
}
