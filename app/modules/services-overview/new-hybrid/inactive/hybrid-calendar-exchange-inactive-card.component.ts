import { IToolkitModalService } from 'modules/core/modal';

class HybridCalendarExchangeInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $modal: IToolkitModalService,
    private ModalService: IToolkitModalService,
  ) {}

  public openPrerequisites(): void {
    this.ModalService.open({
      hideDismiss: true,
      title: 'Not implemented yet',
      message: '🐻',
      close: this.$translate.instant('common.close'),
    });
  }

  public openSetUp(): void {
    this.$modal.open({
      resolve: {
        connectorType: () => 'c_cal',
        serviceId: () => 'squared-fusion-cal',
        firstTimeSetup: true,
      },
      controller: 'AddResourceController',
      controllerAs: 'vm',
      template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
      type: 'small',
    })
    .result
    .then((response) => {
      // TODO: refresh page
      window.console.info('success openSetUp Exchange', response);
    })
    .catch((error) => {
      window.console.error('error openSetUp Exchange', error);
    });
  }
}

export class HybridCalendarExchangeInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarExchangeInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <div class="inactive-card_logo"><img src="/images/hybrid-services/Microsoft_Exchange_logo_small.png" alt="{{::servicesOverview.cards.hybridCalendar.exchangeTitle | translate}}"></div>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
      </div>
      <div class="inactive-card_footer">
        <!-- <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p> -->
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
