import { USSService, IExtendedStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCalendarExchangeActiveCardController implements ng.IComponentController {
  private subscribeStatusesSummary: any;

  public userStatusesSummary: IExtendedStatusSummary[] | undefined;

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
  }
}

export class HybridCalendarExchangeActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarExchangeActiveCardController;
  public template = `
    <article>
      <div class="active-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridCalendar.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter"></i>
        <div class="active-card_logo"><img src="/images/hybrid-services/Microsoft_Exchange_logo_small.png" alt="{{::'servicesOverview.cards.hybridCalendar.exchangeTitle' | translate}}"></div>
      </div>
      <div class="active-card_content">
        <card-users-summary summary="$ctrl.userStatusesSummary"></card-users-summary>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="calendar-service.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
          <card-capacity-bar ng-if="$ctrl.hasCapacityFeatureToggle" connector-type="'c_cal'" clusters="$ctrl.clusters" summary="$ctrl.userStatusesSummary"></card-capacity-bar>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="calendar-service.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="calendar-service.list">
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    clusters: '<',
    hasCapacityFeatureToggle: '<',
    serviceStatus: '<',
  };
}
