class HybridCalendarGoogleActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HybridCalendarGoogleActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarGoogleActiveCardController;
  public template = `
    <article>
      <div class="active-card_header card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span><img src="/images/hybrid-services/Google_Calendar_logo_small.png" alt="{{::servicesOverview.cards.hybridCalendar.googleTitle | translate}}"></span>
      </div>
      <div class="active-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
        <p><span>Service</span></p>
        <p><a ui-sref="google-calendar-service.settings">Configure</a></p>
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
