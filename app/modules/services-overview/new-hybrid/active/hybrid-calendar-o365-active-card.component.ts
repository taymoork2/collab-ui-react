import { USSService, IStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCalendarO365ActiveCardController implements ng.IComponentController {
  private subscribeStatusesSummary: any;

  public userStatusesSummary: IStatusSummary | undefined;

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
    this.userStatusesSummary = _.find(this.USSService.extractSummaryForAService(['squared-fusion-cal']), {
      serviceId: 'squared-fusion-cal',
    });
  }
}

export class HybridCalendarO365ActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarO365ActiveCardController;
  public template = `
    <article>
      <div class="active-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span><img src="/images/hybrid-services/Office_365_logo_small.png" alt="{{::servicesOverview.cards.hybridCalendar.office365Title | translate}}"></span>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="office-365-service.settings">Configure</a></p>
        <card-users-summary link="'office-365-service.settings'" summary="$ctrl.userStatusesSummary"></card-users-summary>
      </div>
      <div class="active-card_footer">
        <a ui-sref="office-365-service.settings">
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
