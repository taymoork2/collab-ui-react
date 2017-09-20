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
        <i class="icon icon-question-circle" tooltip="{{'servicesOverview.cards.hybridImp.description' | translate}}" tooltip-placement="bottom-right"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title">Service</div>
          <div class="active-card_action"><a ui-sref="imp-service.settings">Configure</a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title">Resources</div>
          <div class="active-card_action"><a ui-sref="imp-service.list">View all</a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="imp-service.list">
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
