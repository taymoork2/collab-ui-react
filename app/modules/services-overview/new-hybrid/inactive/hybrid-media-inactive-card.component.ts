import { FeatureToggleService } from 'modules/core/featureToggle';
import { IToolkitModalService } from 'modules/core/modal';

class HybridMediaInactiveCardController implements ng.IComponentController {
  public hasMfClusterWizardFeatureToggle: boolean = false;
  public hasMfFirstTimeCallingFeatureToggle: boolean = false;
  public hasMfFeatureToggle: boolean = false;
  public hasMfSIPFeatureToggle: boolean = false;
  public hasMfCascadeBwConfigToggle: boolean = false;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private FeatureToggleService: FeatureToggleService,
  ) {}

  public $onInit = () => {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceClusterWizard).then( (supported) => {
      this.hasMfClusterWizardFeatureToggle = supported;
    });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServicePhaseTwo).then( (supported) => {
      this.hasMfFeatureToggle = supported;
    });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceTrustedSIP).then( (supported) => {
      this.hasMfSIPFeatureToggle = supported;
    });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceCascadeBwConfig).then( (supported) => {
      this.hasMfCascadeBwConfigToggle = supported;
    });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceClusterWizard).then( (supported) => {
      this.hasMfClusterWizardFeatureToggle = supported;
    });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceFirstTimeCalling).then( (supported) => {
      this.hasMfFirstTimeCallingFeatureToggle = supported;
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
    if (this.hasMfClusterWizardFeatureToggle) {
      this.$modal.open({
        resolve: {
          firstTimeSetup: true,
          yesProceed: true,
          hasMfFeatureToggle: this.hasMfFeatureToggle,
          hasMfSIPFeatureToggle: this.hasMfSIPFeatureToggle,
          hasMfCascadeBwConfigToggle: this.hasMfCascadeBwConfigToggle,
          hasMfClusterWizardFeatureToggle: this.hasMfClusterWizardFeatureToggle,
          hasMfFirstTimeCallingFeatureToggle: this.hasMfFirstTimeCallingFeatureToggle,
        },
        type: 'modal',
        controller: 'ClusterCreationWizardController',
        controllerAs: 'clusterCreationWizard',
        template: require('modules/mediafusion/media-service-v2/add-resource-wizard/cluster-creation-wizard.tpl.html'),
      });
    } else {
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
        <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
