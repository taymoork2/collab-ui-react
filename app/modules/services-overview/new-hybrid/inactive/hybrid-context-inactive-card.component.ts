class HybridContextInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public openSetUp(): void {
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
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
