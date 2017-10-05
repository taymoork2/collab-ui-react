import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

class HybridCalendarGoogleInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private CloudConnectorService: CloudConnectorService,
  ) {}

  public openSetUp(): void {
    this.CloudConnectorService.openSetupModal();
  }
}

export class HybridCalendarGoogleInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarGoogleInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <div class="inactive-card_logo inactive-card_logo--google"><img src="/images/hybrid-services/Google_Calendar_logo_small.png" alt="{{::'servicesOverview.cards.hybridCalendar.googleTitle' | translate}}"></div>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
