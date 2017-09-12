import { USSService, IStatusSummary } from 'modules/hercules/services/uss.service';

class HybridCalendarGoogleActiveCardController implements ng.IComponentController {
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
    this.userStatusesSummary = _.find(this.USSService.extractSummaryForAService(['squared-fusion-cal']), {
      serviceId: 'squared-fusion-gcal',
    });
  }
}

export class HybridCalendarGoogleActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarGoogleActiveCardController;
  public template = `
    <article>
      <div class="active-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span><img src="/images/hybrid-services/Google_Calendar_logo_small.png" alt="{{::servicesOverview.cards.hybridCalendar.googleTitle | translate}}"></span>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="google-calendar-service.settings">Configure</a></p>
        <card-users-summary link="'calendar-service.list'" summary="$ctrl.userStatusesSummary"></card-users-summary>
      </div>
      <div class="active-card_footer">
        <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
        <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
