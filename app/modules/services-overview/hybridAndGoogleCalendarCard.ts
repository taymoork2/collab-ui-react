import { ICardStatus, CardType } from './ServicesOverviewCard';
import { IServiceStatus, filterAndGetCssStatus, filterAndGetTxtStatus, filterAndGetEnabledService } from './ServicesOverviewHybridCard';
import { ICardButton, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewHybridAndGoogleCalendarCard extends ServicesOverviewCard {
  private canDisplay: ng.IDeferred<boolean> = this.$q.defer();
  private googleStatus: ICardStatus;

  public googleActive: boolean = false;

  // We don't care about these methods this card,
  // but because of ServicesOverviewCard we need a minimal implementation
  public getShowMoreButton() {
    return undefined;
  }
  public getButtons() {
    return [];
  }

  public areNoneActive() {
    return !this.active && !this.googleActive;
  }

  public openChoiceModal() {
    this.$modal.open({
      controller: 'SelectCalendarServiceController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-settings/calendar-service-setup/select-calendar-service-modal.html',
    })
    .result
    .then((result) => {
      if (result === 'exchange') {
        this.firstTimeExchangeSetup();
      } else if (result === 'google') {
        this.firstTimeGoogleSetup();
      }
    });
  }

  private firstTimeExchangeSetup() {
    this.$modal.open({
      resolve: {
        connectorType: () => 'c_cal',
        serviceId: () => 'squared-fusion-cal',
        firstTimeSetup: true,
      },
      controller: 'AddResourceController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html',
      type: 'small',
    })
      .result
      .then(() => {
        this.$state.go('calendar-service.list');
      });
  }

  private firstTimeGoogleSetup() {
    this.$modal.open({
      controller: 'FirstTimeGoogleSetupController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/service-settings/calendar-service-setup/first-time-google-setup.html',
    })
      .result
      .then(() => {
        this.$state.go('google-calendar-service.settings');
      });
  }

  // Hybrid Calendar
  public setupHybridCalendarButton = {
    name: 'servicesOverview.genericButtons.setup',
    onClick: () => {
      this.firstTimeExchangeSetup();
    },
    buttonClass: 'btn btn--primary',
  };

  public hybridCalendarButtons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.hybridCalendar.buttons.resources',
    routerState: 'calendar-service.list',
    buttonClass: 'btn-link',
  },
  {
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'calendar-service.settings',
    buttonClass: 'btn-link',
  }];

  // Google Calendar
  public setupGoogleCalendarButton = {
    name: 'servicesOverview.genericButtons.setup',
    onClick: () => {
      this.firstTimeGoogleSetup();
    },
    buttonClass: 'btn btn--primary',
  };

  public googleCalendarButton: ICardButton = {
    name: 'servicesOverview.cards.hybridCalendar.buttons.settings',
    routerState: 'google-calendar-service.settings',
    buttonClass: 'btn-link',
  };

  public googleCalendarFeatureToggleEventHandler(hasFeature: boolean) {
    const serviceId = 'squared-fusion-gcal';
    this.display = this.Authinfo.isFusionCal() && this.Authinfo.isFusionGoogleCal() && hasFeature;
    if (this.display) {
      // We only get the status for Hybrid Calendar that way
      this.CloudConnectorService.getService(serviceId)
        .then(servicesStatus => {
          const servicesStatuses = [servicesStatus];
          // .googleActive conveys the same meaning as .active for Hybrid Calendar
          this.googleActive = servicesStatus.setup;
          this.googleStatus = {
            status: filterAndGetCssStatus(this.FusionClusterStatesService, servicesStatuses, serviceId),
            text: filterAndGetTxtStatus(servicesStatuses, serviceId),
            routerState: 'google-calendar-service.settings',
          };
          this.canDisplay.resolve(true);
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
      // Setup mode = no service is enabled
      this.setupMode = !this.active && !this.googleActive;
      if (!this.setupMode) {
        this.cardClass += ' large';
      }
      // We can stop loading now because we know we have the results for both services
      this.loading = false;
    });
  }

  public showGoogleStatus() {
    return !this.loading && this.googleActive;
  }

  /* @ngInject */
  public constructor(
    private $state,
    private $q: ng.IQService,
    private $modal,
    private Authinfo,
    private CloudConnectorService,
    private FusionClusterStatesService,
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
