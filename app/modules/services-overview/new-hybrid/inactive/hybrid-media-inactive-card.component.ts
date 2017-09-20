class HybridMediaInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private ModalService,
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
    this.$state.go('media-service-v2.list');
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
        <!-- <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p> -->
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
