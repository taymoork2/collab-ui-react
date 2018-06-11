import { IToolkitModalService } from 'modules/core/modal';

class HybridCallInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
  ) {}

  public openPrerequisites(): void {
    this.$modal.open({
      controller: 'HybridCallPrerequisitesController',
      controllerAs: 'vm',
      template: require('modules/services-overview/new-hybrid/prerequisites-modals/hybrid-call-prerequisites-modal/hybrid-call-prerequisites.html'),
      resolve: {
        callServiceConnectOnly: () => false,
      },
    });
  }

  public openSetUp(): void {
    this.$modal.open({
      resolve: {
        connectorType: () => 'c_ucmc',
        serviceId: () => 'squared-fusion-uc',
        options: {
          firstTimeSetup: true,
        },
      },
      controller: 'AddResourceController',
      controllerAs: 'vm',
      template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
      type: 'small',
    }).result
      .finally(() => {
        this.$state.go('services-overview', {}, { reload: true });
      });
  }
}

export class HybridCallInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCallInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="servicesOverview.cards.hybridCall.title"></h4>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridCall.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
