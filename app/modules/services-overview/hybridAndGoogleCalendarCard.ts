import { ICardButton, ICardStatus, CardType } from './ServicesOverviewCard';
import { IServiceStatus, filterAndGetCssStatus, filterAndGetTxtStatus, filterAndGetEnabledService } from './ServicesOverviewHybridCard';
import { ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewHybridAndGoogleCalendarCard extends ServicesOverviewCard {
  private canDisplay: ng.IDeferred<void> = this.$q.defer();
  public googleActive: boolean = false;
  private googleStatus: ICardStatus;

  // Don't care but because of ServicesOverviewCard we have to do something
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  // Hybrid Calendar
  private setupHybridCalendarButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'calendar-service.list',
    buttonClass: 'btn btn--primary',
  };

  private hybridCalendarButtons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridCalendar.buttons.resources',
    routerState: 'calendar-service.list',
    buttonClass: 'btn-link',
  },
  {
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'calendar-service.settings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this.hybridCalendarButtons;
    }
    return [this.setupHybridCalendarButton];
  }

  // Google Calendar
  private setupGoogleCalendarButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'calendar-service.list',
    buttonClass: 'btn btn--primary',
  };

  private googleCalendarButtons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'calendar-service.settings',
    buttonClass: 'btn-link',
  }];

  public getGoogleButtons(): Array<ICardButton> {
    if (this.googleActive) {
      return this.googleCalendarButtons;
    }
    return [this.setupGoogleCalendarButton];
  }

  public googleCalendarFeatureToggleEventHandler(hasFeature: boolean) {
    this.display = this.Authinfo.isFusionCal() && this.Authinfo.isFusionGoogleCal() && hasFeature;
    if (this.display) {
      // We only get the status for Hybrid Calendar that way
      this.CloudConnectorService.isServiceSetup('squared-fusion-gcal')
        .then((isSetup) => {
          // conveys the same as .active for Hybrid Calendar
          this.googleActive = isSetup;
          this.canDisplay.resolve();
          // Fake data for now
          this.googleStatus = {
            status: 'default',
            text: 'servicesOverview.cardStatus.setupNotComplete',
            routerState: 'calendar-service.list', // will trigger the right modal
          };
        });
    }
  }

  // Contains data for Hybrid Services, not Google Calendar
  public hybridStatusEventHandler(servicesStatuses: Array<IServiceStatus>) {
    const service = 'squared-fusion-cal';
    // No need to do any work if we can't display the card
    this.canDisplay.promise.then(() => {
      this.status = {
        status: filterAndGetCssStatus(this.FusionClusterStatesService, servicesStatuses, service),
        text: filterAndGetTxtStatus(servicesStatuses, service),
        routerState: 'calendar-service.list',
      };
      this.active = filterAndGetEnabledService(servicesStatuses, service);
      // We can stop loading now because we know we have the results for both services
      this.loading = false;
      debugger;
    });
  }

  public showGoogleStatus() {
    return !this.loading && this.googleActive;
  }

  /* @ngInject */
  public constructor(
    private $q,
    private Authinfo,
    private CloudConnectorService,
    private FusionClusterStatesService
  ) {
    super({
      active: false,
      cardClass: 'calendar',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridCalendar.description',
      name: 'servicesOverview.cards.hybridCalendar.title',
      template: 'modules/services-overview/hybridAndGoogleCalendarCard.tpl.html',
    });
  }
}
