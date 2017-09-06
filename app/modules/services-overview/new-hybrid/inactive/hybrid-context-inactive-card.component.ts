class HybridContextInactiveCardController implements ng.IComponentController {
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
      message: '¯\_(ツ)_/¯',
      close: this.$translate.instant('common.close'),
    });
  }

  public openSetUp(): void {
    // TODO: open directly the modal that could be opened from the `context-resources` page?
    this.$state.go('context-resources');
  }
}

export class HybridContextInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridContextInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header">
       <h4 translate="servicesOverview.cards.hybridContext.title"></h4>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridContext.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><a href ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></a></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
