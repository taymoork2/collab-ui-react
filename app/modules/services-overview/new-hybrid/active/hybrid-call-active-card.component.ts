import { USSService, IExtendedStatusByClusters, IExtendedStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCallActiveCardController implements ng.IComponentController {
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
    this.userStatusesSummary = this.USSService.extractSummaryForAService(['squared-fusion-uc']);
    this.userStatusesByClustersSummary = this.USSService.extractSummaryForClusters(['squared-fusion-uc']);
  }
}

export class HybridCallActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCallActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridCall.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridCall.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'servicesOverview.cards.hybridCall.description' | translate}}"></i>
      </div>
      <div class="active-card_content">
        <card-users-summary summary="$ctrl.userStatusesSummary"></card-users-summary>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="call-service.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
          <card-capacity-bar ng-if="$ctrl.hasCapacityFeatureToggle" connector-type="'c_ucmc'" clusters="$ctrl.clusters" summary="$ctrl.userStatusesByClustersSummary"></card-capacity-bar>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="call-service.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="call-service.list">
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
