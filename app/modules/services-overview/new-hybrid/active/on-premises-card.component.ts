class OnPremisesCardController implements ng.IComponentController {
  public linkActive = false;

  /* @ngInject */
  constructor(
  ) {}

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.clusters && changes.clusters.currentValue) {
      this.linkActive = changes.clusters.currentValue.length > 0;
    }
    if (changes.trunks && changes.trunks.currentValue) {
      this.linkActive = this.linkActive || changes.trunks.currentValue.length > 0;
    }
  }
}

export class OnPremisesCardComponent implements ng.IComponentOptions {
  public controller = OnPremisesCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.clusterList.title"></h4>
      </div>
      <div class="active-card_content">
        <p class="active-card_textfix" translate="servicesOverview.cards.clusterList.description"></p>
        <div class="active-card_section" ng-if="$ctrl.linkActive">
          <div class="active-card_title" translate="servicesOverview.cards.clusterList.buttons.all"></div>
          <div class="active-card_action"><a ui-sref="cluster-list" translate="servicesOverview.cards.clusterList.buttons.view"></a></div>
        </div>
        <div class="active-card_section" ng-if="!$ctrl.linkActive">
          <div class="active-card_title" translate="servicesOverview.cards.clusterList.buttons.all"></div>
          <div class="active-card_action" translate="servicesOverview.cards.clusterList.buttons.none"></div>
        </div>
      </div>
    </article>
  `;
  public bindings = {
    clusters: '<',
    trunks: '<',
  };
}
