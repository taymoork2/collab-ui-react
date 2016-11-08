import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCallCard extends ServicesOverviewCard {
  private Authinfo;

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
      return this._buttons;
    }
    return [];
  }

  public csdmPstnFeatureToggleEventHandler(pstnEnabled: boolean) {
    if (!pstnEnabled || (!this.Authinfo.isDeviceMgmt() || this.Authinfo.isSquaredUC())) {
      this._buttons.splice(1, 0, {
        name: 'servicesOverview.cards.call.buttons.features',
        routerState: 'huronfeatures',
        buttonClass: 'btn-link',
      });
    }
    this.loading = false;
  }

  /* @ngInject */
  public constructor(Authinfo) {
    super({
      name: 'servicesOverview.cards.call.title',
      description: 'servicesOverview.cards.call.description',
      icon: 'icon-circle-call',
      active: Authinfo.isAllowedState('huronsettings'),
      cardClass: 'cta-bar',
    });
    this.Authinfo = Authinfo;
  }
}
