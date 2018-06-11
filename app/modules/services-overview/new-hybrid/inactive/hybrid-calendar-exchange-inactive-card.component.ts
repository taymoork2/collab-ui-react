import { IToolkitModalService } from 'modules/core/modal';

class HybridCalendarExchangeInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
  ) {}

  public openPrerequisites(): void {
    this.$modal.open({
      controller: 'HybridCalendarPrerequisitesController',
      controllerAs: 'vm',
      template: require('modules/services-overview/new-hybrid/prerequisites-modals/hybrid-calendar-prerequisites/hybrid-calendar-prerequisites.html'),
    });
  }

  public openSetUp(): void {
    this.$modal.open({
      resolve: {
        connectorType: () => 'c_cal',
        serviceId: () => 'squared-fusion-cal',
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

export class HybridCalendarExchangeInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarExchangeInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <div class="inactive-card_logo"><img src="/images/hybrid-services/Microsoft_Exchange_logo_small.png" alt="{{::'servicesOverview.cards.hybridCalendar.exchangeTitle' | translate}}"></div>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
