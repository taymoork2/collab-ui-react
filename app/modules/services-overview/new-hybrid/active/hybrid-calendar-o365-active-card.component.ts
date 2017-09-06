class HybridCalendarO365ActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridCalendarO365ActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarO365ActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span>[Office 365]</span>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="office-365-service.settings">Configure</a></p>
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
