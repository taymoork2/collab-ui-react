import { USSService, IExtendedStatusSummary } from 'modules/hercules/services/uss.service';

class HybridIMPActiveCardController implements ng.IComponentController {
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
    this.userStatusesSummary = this.USSService.extractSummaryForAService(['spark-hybrid-impinterop']);
  }
}

export class HybridIMPActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridIMPActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridImp.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridImp.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter"></i>
      </div>
      <div class="active-card_content">
        <card-users-summary summary="$ctrl.userStatusesSummary"></card-users-summary>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="imp-service.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
          <card-capacity-bar ng-if="$ctrl.hasCapacityFeatureToggle" connector-type="'c_imp'" clusters="$ctrl.clusters" summary="$ctrl.userStatusesSummary"></card-capacity-bar>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="imp-service.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="imp-service.list">
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
