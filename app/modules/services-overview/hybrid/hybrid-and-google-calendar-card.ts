import { ICardStatus, CardType } from '../shared/services-overview-card';
import { filterAndGetCssStatus, filterAndGetTxtStatus, filterAndGetEnabledService } from './services-overview-hybrid-card';
import { ICardButton, ServicesOverviewCard } from '../shared/services-overview-card';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { Notification } from 'modules/core/notifications';
import { IServiceStatusWithSetup } from 'modules/hercules/services/hybrid-services-cluster.service';

export class ServicesOverviewHybridAndGoogleCalendarCard extends ServicesOverviewCard {
  private canDisplay: ng.IDeferred<boolean> = this.$q.defer();
  private googleStatus: ICardStatus;

  public googleActive: boolean = false;
  public googleServerError: boolean = false;

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
      template: require('modules/hercules/service-settings/calendar-service-setup/select-calendar-service-modal.html'),
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
      template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
    })
      .result
      .then((value) => {
        if (value === 'back') {
          this.openChoiceModal();
          return;
        }
        this.$state.go('calendar-service.list');
      });
  }

  private firstTimeGoogleSetup() {
    this.CloudConnectorService.openSetupModal()
      .then((value) => {
        if (value === 'back') {
          this.openChoiceModal();
          return;
        }
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

  public hybridCalendarButtons: ICardButton[] = [{
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

  public fetchGoogleCalendar() {
    const serviceId = 'squared-fusion-gcal';
    if (this.display) {
      // We only get the status for Hybrid Calendar that way
      this.CloudConnectorService.getService('squared-fusion-gcal')
        .then(servicesStatus => {
          const servicesStatuses = [servicesStatus] as IServiceStatusWithSetup[];
          // .googleActive conveys the same meaning as .active for Hybrid Calendar
          this.googleActive = servicesStatus.setup;
          this.googleStatus = {
            status: filterAndGetCssStatus(servicesStatuses, serviceId),
            text: filterAndGetTxtStatus(servicesStatuses, serviceId),
            routerState: 'google-calendar-service.settings',
          };
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'servicesOverview.cards.hybridCalendar.error');
          this.googleActive = false;
          this.googleServerError = true;
        })
        .finally(() => {
          this.canDisplay.resolve(true);
        });
    }
  }

  // Contains data for Hybrid Services, not Google Calendar
  public hybridStatusEventHandler(servicesStatuses: IServiceStatusWithSetup[]) {
    const service = 'squared-fusion-cal';
    // No need to do any work if we can't display the card
    this.canDisplay.promise.then(() => {
      this.status = {
        status: filterAndGetCssStatus(servicesStatuses, service),
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
    Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private Notification: Notification,
  ) {
    super({
      active: false,
      cardClass: 'calendar',
      cardType: CardType.hybrid,
      description: 'servicesOverview.cards.hybridCalendar.description',
      name: 'servicesOverview.cards.hybridCalendar.title',
      template: 'modules/services-overview/hybrid/hybrid-and-google-calendar-card.html',
    });
    this.display = Authinfo.isFusionCal() && Authinfo.isFusionGoogleCal();
    this.fetchGoogleCalendar();
  }
}
