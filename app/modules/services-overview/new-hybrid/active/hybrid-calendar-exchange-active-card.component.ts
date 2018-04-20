import { USSService, IExtendedStatusByClusters, IExtendedStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCalendarExchangeActiveCardController implements ng.IComponentController {
  private subscribeStatusesSummary: any;

  public userStatusesSummary: IExtendedStatusSummary[] | undefined;
  public userStatusesByClustersSummary: IExtendedStatusByClusters[] | undefined;

  /* @ngInject */
  constructor(
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
  }

  public $onDestroy() {
    this.subscribeStatusesSummary.cancel();
  }

  private extractSummary() {
    this.userStatusesSummary = this.USSService.extractSummaryForAService(['squared-fusion-cal']);
    this.userStatusesByClustersSummary = this.USSService.extractSummaryForClusters(['squared-fusion-cal']);
  }
}

export class HybridCalendarExchangeActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarExchangeActiveCardController;
  public template = `
    <article>
      <div class="active-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridCalendar.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'servicesOverview.cards.hybridCalendar.description' | translate}}"></i>
        <div class="active-card_logo"><img src="/images/hybrid-services/Microsoft_Exchange_logo_small.png" alt="{{::'servicesOverview.cards.hybridCalendar.exchangeTitle' | translate}}"></div>
      </div>
      <div class="active-card_content">
        <card-users-summary summary="$ctrl.userStatusesSummary"></card-users-summary>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="calendar-service.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
          <card-capacity-bar ng-if="$ctrl.hasCapacityFeatureToggle" connector-type="'c_cal'" clusters="$ctrl.clusters" summary="$ctrl.userStatusesByClustersSummary"></card-capacity-bar>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="calendar-service.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="calendar-service.list" class="active-card_footer_status-link">
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
        </a>
        <a ng-if="$ctrl.hasEventsHistoryFeatureToggle" ui-sref="hybrid-services-event-history-page({serviceId: 'squared-fusion-cal'})" class="active-card_footer_events-link">
          <span>Events</span>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    clusters: '<',
    hasCapacityFeatureToggle: '<',
    hasEventsHistoryFeatureToggle: '<',
    serviceStatus: '<',
  };
}
