class HybridDataSecurityActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridDataSecurityActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridDataSecurityActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridDataSecurity.title"></h4>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridDataSecurity.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="hds.settings">Configure</a></p>
        <p><span>Resources</span></p>
        <p><a ui-sref="hds.list">View all</a></p>
      </div>
      <div class="active-card_footer">
        <a ui-sref="hds.list">
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
