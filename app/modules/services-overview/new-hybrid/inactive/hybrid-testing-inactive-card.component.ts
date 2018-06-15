class HybridTestingInactiveCardController implements ng.IComponentController {
    /* @ngInject */
  constructor(
      private $state: ng.ui.IStateService,
    ) {}

  public openPrerequisites(): void {
  }

  public openSetUp(): void {
    this.$state.go('taas.suite');
  }
}

export class HybridTestingInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridTestingInactiveCardController;
  public template = `
      <article>
        <div class="inactive-card_header">
          <h4 translate="servicesOverview.cards.hybridTesting.title"></h4>
        </div>
        <div class="inactive-card_content">
          <p translate="servicesOverview.cards.hybridTesting.description"></p>
        </div>
        <div class="inactive-card_footer">
          <p><button class="btn btn--link" ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></button></p>
          <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
        </div>
      </article>
    `;
}
