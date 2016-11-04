import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCallCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.call.buttons.numbers',
      routerState: 'huronlines',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.call.buttons.settings',
      routerState: 'huronsettings',
      buttonClass: 'btn-link',
    },
  ];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [];
  }

  /* @ngInject */
  public constructor(Authinfo, FeatureToggleService, Config) {
    super({
      name: 'servicesOverview.cards.call.title',
      description: 'servicesOverview.cards.call.description',
      icon: 'icon-circle-call',
      active: Authinfo.isAllowedState('huronsettings'),
      cardClass: 'cta-bar',
    });
    this._loading = false;
    function showFeatureTab(pstnEnabled) {
      return Authinfo.getLicenses().filter(function (license) {
        return !pstnEnabled || (license.licenseType === Config.licenseTypes.COMMUNICATION);
      }).length > 0;
    }

    FeatureToggleService.supports(FeatureToggleService.features.csdmPstn)
      .then((pstnEnabled) => {
        if (showFeatureTab(pstnEnabled)) {
          this._buttons.splice(1, 0, { name: 'servicesOverview.cards.call.buttons.features', routerState: 'huronfeatures', buttonClass: 'btn-link' });
        }
      });
  }
}
