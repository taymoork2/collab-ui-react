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
        <p translate="servicesOverview.cards.clusterList.description"></p>
        <ul>
          <li ng-if="$ctrl.activeLink"><a ui-sref="cluster-list" translate="servicesOverview.cards.clusterList.buttons.all"></a></li>
          <li ng-if="!$ctrl.activeLink" translate="servicesOverview.cards.clusterList.buttons.none"></li>
        </ul>
      </div>
    </article>
  `;
  public bindings = {
    clusters: '<',
  };
}
