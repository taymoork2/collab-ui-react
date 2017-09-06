class HybridCallActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridCallActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCallActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridCall.title"></h4>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridCall.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="call-service.settings">Configure</a></p>
        <p><span>Resources</span></p>
        <p><a ui-sref="call-service.list">View all</a></p>
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
