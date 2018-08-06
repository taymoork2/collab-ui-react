import { ServicesOverviewCard, ICardButton } from '../shared/services-overview-card';

export class ServicesOverviewCallCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.call.buttons.numbers',
    routerState: this.Authinfo.isBroadCloud() ? 'bsft-numbers' : 'huronlines',
    buttonClass: 'btn-link',
  }];

  public getButtons(): ICardButton[] {
    if (this.active) {
      return this._buttons;
    }
    return [];
  }

  //Shows Locations tab when hI148 Feature toggle is enabled
  public hI1484FeatureToggleEventhandler(hasFeature: boolean) {
    if (hasFeature) {
      this._buttons.splice(0, 0, {
        name: 'servicesOverview.cards.call.buttons.locations',
        routerState: 'call-locations',
        buttonClass: 'btn-link',
      });

      const routeToLocationSettings = {
        name: 'servicesOverview.cards.call.buttons.settings',
        routerState: 'huronsettingslocation',
        buttonClass: 'btn-link',
      };
      const match = _.find(this._buttons, { name: 'servicesOverview.cards.call.buttons.settings' });
      if (match) {
        const index = _.indexOf(this._buttons, match);
        this._buttons.splice(index, 1, routeToLocationSettings);
      }
    }
  }

  // (ashutupa): Added this for Reports button on Call Card
  public sparkCallCdrReportingFeatureToggleEventhandler(hasFeature: boolean) {
    if (hasFeature) {
      this._buttons.push({
        name: 'servicesOverview.cards.call.buttons.records',
        routerState: 'huronrecords',
        buttonClass: 'btn-link',
      });
    }
  }

  /* @ngInject */
  public constructor(
    private Authinfo,
  ) {
    super({
      active: Authinfo.isAllowedState('huronsettings'),
      cardClass: 'cta-bar',
      description: 'servicesOverview.cards.call.description',
      icon: 'icon-circle-call',
      name: 'servicesOverview.cards.call.title',
    });
    if (this.Authinfo.hasCallLicense() && !this.Authinfo.isBroadCloud()) {
      this._buttons.push({
        name: 'servicesOverview.cards.call.buttons.features',
        routerState: 'huronfeatures',
        buttonClass: 'btn-link',
      });
    }

    if (!this.Authinfo.isBroadCloud()) {
      this._buttons.push({
        name: 'servicesOverview.cards.call.buttons.settings',
        routerState: 'huronsettings',
        buttonClass: 'btn-link',
      });
    } else {
      this._buttons.push({
        name: 'servicesOverview.cards.call.buttons.locations',
        routerState: 'call-locations', //to-do replace with bc location
        buttonClass: 'btn-link',
      });
    }

    this.loading = false;
  }
}
