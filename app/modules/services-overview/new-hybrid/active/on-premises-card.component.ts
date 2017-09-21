class OnPremisesActiveCardController implements ng.IComponentController {
  public activeLink = false;

  /* @ngInject */
  constructor(
  ) {}

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.clusters && changes.clusters.currentValue) {
      this.activeLink = changes.clusters.currentValue.length > 0;
    }
  }
}

export class OnPremisesActiveCardComponent implements ng.IComponentOptions {
  public controller = OnPremisesActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.clusterList.title"></h4>
      </div>
      <div class="active-card_content">
        <p class="active-card_textfix" translate="servicesOverview.cards.clusterList.description"></p>
        <div class="active-card_section" ng-if="$ctrl.activeLink">
          <div class="active-card_title" translate="servicesOverview.cards.clusterList.buttons.all"></div>
          <div class="active-card_action"><a ui-sref="cluster-list">View</a></div>
        </div>
        <div class="active-card_section" ng-if="!$ctrl.activeLink">
          <div class="active-card_title" translate="servicesOverview.cards.clusterList.buttons.all"></div>
          <div class="active-card_action" translate="servicesOverview.cards.clusterList.buttons.none"></div>
        </div>
      </div>
    </article>
  `;
  public bindings = {
    clusters: '<',
  };
}
