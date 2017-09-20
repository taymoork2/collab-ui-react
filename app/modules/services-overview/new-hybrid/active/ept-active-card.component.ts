class EPTActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class EPTActiveCardComponent implements ng.IComponentOptions {
  public controller = EPTActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.privateTrunk.title"></h4>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.privateTrunk.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="private-trunk-overview.settings">Configure</a></p>
        <p><span>Resources</span></p>
        <p><a ui-sref="private-trunk-overview.list">View all</a></p>
        <p><span>Users</span></p>
        <p><a href><span class="badge badge--outline badge--round">X</span> users active</a></p>
      </div>
      <div class="active-card_footer">
        <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
        <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
