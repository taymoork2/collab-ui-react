import { FeatureToggleService } from 'modules/core/featureToggle';
import { IToolkitModalService } from 'modules/core/modal';

class HybridMediaInactiveCardController implements ng.IComponentController {
  public showPrerequisitesButton = false;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
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
      controller: 'HybridMediaPrerequisitesController',
      controllerAs: 'vm',
      template: require('modules/services-overview/new-hybrid/prerequisites-modals/hybrid-media-prerequisites/hybrid-media-prerequisites.html'),
    });
  }

  public openSetUp(): void {
    this.$modal.open({
      resolve: {
        firstTimeSetup: true,
        yesProceed: true,
      },
      type: 'small',
      controller: 'RedirectAddResourceControllerV2',
      controllerAs: 'redirectResource',
      template: require('modules/mediafusion/media-service-v2/add-resources/add-resource-dialog.html'),
      modalClass: 'redirect-add-resource',
    });
  }
}

export class HybridMediaInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridMediaInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="servicesOverview.cards.hybridMedia.title"></h4>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridMedia.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p ng-if="$ctrl.showPrerequisitesButton"><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
