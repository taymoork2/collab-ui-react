import { USSService, IStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCalendarO365ActiveCardController implements ng.IComponentController {
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
    // TODO: filter by "ownedBy" once implemented on the server
    this.userStatusesSummary = this.USSService.extractSummaryForAService(['squared-fusion-cal']);
  }
}

export class HybridCalendarO365ActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarO365ActiveCardController;
  public template = `
    <article>
      <div class="active-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{'servicesOverview.cards.hybridCalendar.description' | translate}}" tooltip-placement="bottom-right"></i>
        <div class="active-card_logo"><img src="/images/hybrid-services/Office_365_logo_small.png" alt="{{::servicesOverview.cards.hybridCalendar.office365Title | translate}}"></div>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title">Service</div>
          <div class="active-card_action"><a ui-sref="office-365-service.settings">Configure</a></div>
        </div>
        <card-users-summary summary="$ctrl.userStatusesSummary"></card-users-summary>
      </div>
      <div class="active-card_footer">
        <a ui-sref="office-365-service.settings">
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
