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
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.privateTrunk.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'servicesOverview.cards.privateTrunk.description' | translate}}"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="private-trunk-overview.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="private-trunk-overview.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
        </div>
      </div>
      <div class="active-card_footer" style="display:none">
        <a ui-sref="private-trunk-overview.list" class="active-card_footer_status-link">
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
