import { IToolkitModalService } from 'modules/core/modal';

class HybridIMPInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
  ) {}

  public openSetUp(): void {
    this.$modal.open({
      resolve: {
        connectorType: () => 'c_imp',
        serviceId: () => 'spark-hybrid-impinterop',
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

export class HybridIMPInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridIMPInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
        <h4 translate="servicesOverview.cards.hybridImp.title"></h4>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridImp.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
