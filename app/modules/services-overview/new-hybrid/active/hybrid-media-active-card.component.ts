class HybridMediaActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridMediaActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridMediaActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridMedia.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridMedia.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'servicesOverview.cards.hybridMedia.description' | translate}}"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="media-service-v2.list" translate="servicesOverview.cards.shared.viewAll"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action"><a ui-sref="media-service-v2.settings" translate="servicesOverview.cards.shared.configure"></a></div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="media-service-v2.list" class="active-card_footer_status-link">
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
        </a>
        <a ng-if="$ctrl.hasEventsHistoryFeatureToggle" ui-sref="hybrid-services-event-history-page({serviceId: 'squared-fusion-media'})" class="active-card_footer_events-link">
          <span>Events</span>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    hasEventsHistoryFeatureToggle: '<',
    serviceStatus: '<',
  };
}
