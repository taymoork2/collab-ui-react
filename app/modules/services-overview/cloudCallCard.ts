import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCallCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: ICardButton[] = [{
    name: 'servicesOverview.cards.call.buttons.numbers',
    routerState: 'huronlines',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.call.buttons.settings',
    routerState: 'huronsettings',
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
        routerState: 'calllocations',
        buttonClass: 'btn-link',
      });
    }
  }

  // TODO (jlowery): remove when sparkCallTenDigitExt feature toggle is removed.
  public sparkCallTenDigitExtFeatureToggleEventhandler(hasFeature: boolean) {
    if (hasFeature) {
      const routeToNewSettings = {
        name: 'servicesOverview.cards.call.buttons.settings',
        routerState: 'huronsettingsnew',
        buttonClass: 'btn-link',
      };
      const match = _.find(this._buttons, { name: 'servicesOverview.cards.call.buttons.settings' });
      if (match) {
        const index = _.indexOf(this._buttons, match);
        this._buttons.splice(index, 1, routeToNewSettings);
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
  private showFeatureTab() {
    return this.Authinfo.getLicenses()
      .filter((license) => {
        return license.licenseType === this.Config.licenseTypes.COMMUNICATION;
      }).length > 0;
  }

  /* @ngInject */
  public constructor(
    private Authinfo,
    private Config,
  ) {
    super({
      active: Authinfo.isAllowedState('huronsettings'),
      cardClass: 'cta-bar',
      description: 'servicesOverview.cards.call.description',
      icon: 'icon-circle-call',
      name: 'servicesOverview.cards.call.title',
    });
    if (this.showFeatureTab()) {
      this._buttons.splice(1, 0, {
        name: 'servicesOverview.cards.call.buttons.features',
        routerState: 'huronfeatures',
        buttonClass: 'btn-link',
      });
    }
    this.loading = false;
  }
}
