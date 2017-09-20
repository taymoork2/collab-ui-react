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
        <i class="icon icon-question-circle" tooltip="{{'servicesOverview.cards.hybridDataSecurity.description' | translate}}" tooltip-placement="bottom-right"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title">Service</div>
          <div class="active-card_action"><a ui-sref="hds.settings">Configure</a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title">Resources</div>
          <div class="active-card_action"><a ui-sref="hds.list">View all</a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="hds.list">
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
