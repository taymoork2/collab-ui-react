import { ICardButton, CardType } from './ServicesOverviewCard';
import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';

export class ServicesOverviewHybridCalendarCard extends ServicesOverviewHybridCard {

  private isGoogleCalendarEntitled: boolean;
  private hasGoogleCalendarFeatureToggle: boolean;
  private isGoogleCalendarSetup: boolean;
  private cloudConnectorService;

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

  private _googleCalendarButtons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.calendar.buttons.settings',
      routerState: 'calendar-service.settings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.isGoogleCalendarSetup) {
      return this._googleCalendarButtons;
    }
    if (this.active) {
      return this._buttons;
    }
    return [this._setupButton];
  }

  public googleCalendarFeatureToggleEventHandler(hasFeature: boolean) {

    if (!hasFeature || !this.isGoogleCalendarEntitled) {
      return;
    }
    this.hasGoogleCalendarFeatureToggle = hasFeature;
    this.cloudConnectorService.isServiceSetup('squared-fusion-gcal')
      .then((isSetup) => {
        this.isGoogleCalendarSetup = isSetup;
      });

  }

  /* @ngInject */
  public constructor(CloudConnectorService, Authinfo, FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.calendar.title',
      description: 'servicesOverview.cards.calendar.description',
      activeServices: ['squared-fusion-cal'],
      statusService: 'squared-fusion-cal',
      routerState: 'calendar-service.list',
      cardClass: 'calendar',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
    this.display = Authinfo.isFusionCal();
    this.isGoogleCalendarEntitled = Authinfo.isFusionGoogleCal();
    this.cloudConnectorService = CloudConnectorService;
  }
}
