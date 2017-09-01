class HybridCalendarExchangeActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridCalendarExchangeActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarExchangeActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span>[Exchange]</span>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="calendar-service.settings">Configure</a></p>
        <p><span>Resources</span></p>
        <p><a ui-sref="calendar-service.list">View all</a></p>
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
