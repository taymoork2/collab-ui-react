class HybridIMPActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridIMPActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridIMPActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridImp.title"></h4>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridImp.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="imp-service.settings">Configure</a></p>
        <p><span>Resources</span></p>
        <p><a ui-sref="imp-service.list">View all</a></p>
      </div>
      <div class="active-card_footer">
        <a ui-sref="imp-service.list">
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
