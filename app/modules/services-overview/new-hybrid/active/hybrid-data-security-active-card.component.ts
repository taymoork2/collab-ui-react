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
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridDataSecurity.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="hds.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="hds.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
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
