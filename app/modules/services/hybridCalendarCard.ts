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

  private _googleCalendarButtons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
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
  public constructor(Authinfo, CloudConnectorService, FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.hybridCalendar.title',
      description: 'servicesOverview.cards.hybridCalendar.description',
      activeServices: ['squared-fusion-cal', 'squared-fusion-gcal'],
      statusServices: ['squared-fusion-cal', 'squared-fusion-gcal'],
      routerState: 'calendar-service.list',
      cardClass: 'calendar',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
    this.cloudConnectorService = CloudConnectorService;
    this.display = Authinfo.isFusionCal();
    this.isGoogleCalendarEntitled = Authinfo.isFusionGoogleCal();
  }
}
