import { FeatureToggleService } from 'modules/core/featureToggle';
import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { IToolkitModalService } from 'modules/core/modal/index';

class HybridCalendarGoogleInactiveCardController implements ng.IComponentController {
  public showPrerequisitesButton = false;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private CloudConnectorService: CloudConnectorService,
    private FeatureToggleService: FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.hasFeatureToggleOrIsTestOrg(this.FeatureToggleService.features.atlasHybridPrerequisites)
      .then(support => {
        this.showPrerequisitesButton = support;
      });
  }

  public openPrerequisites(): void {
    this.$modal.open({
      template: '<google-calendar-prerequisites close="$close()" dismiss="$dismiss()"></google-calendar-prerequisites>',
    });
  }

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
        <p ng-if="$ctrl.showPrerequisitesButton"><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
