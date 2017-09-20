import { USSService, IStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCallActiveCardController implements ng.IComponentController {
  private subscribeStatusesSummary: any;

  public userStatusesSummary: IStatusSummary[] | undefined;

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
    this.userStatusesSummary = this.USSService.extractSummaryForAService(['squared-fusion-uc', 'squared-fusion-ec']);
  }
}
export class HybridCallActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCallActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridCall.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{'servicesOverview.cards.hybridCall.description' | translate}}" tooltip-placement="bottom-right"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title">Service</div>
          <div class="active-card_action"><a ui-sref="call-service.settings">Configure</a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title">Resources</div>
          <div class="active-card_action"><a ui-sref="call-service.list">View all</a></div>
        </div>
        <card-users-summary summary="$ctrl.userStatusesSummary"></card-users-summary>
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
    serviceStatus: '<',
  };
}
